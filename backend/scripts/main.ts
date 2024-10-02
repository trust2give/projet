const hre = require("hardhat");
import { diamondNames, tokenCredential } from "./T2G_Data";
import { deployDiamond } from "./deploy";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Deployment Script
/******************************************************************************/

/// npx hardhat run .\scripts\main.ts --network localhost

async function main() {
  console.log("Enter main app")
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
    }
  const diamond = await deployDiamond(diamondNames, tokenCredential)
  return diamond
}

main().catch((error) => {
  console.error("Erreur", error);
  process.exitCode = 1;
});