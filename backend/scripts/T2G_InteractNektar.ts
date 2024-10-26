const hre = require("hardhat");
import { Address, encodeFunctionData } from "viem";
import { rwType, rwRecord, InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";
import * as readline from 'readline';
import { colorOutput, Account, Value, NULL_ADDRESS } from "./T2G_utils";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Pool Facet Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractNektar.ts --network localhost

export const rwNektarList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_NektarFacet", function: "beacon_NektarFacet", args: [], label: "Beacon", outcome: [ "string"] },
    ]

export async function T2G_InteractNektar( accountList: Address[], item : rwRecord ) {
    colorOutput("Enter T2G_InteractDiamond Application", "cyan")

    try {
        const diamond = await readLastDiamondJSONfile();
        const rootAddress: Address =  diamond.Diamond.address;
        await InteractWithContracts( item, accountList, rootAddress );
      } catch (error) {
        console.log(error);
        }
      }