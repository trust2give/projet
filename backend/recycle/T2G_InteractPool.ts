const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import { InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";
import * as readline from 'readline';
import { colorOutput, Account, Value, NULL_ADDRESS, rwRecord, rwType } from "./T2G_utils";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Pool Facet Contracts
* 
* This script is called by the Menu.ts main script in order to interact with
* PoolFacet smart contract
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

export const rwPoolList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "beacon_PoolFacet", args: [], label: "Beacon", outcome: [ "string"] },    
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "poolBalanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "T2G_PoolFacet", function: "get_T2G_PoolFacet", args: [], label: "Address poll", outcome: [ "address"] },
    ]

export async function T2G_InteractPool( accountList: Address[], item : rwRecord ) {
    colorOutput("Enter T2G_InteractDiamond Application", "cyan")

    try {
        await InteractWithContracts( item, accountList );
      } catch (error) {
        console.log(error);
        }
    }