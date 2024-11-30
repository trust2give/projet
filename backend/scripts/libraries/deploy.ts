import hre from "hardhat";
import { Address, encodeFunctionData } from "viem";
import { FacetCutAction, getSelectors } from "../utils/diamond";
import { regex, NULL_ADDRESS, cutRecord, contractRecord, diamondCore } from "../libraries/types";
import { diamondNames, tokenCredential, contractSet, facetNames } from "../T2G_Data";
import { colorOutput, displayAccountTable } from "../libraries/format";


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

export async function deployLoupeDiamond( action: FacetCutAction, cut: cutRecord[] ) : Promise<Array<any>> { 
    var diamondLoupe; // on récupère l'instance DiamonLoupeFacet
    var loupeName : string = (diamondNames.DiamondLoupeFacet.name || "DiamondLoupeFacet");

    switch (action) {
        case (FacetCutAction.Replace): {
            colorOutput(`Replace ${loupeName} @: ${diamondNames.DiamondLoupeFacet.address}`, "magenta");    
            } 
        case (FacetCutAction.Add): {
            colorOutput(`Add ${loupeName} @: ${diamondNames.DiamondLoupeFacet.address}`, "magenta");    

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


export async function deployDiamond() : Promise<any> {
    const [deployWallet] = await hre.viem.getWalletClients();
    
    var diamond; // on récupère l'instance T2G_Root
    var diamondCutFacet; // on récupère l'instance DiamondCutFacet
    var diamondInit;

    var CutName : string = (diamondNames.DiamondCutFacet.name || "DiamondCutFacet");

    var initFunc = NULL_ADDRESS;
    var diamName : string = (diamondNames.Diamond.name || "Diamond");

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

    diamondNames.Diamond.address = diamond.address;
    diamondNames.DiamondCutFacet.address = diamondCutFacet.address;
    diamondNames.DiamondInit.address = diamondInit.address;

    return encodeFunctionData({
        abi: diamondInit.abi,
        functionName: "init",
        args: [ tokenCredential.name, tokenCredential.symbol, diamond.address ]
        });
    }


// Function used to deploy a specific smart contract facets "name"
// Behavior depends on action value : Add, Replace or Remove from the diamond smart contract
// Constructor represents the possible inputs array to pass to the constructor, mainly addresses of either Diamond Root (_root) or StableCoin Smart Contract (_stableCoin)
// Adds up the eventual changes to apply to the diamond architecture through the cut[] array
// Return the cut[] to pass to DiamondCutFacet smart contract
export async function deployFacets( name: string, action: FacetCutAction, constructor: Array<any>,  cut: cutRecord[]  ) : Promise<cutRecord[]> {
    const publicClient = await hre.viem.getPublicClient();
    const [deployWallet] = await hre.viem.getWalletClients();

    var facet;
    switch (action) {
        case FacetCutAction.Remove: {
            facet = await hre.viem.getContractAt( <string>name, (diamondNames.Diamond.address) );        
            cut.push({ facetAddress: NULL_ADDRESS, action: action, functionSelectors: getSelectors(facet) });
            break;
            }
        case FacetCutAction.Add:
        case FacetCutAction.Replace: {
            //console.log("args deploy", constructor, name, deployWallet );
            if (constructor.length > 0) {
                facet = await hre.viem.deployContract( <string>name, constructor, { client: { wallet: deployWallet }, });
                }
            else {
                facet = await hre.viem.deployContract(<string>name);
                }

            cut.push({ facetAddress: facet.address, action: action, functionSelectors: getSelectors(facet) });

            //console.log("args deploy", cut );

            break;
            }
        case undefined: {
            return cut;
            }
        default: {
            throw new Error(`Incompatible Action ${action} for ${name} & address recorded`);
            }
        }

    colorOutput(`${name} - Action ${action} @: ${diamondNames.Diamond.address}`, "green");    

    const eventLogs = await  publicClient.getContractEvents({
        abi: facet.abi,
        address: (<Address>facet.address),
        })
                    
    colorOutput( "[".concat( eventLogs.map((event) => {
        return " >> Event ".concat( event.eventName, "[ ", Object.values(event.args).join("| "), " ]" );
        }).join("\n"), "]" ), "yellow");

    return cut;
    }

export async function deployWithDiamondCut( cut : cutRecord[], initFunc: `0x${string}`, initAddress: Address ) : Promise<Address> {
    const publicClient = await hre.viem.getPublicClient();
    const [deployWallet] = await hre.viem.getWalletClients();

    const diamondCut = await hre.viem.getContractAt("IDiamondCut", diamondNames.Diamond.address);

    //console.log("initFunc structure :", cut);

    const { request } = await publicClient.simulateContract({
        address: diamondNames.Diamond.address,
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

    return diamondNames.Diamond.address;
    }
