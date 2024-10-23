const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
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

const rwDiamondList : rwRecord[] = [
    { tag: "31", rwType: rwType.READ, contract: "T2G_root", function: "beacon_T2G_Root", args: [], label: "Beacon", outcome: [ "string"] },
    { tag: "33", rwType: rwType.READ, contract: "T2G_NektarFacet", function: "beacon_NektarFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { tag: "34", rwType: rwType.READ, contract: "T2G_PollenFacet", function: "beacon_PollenFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { tag: "35", rwType: rwType.READ, contract: "T2G_PoolFacet", function: "beacon_PoolFacet", args: [], label: "Beacon", outcome: [ "string"] },    
    { tag: "36", rwType: rwType.READ, contract: "T2G_root", function: "balanceOfRoot", args: [], label: "POL/ETH of T2G Contract Root", outcome: [ "bigint"] },
    { tag: "37", rwType: rwType.READ, contract: "T2G_PoolFacet", function: "poolBalanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { tag: "38", rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "get_T2G_HoneyFacet", args: [], label: "Address Honey", outcome: [ "address"] },
    { tag: "39", rwType: rwType.READ, contract: "T2G_PoolFacet", function: "get_T2G_PoolFacet", args: [], label: "Address poll", outcome: [ "address"] },
    { tag: "310", rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract Honey", outcome: [ "bigint"] },
    { tag: "311", rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "beacon_DiamondLoupeFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { tag: "312", rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facets", args: [], label: "Facets", outcome: [ "array"] },
    { tag: "313", rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facetAddresses", store: true, args: [], label: "Facet Addresses", outcome: [ "array"] },
    { tag: "314", rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "facetFunctionSelectors", args: [  Value.Address ], loopAddress: "facetAddresses", label: "Facets details", outcome: [ "array"] },
    { tag: "315", rwType: rwType.READ, contract: "OwnershipFacet", function: "owner", args: [], label: "@owner of T2G Diamond", outcome: [ "address"] },
    { tag: "315", rwType: rwType.READ, contract: "T2G_root", function: "balanceOfRoot", args: [], label: "POL/ETH of T2G Contract Root", outcome: [ "bigint"] }
    //{ rwType: rwType.READ, contract: "DiamondLoupeFacet", function: "ownerOf", args: [ Value.TokenId ], loopTokenId: [4,5,6,7], label: "@owner of Honey Token", outcome: [ "address"] }
    ]

export async function T2G_InteractDiamond( accountList: Address[], tag: string ) {
    console.log("Enter T2G_InteractDiamond Application")

    const found = rwDiamondList.find((element) => element.tag == tag);
    if (found != undefined) {
      await InteractWithContracts( found, accountList );
      }
    
    return "Function ".concat( rwDiamondList.map( (item) => { return ("tag" in item) ? item.tag?.substring(1).concat( ' ', item.function) : "";}).join("| ") );
    }