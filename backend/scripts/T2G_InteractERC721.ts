const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import * as readline from 'readline';
import { colorOutput, Account, Value, NULL_ADDRESS } from "./T2G_utils";
import { rwType, rwRecord, InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with ERC721Facet Contracts
* 
* This script is called by the Menu.ts main script in order to interact with
* ERC721Facet smart contract
* 
* It is to be created and updated whenever there's a change in the ABI of
* the smart contract, to reflect the actual behavior of the contract
* 
* Meaning of attributes :
* - rwType : READ / WRITE - if the funtion is reader or change the blockchain state
* - contract : exact name for the smart contract itself
* - function : exact name for the function itself
* - label : string that can be displayed instead of function name during interaction
* - outcome : for READ function (empty otherwise), array that describes the output
* format of function returns
* 
* The possible values are: bool / string / array / number, bigint, number, address for common
* types of the name of Enums in solidity context : "Typeoftoken", "Statusoftoken", "TypeOfUnit"
* when these enums are also applicable in the context of the menu script.
* 
* - args : an array (possible empty if no args) of sorted inputs as defined in ABI
* 
* The possible values are set among a list of predefined Value Enum items
* - Value.Account : input related to wallet@ of the testnet
* - Value.Address : input of type "0xAddress"
* - Value.TokenId : input related to a TokenId (BigInt Format)
* - Value.Index : input related to an index value (BigInt Format)
* - Value.Hash : input related to a "0xHash" : 32-bytes format
* - Value.Enum : input related to any 8bit integer value
* - Value.Flag : input related to boolean
* - Value.Text : input related to any string format
* 
/******************************************************************************/

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