const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import { rwType, rwRecord, InteractWithContracts } from "./InteractWithContracts";
import * as readline from 'readline';
import { colorOutput, Account, Value } from "./T2G_utils";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Pool Facet Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractPool.ts --network localhost

export const rwPoolList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "beacon_PoolFacet", args: [], label: "Beacon", outcome: [ "string"] },    
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "poolBalanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "get_T2G_PoolFacet", args: [], label: "Address poll", outcome: [ "address"] },
    ]

export async function T2G_InteractPool( accountList: Address[], item : rwRecord ) {
    colorOutput("Enter T2G_InteractDiamond Application", "cyan")
    await InteractWithContracts( item, accountList );
    }