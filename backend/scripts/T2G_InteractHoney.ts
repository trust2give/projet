const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import * as readline from 'readline';
import { colorOutput, Account, Value, NULL_ADDRESS } from "./T2G_utils";
import { rwType, rwRecord, InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Honey & ERC721Facet Contracts
* 
* This script is called by the Menu.ts main script in order to interact with
* HoneyFacet smart contract
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

export const rwHoneyList : rwRecord[] = [
  { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "beacon_HoneyFacet", args: [], label: "Beacon", outcome: [ "string"] },
  { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "get_T2G_HoneyFacet", args: [], label: "Beacon", outcome: [ "address"] },
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