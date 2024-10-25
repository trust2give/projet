const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import * as readline from 'readline';

import { rwType, Account, Value, Typeoftoken, Statusoftoken, TypeofUnit, rwRecord, InteractWithContracts } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with ERC721Facet Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractERC721.ts --network localhost

export const rwERC721List : rwRecord[] = [
    { rwType: rwType.READ, contract: "ERC721Facet", function: "name", store: true, args: [ Value.Index ], loopIndex: [0,1,2, 3, 4], label: "Nom du Token", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "symbol", store: true, args: [ Value.Index ], loopIndex: [0,1,2, 3, 4], label: "Symbol du Token", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "ownerOf", args: [ Value.TokenId ], loopTokenId: [8,9,10], label: "@owner of Honey Token", outcome: [ "address"] },
    //{ rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Account.A2], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "totalSupply", args: [], store: true, label: "Total tokens minted", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "tokenByIndex", args: [ Value.Index ], loopIndex: "totalSupply", label: "TokenId @ Index ", outcome: [ "bigint"] },
    //{ rwType: rwType.READ, contract: "ERC721Facet", function: "tokenURI", sender: Account.A0, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "Honey URI", outcome: [ "string" ] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], label: "Token Nb per account ", outcome: [ "bigint"] },
    //{ rwType: rwType.WRITE, contract: "ERC721Facet", function: "approve", args: [ Account.A0, Value.Index ], loopIndex: [4,5,6, 7], sender: Account.A2, outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "getApproved", args: [Value.TokenId], loopTokenId: [8,9,10], sender: Account.A0, outcome: [ "address"] },
    //{ rwType: rwType.WRITE, contract: "ERC721Facet", function: "setApprovalForAll", args: [Value.Account, true], loopAccount: [Account.A0, Account.A1], sender: Account.A2, outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "isApprovedForAll", args: [Account.A2, Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], sender: Account.A0, outcome: [ "bool"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "contractURI", args: [1], decode: 'data:application/json;base64,', outcome: [ "string"] }
    ]

export async function T2G_InteractERC721( accountList: Address[], tag: string, rl : readline.Interface, item : rwRecord ) {
    //console.log("Enter T2G_InteractERC721 Application")
    await InteractWithContracts( item, accountList, rl );
    }