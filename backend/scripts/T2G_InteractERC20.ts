const hre = require("hardhat");
import { rwType, rwRecord, Value, Account } from "./InteractWithContracts";
import { Address, encodeFunctionData } from "viem";
import { InteractWithERC20Contract } from "./InteractWithERC20";
import * as readline from 'readline';
import { diamondNames } from "./T2G_Data";
import { colorOutput } from "./T2G_utils";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with ERC20 Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractERC20.ts --network localhost

export const rwERC20List : rwRecord[] = [
    { rwType: rwType.READ, contract: "EUR", function: "name", args: [], label: "Stable Coin Name", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "EUR", function: "symbol", args: [], label: "Stable Coin Symbol", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "EUR", function: "decimals", args: [], label: "Stable Coin Décimals", outcome: [ "number"] },
    { rwType: rwType.READ, contract: "EUR", function: "totalSupply", args: [], label: "Stable Coin Supply", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "EUR", function: "balanceOf", args: [Value.Account], label: "Balance Of @ ", outcome: [ "bigint"] },    
    { rwType: rwType.WRITE, contract: "EUR", function: "transfer", args: [Value.Account, Value.Number], label: "Transfer EUR To", outcome: [] },
    { rwType: rwType.WRITE, contract: "EUR", function: "transferFrom", args: [Value.Account, Value.Account, Value.Number], label: "Transfer EUR from", outcome: [] },
    ]

export async function T2G_InteractERC20 ( accountList: Address[], tag: string, rl : readline.Interface, item : rwRecord )  {
  colorOutput("Enter T2G_InteractERC20 Application", "cyan")
    await InteractWithERC20Contract(item, <Address>diamondNames.Stablecoin.address, accountList, rl );
    }

//main().catch((error) => {
//  console.error("Erreur", error);
//  process.exitCode = 1;
//});