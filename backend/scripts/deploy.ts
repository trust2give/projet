import hre from "hardhat";
import { FacetCutAction, getSelectors } from "./utils/diamond";
import { Address, encodeFunctionData } from "viem";
import { colorOutput, regex, NULL_ADDRESS, cutRecord, contractRecord, diamondCore } from "./T2G_utils";


export async function getOrDeployContract( contract : contractRecord, name: string, action: FacetCutAction | undefined ) : Promise<Address> {
    if (action == undefined) {
        if (String(contract.address).match(regex)) return (await hre.viem.getContractAt( name, (<Address>contract.address) )).address;
        else throw("Wrong address format for EUR Contract ".concat(contract.address));
        }
    else if (action != <FacetCutAction>FacetCutAction.Remove) {
        const instance = (await hre.viem.deployContract( name ));
        colorOutput(`Add ${name} @: ${instance.address}`, "magenta");        
        return instance.address;
        }
    else throw("Wrong action for EUR Contract ".concat(contract.address));
    }

export async function deployLoupeDiamond( diamonds: diamondCore, action: FacetCutAction, cut: cutRecord[] ) : Promise<Array<any>> { 
    var diamondLoupe; // on récupère l'instance DiamonLoupeFacet
    var loupeName : string = (diamonds.DiamondLoupeFacet.name || "DiamondLoupeFacet");

    switch (action) {
        case (FacetCutAction.Replace): {
            colorOutput(`Replace ${loupeName} @: ${diamonds.DiamondLoupeFacet.address}`, "magenta");    
            } 
        case (FacetCutAction.Add): {
            colorOutput(`Add ${loupeName} @: ${diamonds.DiamondLoupeFacet.address}`, "magenta");    

            diamondLoupe = await hre.viem.deployContract( loupeName );                
            break;
            } 
        default:
            throw("wrong action for DiamondLoupeFacet");
        }

    cut.push({
        facetAddress: diamondLoupe.address,
        action: action,
        functionSelectors: getSelectors(diamondLoupe)
        });

    return cut;    
    }


export async function deployDiamond( diamonds: diamondCore, token: { name: string, symbol: string } ) : Promise<Array<any>> {
    const [deployWallet] = await hre.viem.getWalletClients();
    
    var diamond; // on récupère l'instance T2G_Root
    var diamondCutFacet; // on récupère l'instance DiamondCutFacet
    var diamondInit;

    var CutName : string = (diamonds.DiamondCutFacet.name || "DiamondCutFacet");

    var initFunc = NULL_ADDRESS;
    var initAddress = NULL_ADDRESS;

    var diamName : string = (diamonds.Diamond.name || "Diamond");

    // On est dans le cas où on créé un nouveau T2G_Root

    diamondCutFacet = await hre.viem.deployContract( CutName );

    colorOutput(`Add ${CutName} @: ${diamondCutFacet.address}`, "magenta");

    diamond = await hre.viem.deployContract( diamName, [
        deployWallet.account.address,
        diamondCutFacet.address
        ]);

    colorOutput(`Add ${diamName} @: ${diamond.address}`, "magenta");    
    
    diamondInit = await hre.viem.deployContract("DiamondInit");

    colorOutput(`Add DiamondInit @: ${diamondInit.address}`, "magenta");    

    initFunc = encodeFunctionData({
        abi: diamondInit.abi,
        functionName: "init",
        args: [ token.name, token.symbol, diamond.address ]
        });

    initAddress = diamondInit.address;

    return [diamond.address, diamondCutFacet.address, initFunc, initAddress ]
    }



export async function deployFacets( diamond: Address , name: string, action: FacetCutAction, constructor: boolean,  cut: cutRecord[]  ) : Promise<cutRecord[]> {
    const publicClient = await hre.viem.getPublicClient();
    const [deployWallet] = await hre.viem.getWalletClients();

    var facet;
    switch (action) {
        case FacetCutAction.Remove: {
            facet = await hre.viem.getContractAt( <string>name, (diamond) );        
            cut.push({ facetAddress: NULL_ADDRESS, action: action, functionSelectors: getSelectors(facet) });
            break;
            }
        case FacetCutAction.Add:
        case FacetCutAction.Replace: {
            if (constructor) {
                facet = await hre.viem.deployContract( <string>name, [ diamond ], { client: { wallet: deployWallet }, });
                }
            else {
                facet = await hre.viem.deployContract(<string>name);
                }

            cut.push({ facetAddress: facet.address, action: action, functionSelectors: getSelectors(facet) });
            break;
            }
        case undefined: {
            return cut;
            }
        default: {
            throw new Error(`Incompatible Action ${action} for ${name} & address recorded`);
            }
        }

    colorOutput(`${name} - Action ${action} @: ${diamond}`, "green");    

    const eventLogs = await  publicClient.getContractEvents({
        abi: facet.abi,
        address: (<Address>facet.address),
        })
                    
    colorOutput( "[".concat( eventLogs.map((event) => {
        return " >> Event ".concat( event.eventName, "[ ", Object.values(event.args).join("| "), " ]" );
        }).join("\n"), "]" ), "yellow");

    return cut;
    }

export async function deployWithDiamondCut( diamondAddress: Address, cut : cutRecord[], initFunc: `0x${string}`, initAddress: Address ) : Promise<Address> {
    const publicClient = await hre.viem.getPublicClient();
    const [deployWallet] = await hre.viem.getWalletClients();

    const diamondCut = await hre.viem.getContractAt("IDiamondCut", diamondAddress);

    //console.log("initFunc structure :", cut);

    const { request } = await publicClient.simulateContract({
        address: diamondAddress,
        abi: diamondCut.abi,
        functionName: "diamondCut",
        args: [
            cut,
            initAddress,
            initFunc
            ]
        });

    const tx = await deployWallet.writeContract(request);
    await publicClient.waitForTransactionReceipt({ hash: tx });

    colorOutput(`Transaction Hash : ${tx}`, "green");

    return diamondAddress;
    }
