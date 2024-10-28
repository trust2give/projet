const hre = require("hardhat");
import { rwRecord, readLastDiamondJSONfile } from "./InteractWithContracts";
import { readLastContractSetJSONfile } from "./InteractWithERC20";
import { Address } from "viem";
import { T2G_InteractERC20, rwERC20List, writeLastContractJSONfile } from "./T2G_InteractERC20";
import { T2G_InteractDiamond, rwDiamondList } from "./T2G_InteractDiamond";
import { T2G_InteractERC721, rwERC721List } from "./T2G_InteractERC721";
import { T2G_InteractHoney, rwHoneyList } from "./T2G_InteractHoney";
import { T2G_InteractNektar, rwNektarList } from "./T2G_InteractNektar";
import { T2G_InteractPool, rwPoolList } from "./T2G_InteractPool";
import { T2G_InteractSyndic, rwSyndicList } from "./T2G_InteractSyndic";
import { colorOutput, regex, regex2, Account, Value, NULL_ADDRESS, diamondCore } from "./T2G_utils";
import { DeployContracts, writeLastDiamondJSONfile } from "./DeployContracts";
import * as readline from 'readline';
import { contractSet, diamondNames } from "./T2G_Data";

/*******************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Menu with T2G & ERC20 Contracts
* Version 1.0 - Date : 27/10/2024
* 
* This is the main script for running an interactive session with the T2G smart contracts
* Either to manage and deploy the smart contracts under an ERC 2535 architecture
* Or to run any function of the deployed facets of the T2G application
* 
* The data structure of the T2G application is borne by both T2G_Data.ts file, to be updated
* mainly when a new smart contract is to be deployed, prior to running the script
* 
* When creating and appending a new smart contract, please also update the smart variable below 
* with the relevant  features for the smart contract to interact with, as well as create a new
* related script file T2G_Interact<Contract>.ts
* 
* The T2G_Interact<Contract>.ts script contains two main things:
* 1. another important variable to be created that represents the functions to interact with, 
* inside the smart contract.
* 2. A callback function that the menu calls up when the smart contract is selected
* 
* The applicable commands when running the script:
* - Help : gives an outlook of the available commands to apply
* - Account : gives the list of the first 10 accounts / wallets alive on Testnet
* - Deploy : enter the management mode of the ERC2535 architecture, where you can
* add/replace/remove facets or rebuild a complete T2G Diamond or StableCoin contract
* 
* When in Deploy mode, two JSON files are updated : ContractSet.Json & T2G_root.Json
* These two files are to be kept as is and not altered by the user otherwise the reference
* and addresses of T2G_Root & StableCOint contracts will be lost. Theses files are used
* to get the addresses back when interacting with facets.
* 
/*******************************************************************************************/

/// Commands to run the script:
/// netstat -a -o -n        - check PID for any already running instance
/// taskkill /f /pid ####   - kill the PID if necessary
/// npx hardhat node        - Run the hardhat node prior to script if required
/// npx hardhat run .\scripts\Menu.ts --network localhost | test - Run the script (test for NAS version)

type menuRecord = {
    tag: string,
    call: ((accountList: Address[], item: rwRecord | string) => any),
    data: rwRecord[],
    args: Object,
    sender: Object
    }

