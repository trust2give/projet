const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import * as readline from 'readline';
import { colorOutput, Account, Value, NULL_ADDRESS } from "./T2G_utils";
import { rwType, rwRecord, InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";

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
    { rwType: rwType.READ, contract: "ERC721Facet", function: "beacon_ERC721Facet", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "name", args: [ Value.Index ], label: "Nom du Token", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "symbol", args: [ Value.Index ], label: "Symbol du Token", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "totalSupply", args: [], label: "Total tokens minted", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "tokenOfOwnerByIndex", args: [ Value.Account, Value.Index ], label: "TokenId @ Index ", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "tokenByIndex", args: [ Value.Index ], label: "TokenId @ Index ", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Value.Account], label: "Coin of Contract balance", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "ownerOf", args: [ Value.TokenId ], label: "@owner of Token", outcome: [ "address"] },
    { rwType: rwType.WRITE, contract: "ERC721Facet", function: "safeTransferFrom", args: [Value.Account, Value.Account, Value.TokenId], outcome: [] },
    { rwType: rwType.WRITE, contract: "ERC721Facet", function: "approve", args: [ Value.Account, Value.TokenId ], outcome: [] },
    { rwType: rwType.WRITE, contract: "ERC721Facet", function: "setApprovalForAll", args: [Value.Account, Value.Flag], outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "getApproved", args: [Value.TokenId], outcome: [ "address"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "isApprovedForAll", args: [Value.Account, Value.Account], outcome: [ "bool"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "contractURI", args: [Value.Enum], decode: 'data:application/json;base64,', outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "tokenURI", args: [ Value.TokenId ], label: "Token URI", outcome: [ "string" ] }
    ]

export async function T2G_InteractERC721( accountList: Address[], item : rwRecord ) {
    colorOutput("Enter T2G_InteractERC721 Application", "cyan")

    try {
        const diamond = await readLastDiamondJSONfile();
        const rootAddress: Address =  diamond.Diamond.address;
        await InteractWithContracts( item, accountList, rootAddress );
      } catch (error) {
        console.log(error);
        }
    }