import hre from "hardhat";
import { diamondNames } from "./T2G_Data";
import { Address } from "viem";

/// npx hardhat run .\scripts\WriteContract.ts --network localhost

// Expression régulière pour détecter une adresse ETH 
const regex = '^(0x)?[0-9a-fA-F]{40}$';
const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

export type writeRecord = { 
    contract: string, 
    function: string, 
    args?: Array<any>
  }

enum Account { A1 = "1_", A2 = "2_", A3 = "3_", A4 = "4_", A5 = "5_", A6 = "6_" }

const writeList : writeRecord[] = [
    { contract: "MintFacet", function: "mint", args: [ Account.A3, 2 ] },
    { contract: "ERC721Facet", function: "safeTransferFrom", args: [ Account.A1, Account.A2, 1 ] }
    ]

async function main() {
    console.log("Enter WriteContract app")
    const accounts = await hre.ethers.getSigners();

    var facet;
    for (const writeItem of writeList) {
        const facet = await hre.viem.getContractAt(
            writeItem.contract,
            (<Address>diamondNames.Diamond.address)
            );
        // On récupère le beacon de T2G_Root

        const newArgs = writeItem.args.map((x) => {
            if (Object.values(Account).includes(x)) {       
                return accounts[x.split('_')[0]].address;
                }
            else {
                return x;
                }
            });
        console.log(`Write ${writeItem.contract} @: ${facet.address} : ${newArgs}`);            

        const method = await facet.write[writeItem.function](newArgs);
        console.log(`Write ${writeItem.contract} @: ${facet.address} : ${method}`);            
        }
    }
  
  main().catch((error) => {
    console.error("Erreur", error);
    process.exitCode = 1;
  });