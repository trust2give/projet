const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import { rwType, Account, Value, Typeoftoken, Statusoftoken, rwRecord, InteractWithContracts } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Pool Facet Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractPool.ts --network localhost

const rwPoolList : rwRecord[] = [
    { tag: "35", rwType: rwType.READ, contract: "T2G_PoolFacet", function: "beacon_PoolFacet", args: [], label: "Beacon", outcome: [ "string"] },    
    { tag: "37", rwType: rwType.READ, contract: "T2G_PoolFacet", function: "poolBalanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { tag: "39", rwType: rwType.READ, contract: "T2G_PoolFacet", function: "get_T2G_PoolFacet", args: [], label: "Address poll", outcome: [ "address"] },
    ]

export async function T2G_InteractPool( accountList: Address[], tag: string ) {
    console.log("Enter T2G_InteractDiamond Application")

    const found = rwPoolList.find((element) => element.tag == tag);
    if (found != undefined) {
      await InteractWithContracts( found, accountList );
      }
    
    return "Function ".concat( rwPoolList.map( (item) => { return ("tag" in item) ? item.tag?.substring(1).concat( ' ', item.function) : "";}).join("| ") );
    }