const hre = require("hardhat");
import { rwType, Account, Value, Typeoftoken, Statusoftoken, rwRecord, InteractWithContracts } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Honey & ERC721Facet Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractHoney.ts --network localhost

const rwList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "beacon_HoneyFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "name", store: true, args: [ Value.Index ], loopIndex: [0,1,2, 3, 4], label: "Nom du Token", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "symbol", store: true, args: [ Value.Index ], loopIndex: [0,1,2, 3, 4], label: "Symbol du Token", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "OwnershipFacet", function: "owner", args: [], label: "@owner of T2G Diamond", outcome: [ "address"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "ownerOf", args: [ Value.TokenId ], loopTokenId: [4,5,6,7], label: "@owner of Honey Token", outcome: [ "address"] },
    //{ rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "mintHoney", fees: 1234, args: [ Account.A2, Value.TokenId ], loopTokenId: [4,5,6,7], sender: Account.A0, outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Account.A2], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "totalSupply", args: [], store: true, label: "Total tokens minted", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "tokenByIndex", args: [ Value.Index ], loopIndex: "totalSupply", label: "TokenId @ Index ", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "tokenURI", sender: Account.A0, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "Honey URI", outcome: [ "string" ] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A0, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A2, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A3, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "bigint"] },
    { rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "setBlackOrWhiteList", sender: Account.A1, args: [ Value.Index, 5, false, false ], loopIndex: [4], label: "Set Whitelist", outcome: [] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "getBlackOrWhiteList", args: [ Value.Index, false ], loopIndex: [4], label: "Get Whitelist", outcome: [ "array"]  },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], label: "Token Nb per account ", outcome: [ "bigint"] },
    //{ rwType: rwType.WRITE, contract: "ERC721Facet", function: "approve", args: [ Account.A0, Value.Index ], loopIndex: [4,5,6, 7], sender: Account.A2, outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "getApproved", args: [Value.TokenId], loopTokenId: [4,5,6,7], sender: Account.A0, outcome: [ "address"] },
    //{ rwType: rwType.WRITE, contract: "ERC721Facet", function: "setApprovalForAll", args: [Value.Account, true], loopAccount: [Account.A0, Account.A1], sender: Account.A2, outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "isApprovedForAll", args: [Account.A2, Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], sender: Account.A0, outcome: [ "bool"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "contractURI", args: [1], decode: 'data:application/json;base64,', outcome: [ "string"] },
    //{ rwType: rwType.WRITE, contract: "ERC721Facet", function: "safeTransferFrom", args: [ Account.A0, Account.A2, 1 ], outcome: [] }
    ]

async function main() {
    console.log("Enter T2G_InteractHoney Application")
    await InteractWithContracts(rwList);
    }

main().catch((error) => {
  console.error("Erreur", error);
  process.exitCode = 1;
});