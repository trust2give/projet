const hre = require("hardhat");
import { Address } from "viem";
import { rwType, rwRecord, InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";
import { colorOutput, Value } from "./T2G_utils";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Syndic Facet Contracts
* 
* This script is called by the Menu.ts main script in order to interact with
* SyndicFacet smart contract
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



export const rwSyndicList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_SyndicFacet", function: "beacon_SyndicFacet", args: [], label: "Beacon", outcome: [ "string"] },    
    { rwType: rwType.READ, contract: "T2G_SyndicFacet", function: "get_T2G_SyndicFacet", args: [], label: "Contract @", outcome: [ "address"] },    
    { rwType: rwType.READ, contract: "T2G_SyndicFacet", function: "isWalletRegistered", args: [ Value.Account ], label: "Wallet Registered ? ", outcome: [ "bool"] },    
    { rwType: rwType.READ, contract: "T2G_SyndicFacet", function: "isWalletBanned", args: [ Value.Account ], label: "Wallet Banned ? ", outcome: [ "bool"] },    
    { rwType: rwType.WRITE, contract: "T2G_SyndicFacet", function: "registerWallet", args: [ Value.Account ], label: "Register new Wallet", outcome: [] },
    { rwType: rwType.WRITE, contract: "T2G_SyndicFacet", function: "banWallet", args: [ Value.Account ], label: "Ban Wallet", outcome: [] },
    { rwType: rwType.WRITE, contract: "T2G_SyndicFacet", function: "updateMockUpAddress", args: [ Value.Address ], label: "Update Stable Coin @", outcome: [] },
    ]

export async function T2G_InteractSyndic( accountList: Address[], item : rwRecord ) {
    colorOutput("Enter T2G_InteractSyndic Application", "cyan")

    try {
        const diamond = await readLastDiamondJSONfile();
        const rootAddress: Address =  diamond.Diamond.address;
        await InteractWithContracts( item, accountList, rootAddress );
      } catch (error) {
        console.log(error);
        }
    }