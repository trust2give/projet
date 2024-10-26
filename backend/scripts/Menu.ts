const hre = require("hardhat");
import { rwRecord } from "./InteractWithContracts";
import { Address } from "viem";
import { T2G_InteractERC20, rwERC20List, writeLastContractJSONfile } from "./T2G_InteractERC20";
import { T2G_InteractDiamond, rwDiamondList } from "./T2G_InteractDiamond";
import { T2G_InteractERC721, rwERC721List } from "./T2G_InteractERC721";
import { T2G_InteractHoney, rwHoneyList } from "./T2G_InteractHoney";
import { T2G_InteractNektar, rwNektarList } from "./T2G_InteractNektar";
import { T2G_InteractPool, rwPoolList } from "./T2G_InteractPool";
import { T2G_InteractSyndic, rwSyndicList } from "./T2G_InteractSyndic";
import { colorOutput, regex, regex2, Account, Value, NULL_ADDRESS } from "./T2G_utils";
import { DeployContracts, writeLastDiamondJSONfile } from "./DeployContracts";
import * as readline from 'readline';
import { contractSet, diamondNames } from "./T2G_Data";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Menu with T2G & ERC20 Contracts
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\Menu.ts --network localhost | test

type menuRecord = {
    tag: string,
    call: ((accountList: Address[], item: rwRecord | string) => any),
    data: rwRecord[],
    args: Object,
    sender: Object
    }

