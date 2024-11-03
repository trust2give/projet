import hre from "hardhat";
import { diamondNames } from "./T2G_Data";
import { Address } from "viem";

/// npx hardhat node
/// npx hardhat run .\scripts\ReadContract.ts --network localhost

// Expression régulière pour détecter une adresse ETH 
const regex = '^(0x)?[0-9a-fA-F]{40}$';
const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

export type readRecord = { 
    contract: string, 
    function: string, 
    args?: Array<any>
  }
  
const readList : readRecord[] = [
    { contract: "OwnershipFacet", function: "owner", args: [] },
    { contract: "MintFacet", function: "balanceOf", args: [] },
    { contract: "ERC721Facet", function: "ownerOf", args: [ 1 ] },
    { contract: "ERC721Facet", function: "totalSupply", args: [] },
    { contract: "ERC721Facet", function: "contractURI", args: [] },
    { contract: "ERC721Facet", function: "name", args: [] },
    { contract: "ERC721Facet", function: "symbol", args: [] }
    ]

async function main() {
    console.log("Enter ReadContract app")
    //const accounts = await hre.ethers.getSigners();
    //for (const account of accounts) {
    //  console.log(account.address);
    //  }

    var facet;
    for (const readItem of readList) {
        const facet = await hre.viem.getContractAt(
            readItem.contract,
            (<Address>diamondNames.Diamond.address)
            );
        // On récupère le beacon de T2G_Root
        let beacon = await facet.read[readItem.function]( readItem.args );
        console.log(`Read ${readItem.contract}[@:${facet.address}]:${readItem.function} : ${beacon}`);            
        }
    }
  
  main().catch((error) => {
    console.error("Erreur", error);
    process.exitCode = 1;
  });