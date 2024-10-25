const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import * as readline from 'readline';

import { rwType, Account, Value, Typeoftoken, Statusoftoken, TypeofUnit, rwRecord, InteractWithContracts } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Honey & ERC721Facet Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractHoney.ts --network localhost

export const rwHoneyList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "beacon_HoneyFacet", args: [], label: "Beacon", outcome: [ "string"] },
    //{ rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "mintHoney", fees: 1234, args: [ Account.A1, Value.TokenId, 1, 100 ], loopTokenId: [8,9,10], sender: Account.A0, outcome: [] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A0, args: [ Value.Index ], loopIndex: [8,9,10], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "string", "bigint", "TypeOfUnit", "number"] },
    //{ rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A2, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "string", "bigint", "TypeOfUnit", "number"] },
    //{ rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A3, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "string", "bigint", "TypeOfUnit", "number"] },
    //{ rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "setBlackOrWhiteList", sender: Account.A1, args: [ Value.Index, 5, false, false ], loopIndex: [4], label: "Set Whitelist", outcome: [] },
    //{ rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "getBlackOrWhiteList", args: [ Value.Index, false ], loopIndex: [4], label: "Get Whitelist", outcome: [ "array"]  },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "approveHoney", args: [ 8, Account.A1 ], sender: Account.A0, outcome: [] },
    //{ rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "transferToPool", args: [ 4, Account.A2 ], sender: Account.A0, outcome: [] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract Honey", outcome: [ "bigint"] },
    ]

export async function T2G_InteractHoney( accountList: Address[], tag: string, rl : readline.Interface, item : rwRecord ) {
    //console.log("Enter T2G_InteractHoney Application")
    await InteractWithContracts( item, accountList, rl );
    }