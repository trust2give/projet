const hre = require("hardhat");
import { rwType, rwRecord } from "./InteractWithContracts";
import { Address, encodeFunctionData } from "viem";
import { InteractWithERC20Contract, readLastContractSetJSONfile } from "./InteractWithERC20";
import * as readline from 'readline';
import { contractSet } from "./T2G_Data";
import { colorOutput, Account, Value, contractRecord } from "./T2G_utils";
import fs from 'fs';

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
    { rwType: rwType.READ, contract: "EUR", function: "allowance", args: [Value.Account, Value.Account], label: "Allowance EUR to spender", outcome: [ "bigint" ] },
    { rwType: rwType.WRITE, contract: "EUR", function: "approve", args: [Value.Account, Value.Number], label: "Approve EUR To", outcome: [ "boolean"] },
    ]


export function writeLastContractJSONfile( ) {
  const jsonString = fs.readFileSync('./scripts/ContractSet.json', 'utf-8');
  const Items : contractRecord[] = JSON.parse(jsonString);
  Items.push(contractSet[0]);

  let JsonFile = JSON.stringify(Items);
  //colorOutput("Save last EUR Contract Record >> ".concat(JSON.stringify(contractSet[0])), "cyan");
  fs.writeFile('./scripts/ContractSet.json', JsonFile, (err) => {
      if (err) {
          console.log('Error writing file:', err);
      } else {
          console.log('Successfully wrote file');
          }
      });
  }
    

export async function T2G_InteractERC20 ( accountList: Address[], item : rwRecord )  {
  colorOutput("Enter T2G_InteractERC20 Application", "cyan")

    // TBD : Replace with last recorder @ or root in in file
    const rootAddress: Address =  (readLastContractSetJSONfile())[0].address;

    await InteractWithERC20Contract(item, rootAddress, accountList );
    }

//main().catch((error) => {
//  console.error("Erreur", error);
//  process.exitCode = 1;
//});