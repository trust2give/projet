const hre = require("hardhat");
import { Address } from "viem";
import { rwType, rwRecord, InteractWithContracts, readLastDiamondJSONfile } from "./InteractWithContracts";
import { colorOutput, Value } from "./T2G_utils";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Script with Pool Facet Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\T2G_InteractSyndic.ts --network localhost | test

export const rwSyndicList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_SyndicFacet", function: "beacon_SyndicFacet", args: [], label: "Beacon", outcome: [ "string"] },    
    { rwType: rwType.WRITE, contract: "T2G_SyndicFacet", function: "registerWallet", args: [ Value.Account ], label: "Register new Wallet", outcome: [] },
    { rwType: rwType.WRITE, contract: "T2G_SyndicFacet", function: "banWallet", args: [ Value.Account ], label: "Ban Wallet", outcome: [] },
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