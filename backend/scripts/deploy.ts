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


export async function deployDiamond( diamonds: diamondCore, action: FacetCutAction, token: { name: string, symbol: string }, cut: cutRecord[] ) : Promise<Array<any>> {
    const publicClient = await hre.viem.getPublicClient();
    const [deployWallet] = await hre.viem.getWalletClients();

    var diamond; // on récupère l'instance T2G_Root
    var diamondLoupe; // on récupère l'instance DiamonLoupeFacet
    var diamondCutFacet; // on récupère l'instance DiamondCutFacet
    var diamondInit;

    var initFunc = NULL_ADDRESS;
    var initAddress = NULL_ADDRESS;

    var diamName : string = (diamonds.Diamond.name || "Diamond");
    var loupeName : string = (diamonds.DiamondLoupeFacet.name || "DiamondLoupeFacet");
    var CutName : string = (diamonds.DiamondCutFacet.name || "DiamondCutFacet");

    if (action == FacetCutAction.Add) {
        // On est dans le cas où on créé un nouveau T2G_Root
        diamondCutFacet = await hre.viem.deployContract( CutName );

        colorOutput(`Add ${CutName} @: ${diamondCutFacet.address}`, "magenta");

        diamond = await hre.viem.deployContract( diamName, [
            deployWallet.account.address,
            diamondCutFacet.address
            ]);

        colorOutput(`Add ${diamName} @: ${diamond.address}`, "magenta");    

        diamondLoupe = await hre.viem.deployContract( loupeName );

        colorOutput(`Add ${loupeName} @: ${diamondLoupe.address}`, "magenta");    

        cut.push({
            facetAddress: diamondLoupe.address,
            action: action,
            functionSelectors: getSelectors(diamondLoupe)
            });
        
        diamondInit = await hre.viem.deployContract("DiamondInit");

        colorOutput(`Add DiamondInit @: ${diamondInit.address}`, "magenta");    
    
        initFunc = encodeFunctionData({
            abi: diamondInit.abi,
            functionName: "init",
            args: [ token.name, token.symbol, diamond.address ]
        });

        initAddress = diamondInit.address;
        }
    else throw new Error(`Incompatible Action for ${diamName} & address recorded`);

    // si Remove => Adresse doit être zéro
    // si Add & Replace => Adresse doit être nouveau SC (condition : une @ existante (replace) ou pas (Add))
    // Partie à compléter : Franck - 20240930
    return [diamond.address, initFunc, initAddress, cut ]
    }



export async function deployFacets( diamond: Address , name: string, action: FacetCutAction, constructor: boolean, cut: cutRecord[]  ) : Promise<cutRecord[]> {
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



export async function getBeacons( facetNames: contractRecord[], diamondAddress: Address ) {
    // On vérifie que les beacons de chaque facet sont bien actifs
    for (const facetName of facetNames) {
        const facet = await hre.viem.getContractAt(
            <string>facetName.name,
            diamondAddress
            );        
        // On récupère le beacon de DiamondLoupeFacet
        if (typeof facetName == "string") {
            //if (!("action" in facetName)) {
                //if ("action" in facetName && facetName.action < FacetCutAction.Remove)) {
                    const beacon = await facet.read[<string>facetName.beacon]();
                    console.log(`Retrieve ${facetName.name} @: ${facet.address} : ${beacon}`);    
                    }
                //} 
            //}
        }
    }
