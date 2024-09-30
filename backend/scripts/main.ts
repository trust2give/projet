const hre = require("hardhat");

import { FacetCutAction } from "./utils/diamond";
import { contractRecord, diamondCore, deployDiamond } from "./deploy";

var diamondNames : diamondCore = {
  Diamond: { name: "T2G_root", action: FacetCutAction.Add, address: false },
  diamondCutFacet: { action: FacetCutAction.Add, address: false },
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