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
    facetNames: contractRecord[]
    }
  
// Expression régulière pour détecter une adresse ETH 
const regex = '^(0x)?[0-9a-fA-F]{40}$';

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

    // deploy DiamondCutFacet
    var diamondCutFacet;
    const CutName : string = (diamonds.DiamondCutFacet.name || "DiamondCutFacet");
    if ("address" in diamonds.DiamondCutFacet && String(diamonds.DiamondCutFacet.address).match(regex)) {
        diamondCutFacet = await hre.viem.getContractAt(
            CutName,
            (<Address>diamonds.DiamondCutFacet.address)
          );        
        console.log(`Retrieve ${CutName} @: ${diamondCutFacet.address}`);    
        }
    else {
        if ("action" in diamonds.DiamondCutFacet && diamonds.DiamondCutFacet.action < FacetCutAction.Remove) {
            diamondCutFacet = await hre.viem.deployContract( CutName );
            console.log(`Add/Replace ${CutName} @: ${diamondCutFacet.address}`);    
            }
        else throw new Error(`Incompatible Action for ${CutName} & address recorded`);
        }

    // deploy Diamond
    var diamond;
    const diamName : string = (diamonds.Diamond.name || "Diamond");
    if ("address" in diamonds.Diamond && String(diamonds.Diamond.address).match(regex)) {
        diamond = await hre.viem.getContractAt(
            diamName,
            (<Address>diamonds.Diamond.address)
          );        
        console.log(`Retrieve ${diamName} @: ${diamond.address}`);    
        }
    else {
        if ("action" in diamonds.Diamond && diamonds.Diamond.action < FacetCutAction.Remove) {
            diamond = await hre.viem.deployContract( diamName, [
                deployWallet.account.address,
                diamondCutFacet.address
                ]);
            console.log(`Add/Replace ${diamName} @: ${diamond.address}`);    
            }
        else throw new Error(`Incompatible Action for ${diamName} & address recorded`);
        }

    // si Remove => Adresse doit être zéro
    // si Add & Replace => Adresse doit être nouveau SC

    const cut = [];
    for (const facetName of diamonds.facetNames) {
        if ("name" in facetName) {
            const facet = await hre.viem.deployContract(facetName.name);
            console.log(`${facetName.name}: ${facet.address}`);
            cut.push({
                facetAddress: facet.address,
                action: facetName.action,
                functionSelectors: getSelectors(facet)
                });
            }
        }

    console.log("cut structure :", cut);

    const diamondInit = await hre.viem.deployContract("DiamondInit");
    console.log(`diamondInit: ${diamondInit.address}`);

    const diamondCut = await hre.viem.getContractAt("IDiamondCut", diamond.address);
    const initFunc = encodeFunctionData({
        abi: diamondInit.abi,
        functionName: "init",
        args: [ token.name, token.symbol ]
    });

    console.log("initFunc structure :", showObject(token));

    const { request } = await publicClient.simulateContract({
        address: diamond.address,
        abi: diamondCut.abi,
        functionName: "diamondCut",
        args: [
            cut,
            diamondInit.address,
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