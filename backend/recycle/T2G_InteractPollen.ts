const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import * as readline from 'readline';
import { colorOutput, Account, Value, NULL_ADDRESS, rwRecord, rwType } from "./T2G_utils";
import { InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Pollen & ERC721Facet Contracts
* 
* This script is called by the Menu.ts main script in order to interact with
* PollenFacet smart contract
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
* "TypeofGainType", "TypeofGainScope", "TypeofGainSource", "TypeofSector"
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

export const rwPollenList : rwRecord[] = [
  { rwType: rwType.READ, contract: "T2G_PollenFacet", function: "beacon_PollenFacet", args: [], label: "Beacon", outcome: [ "string"] },
  { rwType: rwType.READ, contract: "T2G_PollenFacet", function: "get_T2G_PollenFacet", args: [], label: "Beacon", outcome: [ "address"] },
  { rwType: rwType.READ, contract: "T2G_PollenFacet", function: "pollen", args: [ Value.TokenId ], label: "Pollen", outcome: [ "Typeoftoken", "Statusoftoken", "bigint", "bigint", "TypeofsizeUnit"] },
  { rwType: rwType.READ, contract: "T2G_PollenFacet", function: "pollenEntityIdentity", args: [ Value.TokenId ], label: "Pollen Identity", outcome: [ "TypeofSector", "string", "string"] },
  { rwType: rwType.READ, contract: "T2G_PollenFacet", function: "pollenEntityFeatures", args: [ Value.TokenId ], label: "Pollen Entity", outcome: [ "TypeofEntityType", "TypeofUnitType", "TypeofUnitSize", "TypeCountries" ] },
  { rwType: rwType.READ, contract: "T2G_PollenFacet", function: "pollenGainFeatures", args: [ Value.TokenId ], label: "Pollen Gain", outcome: [ "TypeofGainType", "TypeofGainScope", "TypeofGainSource" ] },
  { rwType: rwType.WRITE, contract: "T2G_PollenFacet", function: "mintPollen", args: [ Value.Account, Value.TokenId, Value.Number, Value.Enum, Value.Text, Value.Text ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_PollenFacet", function: "updatePollenGHGReport", args: [ Value.Account, Value.TokenId, Value.Text ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_PollenFacet", function: "updatePollenGains", args: [ Value.Account, Value.TokenId, Value.Enum, Value.Enum, Value.Enum ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_PollenFacet", function: "updatePollenEntity", args: [ Value.Account, Value.TokenId, Value.Enum, Value.Enum, Value.Enum, Value.Enum, Value.Enum ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_PollenFacet", function: "validatePollen", args: [ Value.Account, Value.TokenId ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_PollenFacet", function: "certifyPollen", args: [ Value.Account, Value.TokenId ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_PollenFacet", function: "cancelPollen", args: [ Value.Account, Value.TokenId ], outcome: [] },
  { rwType: rwType.WRITE, contract: "T2G_PollenFacet", function: "burnPollen", args: [ Value.TokenId, Value.Account ], outcome: [] }
  ]

export async function T2G_InteractPollen( accountList: Address[], item : rwRecord ) {
    colorOutput("Enter T2G_InteractPollen Application", "cyan")

    try {
      await InteractWithContracts( item, accountList );
    } catch (error) {
      console.log(error);
      }
    }