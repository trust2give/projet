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
    diamondCutFacet: contractRecord,
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
    const CutName : string = (diamonds.diamondCutFacet.name || "diamondCutFacet");
    if (diamonds.diamondCutFacet.address && diamonds.diamondCutFacet.address.match(regex)) {
        diamondCutFacet = await hre.viem.getContractAt(
            CutName,
            (<Address>diamonds.diamondCutFacet.address)
          );        
        console.log(`Retrieve ${CutName} @: ${diamondCutFacet.address}`);    
        }
    else {
        console.log(`test ${diamonds.diamondCutFacet.action < FacetCutAction.Remove} @: ${diamonds.diamondCutFacet.action && diamonds.diamondCutFacet.action < FacetCutAction.Remove}`);    
        if (diamonds.diamondCutFacet.action) {
            if (diamonds.diamondCutFacet.action < FacetCutAction.Remove) {
                diamondCutFacet = await hre.viem.deployContract( CutName );
                console.log(`Add/Replace ${CutName} @: ${diamondCutFacet.address}`);    
                }
            else throw new Error(`Incompatible Action for ${CutName} & address recorded`);
            }
        else throw new Error(`Incompatible Action for ${CutName} & address recorded`);
        }

    // deploy Diamond
    const diamond = await hre.viem.deployContract("T2G_root", [
        deployWallet.account.address,
        diamondCutFacet.address
    ]);
    console.log(`T2G_root: ${diamond.address}`);

    const diamondInit = await hre.viem.deployContract("DiamondInit");
    console.log(`diamondInit: ${diamondInit.address}`);

    const cut = [];
    for (const facetName of facets) {
        const facet = await hre.viem.deployContract(facetName.name);
        console.log(`${showObject(facetName)}: ${facet.address}`);
        cut.push({
            facetAddress: facet.address,
            action: facetName.action,
            functionSelectors: getSelectors(facet)
            });
        }

    //console.log("cut structure :", cut);

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