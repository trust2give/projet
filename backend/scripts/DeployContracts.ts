//const hre = require("hardhat");
import { diamondNames, tokenCredential } from "./T2G_Data";
import { deployDiamond } from "./deploy";
import { Address } from "viem";
import { rwRecord } from "./InteractWithContracts";
import { colorOutput } from "./T2G_utils";


/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Deployment Script
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\DeployContracts.ts --network localhost

export async function DeployContracts(accountList: Address[], item : rwRecord) {
  colorOutput("Enter DeployContracts Application", "cyan")
  const diamond = await deployDiamond(diamondNames, tokenCredential)
  return diamond
}