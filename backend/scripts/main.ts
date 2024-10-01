const hre = require("hardhat");

import { FacetCutAction } from "./utils/diamond";
import { contractRecord, diamondCore, deployDiamond } from "./deploy";

var diamondNames : diamondCore = {
  Diamond: { name: "T2G_root", address: "0xfcfe742e19790dd67a627875ef8b45f17db1dac6" },
  DiamondCutFacet: { },
  DiamondLoupeFacet: { },
  DiamondInit: { action: FacetCutAction.Add, address: "0xc3023a2c9f7b92d1dd19f488af6ee107a78df9db" },
  facetNames: [
    { name: 'OwnershipFacet', action: FacetCutAction.Replace },
    { name: 'ERC721Facet', action: FacetCutAction.Replace },
    { name: 'MintFacet', action: FacetCutAction.Replace } 
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