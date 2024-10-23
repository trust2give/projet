const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";

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

const rwHoneyList : rwRecord[] = [
    { tag: "41", rwType: rwType.READ, contract: "ERC721Facet", function: "name", store: true, args: [ Value.Index ], loopIndex: [0,1,2, 3, 4], label: "Nom du Token", outcome: [ "string"] },
    { tag: "42", rwType: rwType.READ, contract: "ERC721Facet", function: "symbol", store: true, args: [ Value.Index ], loopIndex: [0,1,2, 3, 4], label: "Symbol du Token", outcome: [ "string"] },
    { tag: "43", rwType: rwType.READ, contract: "ERC721Facet", function: "ownerOf", args: [ Value.TokenId ], loopTokenId: [8,9,10], label: "@owner of Honey Token", outcome: [ "address"] },
    //{ tag: "44", rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Account.A2], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { tag: "45", rwType: rwType.READ, contract: "ERC721Facet", function: "totalSupply", args: [], store: true, label: "Total tokens minted", outcome: [ "bigint"] },
    { tag: "46", rwType: rwType.READ, contract: "ERC721Facet", function: "tokenByIndex", args: [ Value.Index ], loopIndex: "totalSupply", label: "TokenId @ Index ", outcome: [ "bigint"] },
    //{ tag: "47", rwType: rwType.READ, contract: "ERC721Facet", function: "tokenURI", sender: Account.A0, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "Honey URI", outcome: [ "string" ] },
    { tag: "48", rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], label: "Token Nb per account ", outcome: [ "bigint"] },
    //{ tag: "49", rwType: rwType.WRITE, contract: "ERC721Facet", function: "approve", args: [ Account.A0, Value.Index ], loopIndex: [4,5,6, 7], sender: Account.A2, outcome: [] },
    { tag: "410", rwType: rwType.READ, contract: "ERC721Facet", function: "getApproved", args: [Value.TokenId], loopTokenId: [8,9,10], sender: Account.A0, outcome: [ "address"] },
    //{ tag: "411", rwType: rwType.WRITE, contract: "ERC721Facet", function: "setApprovalForAll", args: [Value.Account, true], loopAccount: [Account.A0, Account.A1], sender: Account.A2, outcome: [] },
    { tag: "412", rwType: rwType.READ, contract: "ERC721Facet", function: "isApprovedForAll", args: [Account.A2, Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], sender: Account.A0, outcome: [ "bool"] },
    { tag: "413", rwType: rwType.READ, contract: "ERC721Facet", function: "contractURI", args: [1], decode: 'data:application/json;base64,', outcome: [ "string"] }
    ]

export async function T2G_InteractERC721( accountList: Address[], tag: string ) {
    console.log("Enter T2G_InteractERC721 Application")

    const found = rwHoneyList.find((element) => element.tag == tag);
    if (found != undefined) {
      await InteractWithContracts( found );
      }
    
    return "Function ".concat( rwHoneyList.map( (item) => { return ("tag" in item) ? item.tag?.substring(1).concat( ' ', item.function) : "";}).join("| ") );

    }