async function main() {
    colorOutput( "Enter the Application Menu", "cyan");

    const accounts = await hre.ethers.getSigners();
    const accountList: Address[] = accounts.map( (add, i : number ) => {    
        if (i < 10) console.log(`${Account["A".concat(i)]} :: `.concat(add.address)); 
        return <Address>add.address;
        })
  
    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        });
    
    const outputColor : string = "color: #bada55"

    var inputs: "None" | "Sender" | "Args" | "OK" = "None";
    var deploy: boolean = false;

    var index : number = 0;
    var record : menuRecord;
    var item : rwRecord | undefined;

    var tag : string = "";
    var help : string = "";
    var level : string = "";
    var Choices : string[] = [];

    var promptText : string = "Smart Contract (<Help> or <Contact Name>) >> ";

    // Array to append when a new contract is to be deployed along with the T2G_Data.ts file
    var smart : menuRecord[] = [ 
        { tag: "Deploy", call: DeployContracts, data: [], args: {}, sender: {} }, 
        { tag: "EUR", call: T2G_InteractERC20, data: rwERC20List, args: {}, sender: {} },
        { tag: "Honey", call: T2G_InteractHoney, data: rwHoneyList, args: {}, sender: {} },
        { tag: "Diamond", call: T2G_InteractDiamond, data: rwDiamondList, args: {}, sender: {} },
        { tag: "Erc721", call: T2G_InteractERC721, data: rwERC721List, args: {}, sender: {} }, 
        { tag: "Pool", call: T2G_InteractPool, data: rwPoolList, args: {}, sender: {} },
        { tag: "Nektar", call: T2G_InteractNektar, data: rwNektarList, args: {}, sender: {} }, 
        { tag: "Syndication", call: T2G_InteractSyndic, data: rwSyndicList, args: {}, sender: {} } 
        ];

    rl.setPrompt(promptText);
    rl.prompt();
    //rl.write('Delete this!');

    rl.on('line', async (line) => {
        var answer : string = line.trim();
        
        if (smart.some((el: menuRecord) => el.tag == answer)) {            
            // Check whether Deploy option is selected
            if (answer == smart[0].tag ) {
                level = "";
                tag = "";
                index = 0;
                item = undefined;
                inputs = "None";
                promptText = ">>>>> ";
                deploy = true;
                }
            else {
                level = answer;
                record = <menuRecord>smart.find((el: menuRecord ) => el.tag == level);
                promptText = `Which Function (<Help> or <back> or <Function>) `;
                Choices = record.data.map( (item) => { return item.function;} );
                deploy = false;
                }            
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

            if (tag in record.sender) {
                item.sender = <Account>record.sender[tag];
                }
            else {
                record.sender[tag] = ("sender" in item) ? item.sender : undefined;
                }

            promptText = "Sender >>"; 
            inputs = "Sender";
            }
        else if (answer == "back") {
            level = "";
            tag = "";
            index = 0;
            item = undefined;
            inputs = "None";
            promptText = "Smart Contract (<Help> or <Contact Name>) ";
            }
        else if (answer == "Help") {
            if (level == "") help = "Help [".concat( smart.map( (el) => el.tag ).join("| "), "]\n");
            else help = "Help [".concat( Choices.join("| "), "]\n");
            console.log(help);
            }
        
        // In the case when Deploy is selected
        if (deploy) {
            if (answer == "back") {
                level = "";
                tag = "";
                index = 0;
                item = undefined;
                inputs = "None";
                deploy = false;
                promptText = "Smart Contract (<Help> or <Contact Name>) ";
                }
            else if (answer == "Help") {
                help = "Help [ {Facet/Contract/Diamond} {Add/Replace/Remove} {[contractName ContractName...]} ]\n";
                console.log(help);
                }
            else {
                const [ diaAddress, scAddress ] = await smart[0].call( accountList, answer );
                if (diaAddress != NULL_ADDRESS && diaAddress != diamondNames.Diamond.address) {
                    // We need to write down the new address in a json file
                    colorOutput( "Diamond Root @[".concat(diaAddress, "]"), "green");
                    diamondNames.Diamond.address = diaAddress;
                    writeLastDiamondJSONfile();
                    }
                if (scAddress != NULL_ADDRESS && scAddress != contractSet[0].address) {
                    // We need to write down the new address in a json file
                    console.log(scAddress)
                    colorOutput( "SC Contract  @[".concat(scAddress, "]"), "green");
                    contractSet[0].address = scAddress;
                    writeLastContractJSONfile();
                    }
                promptText = "Deploy Smart Contract (<Help> or <Contact Name>) ";
                }
            }
        // In the case when contract are selected. 
        // Checks if contract and function are set up. If so, key in the values for sender and inputs
        else if (level.length > 0 && tag.length > 0) {
            if (item != undefined) {
                if (inputs == "Sender") {
                    if (!("sender" in item) || item.sender == undefined) {
                        if (Object.values(Account).includes(<Account>answer)) {
                            item.sender = <Account>answer;
                            }
                        }
                    if ("sender" in item && item.sender != undefined) {
                        if (item.args.length > 0) {
                            index = 0;
                            promptText = "Arg".concat( ` [${index}] - ${item.args[index]}`, " >> "); 
                            inputs = "Args";
                            answer = "";
                            }
                        else inputs = "OK";
                        }
                    }
                if (inputs == "Args") {
                    try {
                        switch (item.args[index]) {
                            case Value.Account: {
                                if (Object.values(Account).includes(<Account>answer)) {
                                    item.args[index] = accountList[Number(answer.substring(1))];
                                    if (++index >= item.args.length) inputs = "OK";
                                    }
                                break;
                                } 
                            case Value.Number: {
                                item.args[index] = BigInt(answer);
                                if (++index >= item.args.length) inputs = "OK";
                                break;
                                }                  
                            case Value.Index: {
                                item.args[index] = BigInt(answer);
                                if (++index >= item.args.length) inputs = "OK";
                                break;
                                }                  
                            case Value.TokenId: {
                                item.args[index] = BigInt(answer);
                                if (++index >= item.args.length) inputs = "OK";
                                break;
                                }                  
                            case Value.Address: {
                                if (answer.match(regex)) {
                                    item.args[index] = answer;
                                    if (++index >= item.args.length) inputs = "OK";
                                    }
                                break;
                                }                  
                            case Value.Hash: {                                
                                if (answer.match(regex2)) {
                                    item.args[index] = answer;
                                    if (++index >= item.args.length) inputs = "OK";
                                    }
                                break;
                                }                  
                            case Value.Enum: {
                                item.args[index] = Number(answer);
                                if (++index >= item.args.length) inputs = "OK";
                                break;
                                }                  
                            case Value.Text: {
                                item.args[index] = String(answer);
                                if (++index >= item.args.length) inputs = "OK";
                                break;
                                }                  
                            case Value.Flag: {
                                item.args[index] = Boolean(answer);
                                if (++index >= item.args.length) inputs = "OK";
                                break;
                                }
                            default:

                            }
                        }
                    catch (error) {
                        console.log("erreur", Object.entries(error));                        
                        }

                        promptText = "Arg".concat( ` [${index}] - ${item.args[index]}`);
                    }            
                }

            // Checks whether input conditions are met or not. If so then call up smart contract function
            if (inputs == "OK") {
                await (<menuRecord>smart.find((el: menuRecord ) => el.tag == level)).call( accountList, <rwRecord>item );
                //item.args = record.args.map((el) => el);
                tag = "";
                index = 0;
                inputs = "None";
                promptText = `Function (<Help> <back> or <Function>) `;
                }            
            }

        // We update the prompt text with the new status, waiting for new command
        if (item != undefined) {
            rl.setPrompt("".concat( 
                (level.length > 0) ? `<${item.contract}> ` : "",
                (tag.length > 0) ? `<${item.function}> ` : "",
                `<${inputs}> `, promptText, ` >> `));
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
          }).on('pause', () => {
            console.log('Pause.');
          }); 
    }

main().catch((error) => {
  console.error("Erreur", error);
  process.exitCode = 1;
});