async function main() {

    /// SMART OBJECT
    /// Array to append when a new contract is to be deployed along with the T2G_Data.ts file
    /// Add a new object after having created a new callback function (script T2G_InteractXXXX.ts)
    /// Please be aware not to use a tag value which is similar to other keyword used. 
    /// Nor similar to any function name of the facets to interact with. Make it unique.

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

    colorOutput( "*".padEnd(60, "*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(5, " "), "Welcome to the Trust2Give dApp Interaction Menu" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(7, " "), "This application allow to interact and test" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(10, " "), "Author: franck.dervillez@trust2give.fr" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( "*".padEnd(60, "*"), "cyan");

    // We get the list of available accounts from hardhat testnet
    const accounts = await hre.ethers.getSigners();
    const accountList: Address[] = accounts.map( (add, i : number ) => {    
        return <Address>add.address;
        }).toSpliced(10);
    
    // We complete the list with possible two other address: T2G_Root & EUR contracts
    // since they can be selected as Account.AA & Account.AE options

    accountList.push( (await readLastDiamondJSONfile()).Diamond.address );
    accountList.push( (await readLastContractSetJSONfile()[0]).address );
  
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AA"]}: `.concat(accountList[10]), " T2G Root" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AE"]}: `.concat(accountList[11]), " EUR SC" ).padEnd(59, " ")).concat("*"), "cyan");

    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        });
    
    const trace : boolean = false

    var inputs: "None" | "Function" | "Sender" | "Args" | "OK" = "None";
    var deploy: boolean = false;

    var index : number = 0;
    var record : menuRecord;
    var item : rwRecord | undefined;

    var tag : string = "";
    var help : string = "";
    var level : string = "";
    var Choices : string[] = [];

    var promptText : string = "Smart Contract (<Help>, <Accounts> or <Contact Name>) >> ";

    rl.setPrompt(promptText);
    rl.prompt();

    rl.on('line', async (line) => {
        var answer : string = line.trim();
        
        if (smart.some((el: menuRecord) => el.tag == answer)) {            
            // Check whether Deploy option is selected or not
            deploy = <boolean>(answer == smart[0].tag );
            level = !deploy ? answer : "";
            inputs = deploy ? "None" : "Function";
            if (deploy) {
                tag = "";
                item = undefined;
                }
            else {
                record = <menuRecord>smart.find((el: menuRecord ) => el.tag == level);
                Choices = record.data.map( (item) => { return item.function;} );
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
            inputs = "Sender";
            }
        else if (answer == "Accounts") {
            colorOutput( "*".padEnd(60, "*"), "yellow");
            colorOutput( ("*".concat(" ".padStart(9, " "), "List of avaibable wallets @hardhat testnet" ).padEnd(59, " ")).concat("*"), "yellow");
        
            accountList.map( (add: Address, i : number ) => {    
                if (i == 0) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["A0"]}: `.concat(add), " T2G Owner" ).padEnd(59, " ")).concat("*"), "cyan");
                if (i > 0 && i < 10) {
                    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["A".concat(i)]}: `.concat(add), " Wallet" ).padEnd(59, " ")).concat("*"), "yellow");
                    }
                if (i == 10) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AA"]}: `.concat(add), " T2G Root" ).padEnd(59, " ")).concat("*"), "cyan");
                if (i == 11) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AE"]}: `.concat(add), " EUR SC" ).padEnd(59, " ")).concat("*"), "cyan");
                return <Address>add;
                })
        
            colorOutput( ("*".concat(" ".padStart(2, " "), "@0, @A & @AE : T2G dApp set, Other @x ready for testings" ).padEnd(59, " ")).concat("*"), "yellow");
            colorOutput( "*".padEnd(60, "*"), "yellow");
            }
        else if (answer == "back") {
            level = "";
            tag = "";
            item = undefined;
            inputs = "None";
            }
        else if (answer == "Help") {
            if (level == "") help = "Avalaible Smart Contract Keywords [".concat( smart.map( (el) => el.tag ).join("| "), "]\n");
            else help = "Avalaible Function Keywords [".concat( Choices.join("| "), "]\n");
            colorOutput(help, "yellow");
            }
        
        // In the case when Deploy is selected
        if (deploy) {
            if (answer == "back") {
                level = "";
                tag = "";
                item = undefined;
                inputs = "None";
                deploy = false;
                }
            else if (answer == "Help") {
                help = "Command template : <Contract> <Action> <List of Smart Contract> \n where Contract = {Facet/Contract/Diamond} action = {Add/Replace/Remove} {[contractName ContractName...]} ]\n";
                colorOutput(help, "yellow");
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
                    colorOutput( "SC Contract  @[".concat(scAddress, "]"), "green");
                    contractSet[0].address = scAddress;
                    writeLastContractJSONfile();
                    }
                }
            }
        // In the case when contract are selected. 
        // Checks if contract and function are set up. If so, key in the values for sender and inputs
        else {
            switch (inputs) {
                case "Sender": {
                    if (trace) console.log("Execute Input Sender", inputs, level, tag, item, answer)
                    if (!Object.values(Account).includes(<Account>answer)) break;
                    else {
                        item.sender = <Account>answer;
                        if (item.args.length > 0) {
                            index = 0;
                            inputs = "Args";
                            answer = "";
                        }
                        else inputs = "OK";
                        }
                    break;
                    }
                case "Args": {
                    if (trace) console.log("Execute Input Args")
                    try {
                        switch (item.args[index]) {
                            case Value.Account: {
                                if (Object.values(Account).includes(<Account>answer)) {
                                    if (<Account>answer == Account.AA) item.args[index] = accountList[10];
                                    else if (<Account>answer == Account.AE) item.args[index] = accountList[11];
                                    else item.args[index] = accountList[Number(answer.substring(1))];
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
                                if (Number(answer) != NaN) {
                                    item.args[index] = Number(answer);
                                    if (++index >= item.args.length) inputs = "OK";                                    
                                    }
                                break;
                                }                  
                            case Value.Text: {
                                item.args[index] = String(answer);
                                if (++index >= item.args.length) inputs = "OK";
                                break;
                                }                  
                            case Value.Flag: {
                                if (["True", "true", "Vrai", "vrai", "1"].includes(answer)) item.args[index] = true;
                                else if (["False", "false", "Faux", "faux", "0", "-1"].includes(answer)) item.args[index] = false;
                                else break;
                                if (++index >= item.args.length) inputs = "OK";
                                break;
                                }
                            default:
                                    
                            }   
                        }
                    catch (error) {
                        console.log("erreur", Object.entries(error));                        
                        }
                    break;
                    }
                default:            
                    if (trace) console.log("Execute Input Default", inputs, level, tag, item)
                }
            // Checks whether input conditions are met or not. If so then call up smart contract function
            if (inputs == "OK") {
                await (<menuRecord>smart.find((el: menuRecord ) => el.tag == level)).call( accountList, <rwRecord>item );

                if (trace) console.log("Execute Input OK")

                tag = "";
                inputs = "Function";
                item = undefined;
                }            
            }

        var preset: string = "";
        // We update the prompt text with the new status, waiting for new command
        switch (inputs) {
        case "None": {
            if (deploy) promptText = "Deploy Smart Contract (<Help>, <Accounts> or Contract Name) ";
            else promptText = "Which Smart Contract (<Help>, <Accounts> or Contract Name) ? ";
            break;
            }
        case "Function": {
            promptText = `Which Function (<Help>, <Accounts>, <back> or Function Name ) ? `;
            break;
            }
        case "Sender": {
            promptText = "Which Sender's Account (msg.sender) [@0 ... @9] ? "; 
            preset = "@";
            break;                
            }
        case "Args": {
            switch (item.args[index]) {
                case Value.Account: {
                    promptText = "Arg".concat( ` [${index}] - Account [@0 ... @9] `);
                    preset = "@"
                    break;
                    } 
                case Value.Number: {
                    promptText = "Arg".concat( ` [${index}] - Number `);
                    break;
                    }                  
                case Value.Index: {
                    promptText = "Arg".concat( ` [${index}] - Index[ BigInt ] `);
                    break;
                    }                  
                case Value.TokenId: {
                    promptText = "Arg".concat( ` [${index}] - TokenId[ BigInt ] `);
                    break;
                    }                  
                case Value.Address: {
                    promptText = "Arg".concat( ` [${index}] - Address [20 bytes][0x....] `);
                    preset = "0x"
                    break;
                    }                  
                case Value.Hash: {                                
                    promptText = "Arg".concat( ` [${index}] - Hash [32 bytes][0x....] `);
                    preset = "0x"
                    break;
                    }                  
                case Value.Enum: {
                    promptText = "Arg".concat( ` [${index}] - Enum [Integer] [0...N] `);
                    break;
                    }                  
                case Value.Text: {
                    promptText = "Arg".concat( ` [${index}] - Text [String] `);
                    break;
                    }                  
                case Value.Flag: {
                    promptText = "Arg".concat( ` [${index}] - Boolean [False (0)/ True (1)] `);
                    break;
                    }
                default:
                        
                }   
            break;                
            }
        default:
        }

        if (item != undefined) {
            promptText = "".concat( colorOutput( `[${item.contract}|${item.function}|${inputs}] `, "cyan", true ), promptText );
            }
        else {
            promptText = "".concat( colorOutput( `[${(level != "") ? level : "None"}|${(tag != "") ? tag : "None"}|${inputs}] `, "cyan", true ), promptText );
            }
            
        rl.setPrompt(promptText.concat(` >> `));
        if (preset != "") {
            rl.write(preset); 
            rl.write(null, { ctrl: true, name: 'f' });
            }
        // we wait for the next input from user
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