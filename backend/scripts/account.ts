const hre = require("hardhat");

async function main() {

  console.log("Enter main app", hre)
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
}

main().catch((error) => {
  console.error("Erreur", error);
  process.exitCode = 1;
});