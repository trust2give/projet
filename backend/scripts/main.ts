const hre = require("hardhat");

import { FacetCutAction } from "./utils/diamond";
import { contractRecord, diamondCore, deployDiamond } from "./deploy";

var diamondNames : diamondCore = {
  Diamond: { name: "T2G_root", action: FacetCutAction.Add, address: "0x2c8ed11fd7a058096f2e5828799c68be88744e2f" },
  DiamondCutFacet: { action: FacetCutAction.Add, address: "0xcbbe2a5c3a22be749d5ddf24e9534f98951983e2" },
  DiamondInit: { action: FacetCutAction.Add, address: false },
  facetNames: [
    { name: 'DiamondLoupeFacet', action: FacetCutAction.Add, address: false },
    { name: 'OwnershipFacet', action: FacetCutAction.Add, address: false },
    { name: 'ERC721Facet', action: FacetCutAction.Add, address: false },
    { name: 'MintFacet', action: FacetCutAction.Add, address: false } 
    ]
  }

var tokenCredential = { name: "Honey", symbol: "HONEY" } 

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