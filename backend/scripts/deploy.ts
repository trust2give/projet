import hre from "hardhat";
import { FacetCutAction, getSelectors } from "./utils/diamond";
import { Address, encodeFunctionData } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

//import { shouldBehaveLikeERC721 } from "./erc721.behavior";

type ETHaddress<Pattern extends string> = `${string & { __brand: Pattern }}`;

export type contractRecord = { 
    name?: string, 
    action?: number, 
    address?: string
  }
  
export type diamondCore = {
    Diamond: contractRecord,
    DiamondCutFacet: contractRecord,
    DiamondInit: contractRecord,
    DiamondLoupeFacet: contractRecord,
    facetNames: contractRecord[]
    }
  
// Expression régulière pour détecter une adresse ETH 
const regex = '^(0x)?[0-9a-fA-F]{40}$';
const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

export function showObject( data: any, eol: boolean = false ) {
    var label: string = "";
    if (data == null) return "Object::Null";
    for (const [key, value] of Object.entries(data)) {
        const t = typeof value;
        const ret = eol ? `\n` : "";
        switch (t) {
            case "number":
            case "string":
            case "bigint": label += `${key} ${t.slice(0,1)}: ${value} ${ret}`; break;
            case "boolean": label += `${key} : ${value ? "TRUE" : "FALSE" } ${ret}`; break;
            case "object":
                if (Array.isArray(value)) {
                    const tab = value.reduce((accumulator, currentValue) => { 
                        return `${accumulator} ${typeof(currentValue) === "object" ? showObject(currentValue, false) : currentValue} |` }, "|") 
                    label += `${key}[Arr] : ${tab} ${ret}`;
                    }
                else label += showObject( value );
                break;
            default:
            }
        }
    return label;
    }

export async function deployDiamond( diamonds: diamondCore, token: { name: string, symbol: string } ) {
    const publicClient = await hre.viem.getPublicClient();
    const [deployWallet] = await hre.viem.getWalletClients();

    var cut = [];

    var diamond; // on récupère l'instance T2G_Root
    var diamondLoupe; // on récupère l'instance DiamonLoupeFacet
    var diamondCutFacet; // on récupère l'instance DiamondCutFacet
    var diamondInit;

    var initFunc = NULL_ADDRESS;
    var initAddress = NULL_ADDRESS;
    var diamName : string = (diamonds.Diamond.name || "Diamond");
    var loupeName : string = (diamonds.DiamondLoupeFacet.name || "DiamondLoupeFacet");
    var CutName : string = (diamonds.DiamondCutFacet.name || "DiamondCutFacet");

    if (!("action" in diamonds.Diamond) &&  "address" in diamonds.Diamond && String(diamonds.Diamond.address).match(regex)) {
        // il y a une instance existante
        // On récupère les informations 
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

        var facets = await diamondLoupe.read.facets();
        console.log(`Retrieve ${loupeName} @: ${diamondLoupe.address} :`, facets);    
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
            args: [ token.name, token.symbol ]
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
                if ("address" in facetName && String(facetName.address).match(regex)) {
                    facet = await hre.viem.getContractAt(
                        facetName.name,
                        (<Address>facetName.address)
                      );        
                    console.log(`${facetName.name} - Action Remove @: ${diamond.address}`);    
                    cut.push({
                        facetAddress: NULL_ADDRESS,
                        action: facetName.action,
                        functionSelectors: getSelectors(facet)
                        });    
                    }
                }
            else if (facetName.action == FacetCutAction.Replace) {
                if ("address" in facetName && String(facetName.address).match(regex)) {
                    facet = await hre.viem.deployContract(facetName.name);
                    console.log(`${facetName.name} - Action ${facetName.action} @: ${facet.address}`);    
                    cut.push({
                        facetAddress: facet.address,
                        action: facetName.action,
                        functionSelectors: getSelectors(facet)
                        });
                    }
                }
            else if (facetName.action == FacetCutAction.Add) {
                if ("address" in facetName && !String(facetName.address).match(regex)) {
                    facet = await hre.viem.deployContract(facetName.name);
                    console.log(`${facetName.name} - Action ${facetName.action} @: ${facet.address}`);    
                    cut.push({
                        facetAddress: facet.address,
                        action: facetName.action,
                        functionSelectors: getSelectors(facet)
                        });
                    }
                }
            else throw new Error(`Incompatible Action ${facetName.action} for ${facetName.name} & address recorded`);
            }
        }

    const diamondCut = await hre.viem.getContractAt("IDiamondCut", diamond.address);

    console.log("initFunc structure :", showObject(token));

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

    console.log(`Transaction Hash : ${tx}`);

    return diamond.address;
}

/*main().catch((error) => {
    console.error("Erreur", error);
    process.exitCode = 1;
  });*/