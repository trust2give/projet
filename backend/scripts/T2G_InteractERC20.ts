const hre = require("hardhat");
import { rwType, rwRecord, Value, Account } from "./InteractWithContracts";
import { Address, encodeFunctionData } from "viem";
import { InteractWithERC20Contract } from "./InteractWithERC20";
import * as readline from 'readline';
import { diamondNames } from "./T2G_Data";

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
    { tag: "11", rwType: rwType.READ, contract: "EUR", function: "name", args: [], label: "Stable Coin Name", outcome: [ "string"] },
    { tag: "12", rwType: rwType.READ, contract: "EUR", function: "symbol", args: [], label: "Stable Coin Symbol", outcome: [ "string"] },
    { tag: "13", rwType: rwType.READ, contract: "EUR", function: "decimals", args: [], label: "Stable Coin Décimals", outcome: [ "number"] },
    { tag: "14", rwType: rwType.READ, contract: "EUR", function: "totalSupply", args: [], label: "Stable Coin Supply", outcome: [ "bigint"] },
    { tag: "15", rwType: rwType.READ, contract: "EUR", function: "balanceOf", args: [Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], label: "Balance Of @ ", outcome: [ "string"] },    
    //{ rwType: rwType.READ, contract: "EUR", function: "balanceOfRoot", args: [], label: "POL/ETH of T2G Contract Root", outcome: [ "bigint"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "poolBalanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "get_T2G_HoneyFacet", args: [], label: "Address Honey", outcome: [ "address"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "get_T2G_PoolFacet", args: [], label: "Address poll", outcome: [ "address"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract Honey", outcome: [ "bigint"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "beacon_DiamondLoupeFacet", args: [], label: "Beacon", outcome: [ "string"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "facets", args: [], label: "Facets", outcome: [ "array"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "facetAddresses", store: true, args: [], label: "Facet Addresses", outcome: [ "array"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "facetFunctionSelectors", args: [  Value.Address ], loopAddress: "facetAddresses", label: "Facets details", outcome: [ "array"] },
    //{ rwType: rwType.READ, contract: "EUR", function: "ownerOf", args: [ Value.TokenId ], loopTokenId: [4,5,6,7], label: "@owner of Honey Token", outcome: [ "address"] }
    ]

export async function T2G_InteractERC20 ( accountList: Address[], tag: string )  {
    console.log("Enter T2G_InteractERC20 Application")

    const found = rwERC20List.find((element) => element.tag == tag);
    console.log('Answer: ', found);
    if (found != undefined) {
      await InteractWithERC20Contract(found, <Address>diamondNames.Stablecoin.address, accountList );
      }
    
    return "Function ".concat( rwERC20List.map( (item) => { return ("tag" in item) ? item.tag?.substring(1).concat( ' ', item.function) : "";}).join("| ") );

    }

//main().catch((error) => {
//  console.error("Erreur", error);
//  process.exitCode = 1;
//});