const hre = require("hardhat");
import { rwType, Account, Value, Typeoftoken, Statusoftoken, rwRecord, InteractWithContracts } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Diamond Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractDiamond.ts --network localhost

const rwList : rwRecord[] = [
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "beacon_DiamondLoupeFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facets", args: [], label: "Facets", outcome: [ "array"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facetAddresses", args: [], label: "Facet Addresses", outcome: [ "array"] }
    //{ rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "owner", args: [], label: "@owner of T2G Diamond", outcome: [ "address"] },
    //{ rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "ownerOf", args: [ Value.TokenId ], loopTokenId: [4,5,6,7], label: "@owner of Honey Token", outcome: [ "address"] }
    ]

async function main() {
    console.log("Enter T2G_InteractDiamond Application")
    await InteractWithContracts(rwList);
    }

main().catch((error) => {
  console.error("Erreur", error);
  process.exitCode = 1;
});