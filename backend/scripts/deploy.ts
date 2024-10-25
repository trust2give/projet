import hre from "hardhat";
import { FacetCutAction, getSelectors } from "./utils/diamond";
import { Address, encodeFunctionData } from "viem";
import { showObject, regex, NULL_ADDRESS } from "./T2G_utils";

export type contractRecord = { 
    name?: string, 
    action?: number, 
    argInit?: boolean,
    addReader?: boolean,
    address?: string,
    beacon?: string
  }
  
export type diamondCore = {
    Stablecoin: contractRecord,
    Diamond: contractRecord,
    DiamondCutFacet: contractRecord,
    DiamondInit: contractRecord,
    DiamondLoupeFacet: contractRecord,
    facetNames: contractRecord[]
    }
  

export async function deployDiamond( diamonds: diamondCore, token: { name: string, symbol: string } ) {
    const publicClient = await hre.viem.getPublicClient();
    const [deployWallet] = await hre.viem.getWalletClients();

    var cut = [];

    var stablecoin; // on récupère l'instance stablecoin EurSC
    var diamond; // on récupère l'instance T2G_Root
    var diamondLoupe; // on récupère l'instance DiamonLoupeFacet
    var diamondCutFacet; // on récupère l'instance DiamondCutFacet
    var diamondInit;

    var initFunc = NULL_ADDRESS;
    var initAddress = NULL_ADDRESS;
    var stableName : string = (diamonds.Stablecoin.name || "EUR");
    var diamName : string = (diamonds.Diamond.name || "Diamond");
    var loupeName : string = (diamonds.DiamondLoupeFacet.name || "DiamondLoupeFacet");
    var CutName : string = (diamonds.DiamondCutFacet.name || "DiamondCutFacet");

    if (!("action" in diamonds.Stablecoin) &&  "address" in diamonds.Stablecoin && String(diamonds.Stablecoin.address).match(regex)) {
        stablecoin = await hre.viem.getContractAt(
            stableName,
            (<Address>diamonds.Stablecoin.address)
            );
        }
    else if ("action" in diamonds.Stablecoin 
        && diamonds.Stablecoin.action == FacetCutAction.Add 
        && !String(diamonds.Stablecoin.address).match(regex)) {
            stablecoin = await hre.viem.deployContract( stableName );

        console.log(`Add ${stableName} @: ${stablecoin.address}`);        
        }

    if (!("action" in diamonds.Diamond) &&  "address" in diamonds.Diamond && String(diamonds.Diamond.address).match(regex)) {
        // il y a une instance existante On récupère les informations 
        diamond = await hre.viem.getContractAt(
            diamName,
            (<Address>diamonds.Diamond.address)
            );

        // On récupère le beacon de T2G_Root
        let beacon = await diamond.read.beacon_T2G_Root();
        console.log(`Retrieve ${diamName} @: ${diamond.address} : ${beacon}`);    

        diamondCutFacet = await hre.viem.getContractAt(
            CutName,
            (<Address>diamonds.Diamond.address)
          );
        console.log(`Retrieve ${CutName} @: ${diamondCutFacet.address}`);    
        
        diamondLoupe = await hre.viem.getContractAt(
            loupeName,
            (<Address>diamonds.Diamond.address)
          );

        // On récupère le beacon de DiamondLoupeFacet
        beacon = await diamondLoupe.read.beacon_DiamondLoupeFacet();
        console.log(`Retrieve ${loupeName} @: ${diamondLoupe.address} : ${beacon}`);    

        //var facets = await diamondLoupe.read.facets();
        //console.log(`Retrieve ${loupeName} @: ${diamondLoupe.address} :`, facets);    
        }
    else if ("action" in diamonds.Diamond 
            && diamonds.Diamond.action == FacetCutAction.Add 
            && !String(diamonds.Diamond.address).match(regex)) {
        // On est dans le cas où on créé un nouveau T2G_Root
        diamondCutFacet = await hre.viem.deployContract( CutName );

        console.log(`Add ${CutName} @: ${diamondCutFacet.address}`);

        diamond = await hre.viem.deployContract( diamName, [
            deployWallet.account.address,
            diamondCutFacet.address
            ]);

        console.log(`Add ${diamName} @: ${diamond.address}`);    

        diamondLoupe = await hre.viem.deployContract( loupeName );

        console.log(`Add ${loupeName} @: ${diamondLoupe.address}`);    

        cut.push({
            facetAddress: diamondLoupe.address,
            action: diamonds.Diamond.action,
            functionSelectors: getSelectors(diamondLoupe)
            });
        
        diamondInit = await hre.viem.deployContract("DiamondInit");

        console.log(`Add DiamondInit @: ${diamondInit.address}`);    
    
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

    var facet;
    for (const facetName of diamonds.facetNames) {
        if ("name" in facetName && "action" in facetName) {
            if (facetName.action == FacetCutAction.Remove) {
                facet = await hre.viem.getContractAt(
                    facetName.name,
                    (<Address>diamonds.Diamond.address)
                );        
                console.log(`${facetName.name} - Action ${facetName.action} @: ${diamond.address}`);    
                cut.push({
                    facetAddress: NULL_ADDRESS,
                    action: facetName.action,
                    functionSelectors: getSelectors(facet)
                    });    
                }
            else if (facetName.action == FacetCutAction.Add || facetName.action == FacetCutAction.Replace) {
                if (facetName.argInit) {
                    facet = await hre.viem.deployContract(
                        facetName.name, 
                        [ diamond.address ],
                        {
                            client: { wallet: deployWallet },
                            //gas: 1000000,
                            //value: parseEther("0.0001"),
                            //confirmations: 1, // 1 by default
                        });
                    }
                else {
                    facet = await hre.viem.deployContract(facetName.name);
                    }

                const eventLogs = await  publicClient.getContractEvents({
                    abi: facet.abi,
                    address: (<Address>facet.address),
                    })
                    
                for ( const event of eventLogs) {
                    console.log (" >> Event ".concat( event.eventName, "[ ", Object.values(event.args).join("| "), " ]" ));                
                    }

                }
            else throw new Error(`Incompatible Action ${facetName.action} for ${facetName.name} & address recorded`);

            //const readBeacon = await facet.read[facetName.beacon]();
            //const readAddress : Address | string = (facetName.addReader) ? await facet.read["get_".concat(facetName.name)]() : "No Address";
            //console.log(`Deployed ${facetName.name} @: ${readAddress} : ${readBeacon}`);                      
                      
                // Modele de fonction
                /*const contractA = await hre.viem.deployContract(
                    "contractName",
                    ["arg1", 50, "arg3"],
                    {
                      client: { wallet: secondWalletClient }
                      gas: 1000000,
                      value: parseEther("0.0001"),
                      confirmations: 5, // 1 by default
                    }
                  );*/

                console.log(`${facetName.name} - Action ${facetName.action} @: ${diamond.address}`);    
                cut.push({
                    facetAddress: facet.address,
                    action: facetName.action,
                    functionSelectors: getSelectors(facet)
                    });
                }
            }

    const diamondCut = await hre.viem.getContractAt("IDiamondCut", diamond.address);

    console.log("initFunc structure :", showObject(token), cut);

    const { request } = await publicClient.simulateContract({
        address: diamond.address,
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

    // On vérifie que les beacons de chaque facet sont bien actifs
    for (const facetName of diamonds.facetNames) {
        if ("name" in facetName) {
            facet = await hre.viem.getContractAt(
                facetName.name,
                (<Address>diamonds.Diamond.address)
                );        
            // On récupère le beacon de DiamondLoupeFacet
            if ("beacon" in facetName) {
                if (!("action" in facetName)) {
                    //if ("action" in facetName && facetName.action < FacetCutAction.Remove)) {
                        const beacon = await facet.read[facetName.beacon]();
                        console.log(`Retrieve ${facetName.name} @: ${facet.address} : ${beacon}`);    
                        }
                    //} 
                }
            }
        }

    console.log(`Transaction Hash : ${tx}`);

    return diamond.address;
}