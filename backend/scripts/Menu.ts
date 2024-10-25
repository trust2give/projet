const hre = require("hardhat");
import { rwType, rwRecord, Value, Account } from "./InteractWithContracts";
import { Address, encodeFunctionData } from "viem";
import { T2G_InteractERC20, rwERC20List } from "./T2G_InteractERC20";
import { InteractWithERC20Contract } from "./InteractWithERC20";
import { T2G_InteractDiamond, rwDiamondList } from "./T2G_InteractDiamond";
import { T2G_InteractERC721, rwERC721List } from "./T2G_InteractERC721";
import { T2G_InteractHoney, rwHoneyList } from "./T2G_InteractHoney";
import { T2G_InteractNektar, rwNektarList } from "./T2G_InteractNektar";
import { T2G_InteractPool, rwPoolList } from "./T2G_InteractPool";
import { colorOutput } from "./T2G_utils";
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

const regex = '^(0x)?[0-9a-fA-F]{40}$';

type menuRecord = {
    tag: string,
    call: (accountList: Address[], tag: string, rl : readline.Interface, data: rwRecord) => void,
    data: rwRecord[],
    args: Object
    }

async function main() {
    colorOutput( "Enter the Application Menu", "cyan");

    const accounts = await hre.ethers.getSigners();
    const accountList: Address[] = accounts.map( (add ) => {    console.log(add.address); return <Address>add.address;} )
  
    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        });
    
    const outputColor : string = "color: #bada55"
    var args : Array<any> = [];
    var inputs: boolean = false;
    var index : number = 0;
    var record : menuRecord;
    var item : rwRecord | undefined;
    var tag : string = "";
    var help : string = "";
    var level : string = "";
    var Choices : string[] = [];
    var promptText : string = "Smart Contract (<Help> or <Contact Name>) >> ";
    var smart : menuRecord[] = [ 
        { tag: "deploy", call: DeployContracts, data: [], args: {} }, 
        { tag: "eur", call: T2G_InteractERC20, data: rwERC20List, args: {} },
        { tag: "honey", call: T2G_InteractHoney, data: rwHoneyList, args: {} },
        { tag: "diamond", call: T2G_InteractDiamond, data: rwDiamondList, args: {} },
        { tag: "erc721", call: T2G_InteractERC721, data: rwERC721List, args: {} }, 
        { tag: "pool", call: T2G_InteractPool, data: rwPoolList, args: {} },
        { tag: "nektar", call: T2G_InteractNektar, data: rwNektarList, args: {} } 
        ];

    rl.setPrompt(promptText);
    rl.prompt();
    //rl.write('Delete this!');

    rl.on('line', async (line) => {
        const answer : string = line.trim();
        
        if (smart.some((el: menuRecord) => el.tag == answer)) {
            level = answer;
            promptText = `Which Function (<Help> or <back> or <Function>) `;
            record = <menuRecord>smart.find((el: menuRecord ) => el.tag == level);
            Choices = record.data.map( (item) => { return item.function;} );
            }
        else if (Choices.some((el : string) => el == answer)) {
            tag = answer;
            item = (<rwRecord>record.data.find((element) => element.function == tag));

            if (tag in record.args) {
                if (Array.isArray(record.args[tag]) && record.args[tag].length > 0) {
                    item.args = record.args[tag].map((el) => el);
                    }            
                }
            else record.args[tag] = (<rwRecord>record.data.find((element) => element.function == tag)).args.map((el) => el); // Copie de la valeur originale

            index = 0;
            inputs = true;
            if (item.args.length > 0) {
                promptText = "Arg".concat( `[${index}] - ${item.args[index]}`, " >> "); 
                inputs = false;
                }
            }
        else if (answer == "back") {
            level = "";
            tag = "";
            index = 0;
            item = undefined;
            inputs = false;
            promptText = "Smart Contract (<Help> or <Contact Name>) ";
            }
        else if (answer == "Help") {
            if (level == "") help = "Help [".concat( smart.map( (el) => el.tag ).join("| "), "]\n");
            else help = "Help [".concat( Choices.join("| "), "]\n");
            console.log(help);
            }
        if (level.length > 0 && tag.length > 0) {
            if (item != undefined) {
                if (item.args.length > 0 && !inputs) {
                    try {
                        if (item.args[index] === Value.Account) {
                            if (Object.values(Account).includes(<Account>answer)) {
                                item.args[index] = accountList[Number(answer.split('_')[0])];
                                inputs = (++index >= item.args.length);
                                }
                            }
                        if (item.args[index] === Value.Number || item.args[index] === Value.Index || item.args[index] === Value.TokenId) {
                            item.args[index] = BigInt(answer);
                            inputs = (++index >= item.args.length);
                            }
                        if (item.args[index] === Value.Address) {
                            if (answer.match(regex)) {
                                item.args[index] = answer;
                                inputs = (++index >= item.args.length);
                                }
                            }
                        }
                    catch (error) {
                        console.log("erreur", Object.entries(error));                        
                        }
                    promptText = "Arg".concat( `[${index}] - ${item.args[index]}`);
                    }            
                }
            if (inputs) {
                await (<menuRecord>smart.find((el: menuRecord ) => el.tag == level)).call( accountList, tag, rl, <rwRecord>item );
                //item.args = record.args.map((el) => el);
                tag = "";
                index = 0;
                inputs = false;
                promptText = `Function (<Help> <back> or <Function>) `;
                }            
            }
        
        if (item != undefined) {
            rl.setPrompt("".concat( 
                (level.length > 0) ? `<${item.contract}>` : "",
                (tag.length > 0) ? `<${item.function}>` : "",
                (inputs) ? `<${inputs}> ` : "", promptText, ` >> `));
            }
        else rl.setPrompt(promptText.concat(` >> `));
        rl.prompt();

        }).on('close', () => {
            console.log('Have a great day!');
            process.exit(0);
        }).on('SIGTSTP', () => {
            // This will override SIGTSTP and prevent the program from going to the
            // background.
            console.log('Caught SIGTSTP.');
          }); 
    }

main().catch((error) => {
  console.error("Erreur", error);
  process.exitCode = 1;
});