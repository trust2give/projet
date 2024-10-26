const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import * as readline from 'readline';
import { colorOutput, Account, Value, NULL_ADDRESS } from "./T2G_utils";
import { rwType, rwRecord, InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";

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
  { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "get_T2G_HoneyFacet", args: [], label: "Beacon", outcome: [ "address"] },
  { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "balanceOf", args: [], label: "Coin Contract Balance", outcome: [ "bigint"] },
  { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", args: [ Value.TokenId ], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "string", "bigint", "TypeOfUnit", "number"] },
  { rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "mintHoney", args: [ Value.Account, Value.TokenId, Value.Number, Value.Index, Value.Number, Value.Hash ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "setBlackOrWhiteList", args: [ Value.TokenId, Value.Index, Value.Flag, Value.Flag ], label: "Set Black/Whitelist", outcome: [] },
  { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "getBlackOrWhiteList", args: [ Value.TokenId, Value.Flag ], loopIndex: [4], label: "Get Whitelist", outcome: [ "array"]  },
  { rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "approveHoney", args: [ Value.TokenId, Value.Account ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "transferToPool", args: [ Value.TokenId, Value.Account ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "burnHoney", args: [ Value.TokenId, Value.Account ], outcome: [] }
  ]

export async function T2G_InteractHoney( accountList: Address[], item : rwRecord ) {
    colorOutput("Enter T2G_InteractHoney Application", "cyan")

    try {
      const diamond = await readLastDiamondJSONfile();
      const rootAddress: Address =  diamond.Diamond.address;
      await InteractWithContracts( item, accountList, rootAddress );
    } catch (error) {
      console.log(error);
      }
    }