const hre = require("hardhat");
import { rwType, rwRecord, Value, Account } from "./InteractWithContracts";
import { Address, encodeFunctionData } from "viem";
import { T2G_InteractERC20, rwERC20List } from "./T2G_InteractERC20";
import { InteractWithERC20Contract } from "./InteractWithERC20";
import { T2G_InteractDiamond } from "./T2G_InteractDiamond";
import { T2G_InteractERC721 } from "./T2G_InteractERC721";
import { T2G_InteractHoney } from "./T2G_InteractHoney";
import { T2G_InteractPool } from "./T2G_InteractPool";
import { DeployContracts } from "./DeployContracts";
import { diamondNames } from "./T2G_Data";
import * as readline from 'readline';

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Menu with T2G & ERC20 Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\Menu.ts --network localhost

async function main() {
    console.log("Enter the Application Menu")

    const accounts = await hre.ethers.getSigners();
    const accountList: Address[] = accounts.map( (add ) => {    console.log(add.address); return <Address>add.address;} )
  
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        });

    var tag : string = "";
    var level : number = 0;
    var promptText : string = "";

    rl.setPrompt("Which action? [0. Deploy / 1. EUR / 2. Honey / 3. Diamond / 4. ERC721 ] > ");
    rl.prompt();

    rl.on('line', async (line) => {
        const answer : string = line.trim().toLowerCase();
        console.log("answer", level, tag, answer)

        if ([...Array(20).keys()].includes(Number(answer))) {
            console.log("number", level, tag, answer)
            if (level == 0) level++;
            tag = tag.concat(answer);
            if (tag.substring(0, 1) == "0") {
                promptText = await DeployContracts();
                }
            else if (tag.substring(0, 1) == "1") {
                promptText = await T2G_InteractERC20( accountList, tag );
                }
            else if (tag.substring(0, 1) == "2") {
                promptText = await T2G_InteractHoney( accountList, tag );
                }
            else if (tag.substring(0, 1) == "3") {
                promptText = await T2G_InteractDiamond( accountList, tag );
                }
            else if (tag.substring(0, 1) == "4") {
                promptText = await T2G_InteractERC721( accountList, tag );
                }
            else if (tag.substring(0, 1) == "5") {
                promptText = await T2G_InteractPool( accountList, tag );
                }
                }
        else if (answer == "99" && level == 1) {
            level--;
            tag = "";
            promptText = "Which action? [0. Deploy / 1. Test EUR / 2. Test Honey / 3. Test Diamond] > ";
            }

        rl.setPrompt(promptText);
        rl.prompt();

        }).on('close', () => {
            console.log('Have a great day!');
            process.exit(0);
        });             
    }

main().catch((error) => {
  console.error("Erreur", error);
  process.exitCode = 1;
});