const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import { rwType, Account, Value, Typeoftoken, Statusoftoken, rwRecord, InteractWithContracts } from "./InteractWithContracts";
import * as readline from 'readline';
import { colorOutput } from "./T2G_utils";

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
    { rwType: rwType.READ, contract: "T2G_root", function: "beacon_T2G_Root", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "T2G_NektarFacet", function: "beacon_NektarFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "T2G_PollenFacet", function: "beacon_PollenFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "beacon_PoolFacet", args: [], label: "Beacon", outcome: [ "string"] },    
    { rwType: rwType.READ, contract: "T2G_root", function: "balanceOfRoot", args: [], label: "POL/ETH of T2G Contract Root", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "poolBalanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "get_T2G_HoneyFacet", args: [], label: "Address Honey", outcome: [ "address"] },
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "get_T2G_PoolFacet", args: [], label: "Address poll", outcome: [ "address"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract Honey", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "beacon_DiamondLoupeFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facets", args: [], label: "Facets", outcome: [ "array"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facetAddresses", store: true, args: [], label: "Facet Addresses", outcome: [ "array"] },
    { rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facetFunctionSelectors", args: [  Value.Address ], loopAddress: "facetAddresses", label: "Facets details", outcome: [ "array"] },
    { rwType: rwType.READ, contract: "OwnershipFacet", function: "owner", args: [], label: "@owner of T2G Diamond", outcome: [ "address"] },
    { rwType: rwType.READ, contract: "T2G_root", function: "balanceOfRoot", args: [], label: "POL/ETH of T2G Contract Root", outcome: [ "bigint"] }
    //{ rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "ownerOf", args: [ Value.TokenId ], loopTokenId: [4,5,6,7], label: "@owner of Honey Token", outcome: [ "address"] }
    ]

export async function T2G_InteractDiamond( accountList: Address[], tag: string, rl : readline.Interface, item : rwRecord ) {
  colorOutput("Enter T2G_InteractDiamond Application", "cyan")
    await InteractWithContracts( item, accountList, rl );
    }