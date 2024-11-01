const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import { InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";
import * as readline from 'readline';
import { colorOutput, Account, Value, NULL_ADDRESS, rwRecord, rwType } from "./T2G_utils";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Diamond Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractDiamond.ts --network localhost

export const rwDiamondList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_root", function: "beacon_T2G_Root", args: [], label: "Beacon T2G Root", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "T2G_root", function: "balanceOfRoot", args: [], label: "Coin T2G Contract Root Balance", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "beacon_DiamondLoupeFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facets", args: [], label: "Facets", outcome: [ "array"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facetAddresses", args: [], label: "Facet Addresses", outcome: [ "array"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facetFunctionSelectors", args: [  Value.Address ], label: "Facets details", outcome: [ "array"] },
    { rwType: rwType.READ, contract: "OwnershipFacet", function: "owner", args: [], label: "@owner of T2G Diamond", outcome: [ "address"] },
    ]

export async function T2G_InteractDiamond( accountList: Address[], item : rwRecord ) {
  colorOutput("Enter T2G_InteractDiamond Application", "cyan")

  try {
    const diamond = await readLastDiamondJSONfile();
    const rootAddress: Address =  diamond.Diamond.address;
    await InteractWithContracts( item, accountList, rootAddress );
  } catch (error) {
    console.log(error);
    }
}