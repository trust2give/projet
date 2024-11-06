const hre = require("hardhat");
import { readLastContractSetJSONfile, writeLastContractJSONfile, InteractWithContracts, writeLastDiamondJSONfile, readLastDiamondJSONfile, readLastFacetJSONfile, writeLastFacetJSONfile } from "./InteractWithContracts";
import { AbiFunction, Address, getAbiItem } from "viem";
import { colorOutput, regex, regex2, regex3, Account, Value, NULL_ADDRESS, displayAccountTable, rwRecord, rwType, menuRecord, accountIndex, enumOrValue } from "./T2G_utils";
import { DeployContracts,  } from "./DeployContracts";
import * as readline from 'readline';
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "./T2G_Data";
import { listOfEnums, TokenEntitySpecific, dataDecodeABI } from "./T2G_Types";
import { encodeAbiParameters, decodeAbiParameters } from 'viem'
import { bigint } from "hardhat/internal/core/params/argumentTypes";

/*******************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Menu with T2G & ERC20 Contracts
* Version 2.0 - Date : 31/10/2024
* 
* This is the main script for running an interactive session with the T2G smart contracts
* Either to manage and deploy the smart contracts under an ERC 2535 architecture
* Or to run any function of the deployed facets of the T2G application
* 
* The data structure of the T2G application is borne by both T2G_Data.ts file, to be updated
* mainly when a new smart contract is to be deployed, prior to running the script
* 
* When creating and appending a new smart contract, please also update the smart variable below 
* with the relevant  features for the smart contract to interact with.
* * 
* The applicable commands when running the script:
* - Help : gives an outlook of the available commands to apply
* - Account : gives the list of the first 10 accounts / wallets alive on Testnet
* - Deploy : enter the management mode of the ERC2535 architecture, where you can
* add/replace/remove facets or rebuild a complete T2G Diamond or StableCoin contract
* 
* When in Deploy mode, three JSON files are updated : FacetJson, ContractSet.Json & T2G_root.Json
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

type  menuState = {
    inputs?: "None" | "Function" | "Sender" | "Args" | "OK" = "None",
    deploy?: boolean,
    object?: boolean,
    index?: number,
    subIndex?: number,
    tag?: string,
    help?: string,
    level?: string,
    promptText?: string,
    preset?: string,
    sender?: Account,
    item?: rwRecord,
    subItem?: Array<any>,
    pad?: number
    }

/// Function that fetch the new instances of each smart contract
/// given the sender wallet
export async function updateInstances( accountList: Address[] ) {
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const level : string | undefined = globalState.level;

    for( const item of smart ) {
        if (level == undefined || level == "" || level == item.tag) {
            if ((item.contract != undefined) || (item.diamond != undefined)) {
                    var root = (item.diamond == Account.AA) ? accountList[10] : (item.diamond == Account.AB) ? accountList[11] : undefined;
                    item.instance = await hre.viem.getContractAt( item.contract, (root != undefined) ? root : accountList[10], { client: { wallet: wallets[accountIndex(<Account>globalState.sender)] } } );
                    item.events = await publicClient.getContractEvents({ abi: item.instance.abi, address: (root != undefined) ? root : accountList[10], })
                    }
            }
        }
    }

function setState( newState: menuState, item?: rwRecord) {
    globalState = Object.assign( globalState, newState );
    if (item != undefined) globalState.item = item; 
    }

export var globalState : menuState = {};

export var accountRefs: Object = {};

async function main() {

    const width = 70;
    var ABIformat = [];

    colorOutput( "*".padEnd(width, "*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(5, " "), "Welcome to the Trust2Give dApp Interaction Menu" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(7, " "), "This application allow to interact and test" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(10, " "), "Author: franck.dervillez@trust2give.fr" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( "*".padEnd(width, "*"), "cyan");

    // We get the list of available accounts from hardhat testnet
    const accounts = await hre.ethers.getSigners();

    var rank = 0;
    for (const wallet of accounts.toSpliced(10)) {
        accountRefs = Object.assign( accountRefs, Object.fromEntries(new Map([ [`@${rank}`, { name: `Wallet ${rank}`, address: wallet.address} ] ])));
        rank++;
        }
    
    const addAccount = (ref: object, rank: number, name: string, addr: Address) : Object => {
        const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return Object.assign( ref, Object.fromEntries(new Map([ [ `@${indice.substring(rank,rank + 1)}`, { name: name, address: addr } ] ])));
        }

    const account = ( rank: number ) : Address => {
        const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        type refKeys = keyof typeof accountRefs;
        if (rank != undefined && rank > -1 && rank < 36) return accountRefs[<refKeys>`@${indice.substring(rank,rank + 1)}`].address;
        return NULL_ADDRESS;
        }
    
    const accountList = () : Address[] => {
        var list: Address[] = [];
        for (const item of Object.values(accountRefs)) {
            list.push(item.address);
            }
        return list;
        }
    
    // We complete the list with possible two other address: T2G_Root & EUR contracts
    // since they can be selected as Account.AA & Account.AE options

    setState( { inputs: "None", 
                deploy: false, 
                object: false, 
                index: 0, 
                subIndex: 0,
                tag: "", 
                help: "", 
                level: "", 
                promptText: "Smart Contract (<Help>, <Accounts> or <Contact Name>) >> ", 
                preset: "", 
                pad: 10,
                subItem: [] }, 
                <rwRecord>{});

    await readLastDiamondJSONfile();
    await readLastContractSetJSONfile();
    
    // Get the "Get_T2G_XXXFacet()" readers for fetching real addresses.
    accountRefs = addAccount( accountRefs, 10, diamondNames.Diamond.name, diamondNames.Diamond.address );
    accountRefs = addAccount( accountRefs, 11, contractSet[0].name, contractSet[0].address );

    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AA"]}: `.concat(account(10)), " T2G Root" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AB"]}: `.concat(account(11)), " EUR SC" ).padEnd(width - 1, " ")).concat("*"), "cyan");

    rank = 12;
    type AccountKeys = keyof typeof Account;
    const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const facet of facetNames) {
        if (smart.findIndex((item) => item.contract == facet.name) > -1) {
            const newAddress = await readLastFacetJSONfile( facet.name, account(10)); 
            accountRefs = addAccount( accountRefs, rank, facet.name, newAddress );
            colorOutput( ("*".concat(" ".padStart(2, " "), `${Account[<AccountKeys>`A${indice.substring(rank,rank + 1)}`]}: `.concat(account(rank)), " ", facet.name ).padEnd(width - 1, " ")).concat("*"), "cyan");
            rank++;
            }
        }

    await updateInstances( accountList() );    
    
    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        });
    
        const trace : boolean = false
                
        var record : menuRecord;
        //var item : rwRecord | null;
        var Choices : string[] = [];
        
        rl.setPrompt(<string>globalState.promptText);
        rl.prompt();
        
        rl.on('line', async (line) => {
        var answer : string = line.trim();
        
        if ((globalState.inputs == "None") && (answer == "Deploy")) setState( { deploy: true, object: false, index: 0, subIndex: 0, level: "", inputs: "None", tag: "", subItem: [] }, <rwRecord>{});
        else if ((globalState.inputs == "None") && (smart.some((el: menuRecord) => el.tag == answer))) {            
            setState( { deploy: false, object: false, level: answer, inputs: "Function" });            
            record = <menuRecord>smart.find((el: menuRecord ) => el.tag == globalState.level);
            Choices = record.instance.abi.filter( (item) => (item.type == "function")).map((item) => item.name);
            }
        else if ((globalState.inputs == "Function") && (Choices.some((el : string) => el == answer))) {      
            const rwRec = (name : string) : rwRecord => {
                const fct = record.instance.abi.filter((item) => (item.type == "function" && item.name == answer))[0];
                
                return <rwRecord>{ 
                    rwType: (fct.stateMutability == "view" || fct.stateMutability == "pure") ? rwType.READ : rwType.WRITE,
                    contract: record.contract,
                    function: fct.name, 
                    args: fct.inputs,
                    values: [],
                    outcome: fct.outputs };
                    }             
            setState( { inputs: "Sender", object: false, tag: answer, index: 0, subIndex: 0 }, rwRec(answer));
            }
        else if (answer == "Accounts")  displayAccountTable(accountRefs, width);
        else if (answer == "State")  console.log(globalState);
        else if (answer == "back") setState( { inputs: "None", object: false, tag: "", level: "" }, <rwRecord>{});
        else if (answer == "Help") {
            if (globalState.level == "") setState( { help: "Avalaible Smart Contract Keywords [".concat( smart.map( (el) => el.tag ).join("| "), "]\n") });
            else setState( { help: "Avalaible Function Keywords [".concat( Choices.join("| "), "]\n") });
            colorOutput(<string>globalState.help, "yellow");
            }
        
        // In the case when Deploy is selected
        if (globalState.deploy) {
            if (answer == "back") setState( { inputs: "None", deploy: false, object: false, tag: "", level: "" }, <rwRecord>{});
            else if (answer == "Help") {
                setState( { help: "Command template : <Contract> <Action> <List of Smart Contract> \n where Contract = {Facet/Contract/Diamond} action = {Add/Replace/Remove} {[contractName ContractName...]} ]\n" });
                colorOutput(<string>globalState.help, "yellow");
                }
            else {
                await DeployContracts( accountList(), answer, smart );

                accountRefs = addAccount( accountRefs, 10, diamondNames.Diamond.name, diamondNames.Diamond.address );
                accountRefs = addAccount( accountRefs, 11, contractSet[0].name, contractSet[0].address );
                        
                //await updateInstances( accountList() );
                }
            }
        // In the case when contract are selected. 
        // Checks if contract and function are set up. If so, key in the values for sender and inputs
        else {
            type refKeys = keyof typeof accountRefs;

            switch (globalState.inputs) {
                case "Sender": {
                    if (!Object.keys(accountRefs).includes(answer)) break;
                    else {
                        if (globalState.sender != <Account>answer) {
                            globalState.sender = <Account>answer;
                            await updateInstances( accountList() );  
                            }

                        setState( { inputs: (globalState.item.args.length > 0) ? "Args" : "OK", object: false, index: 0, subIndex: 0, subItem: [] });
                        answer = "";
                        }
                    break;
                    }
                case "Args": {
                    try {
                        var index: number = <number>globalState.index;
                        var item: rwRecord = globalState.item;
                        switch (item.args[index].type) {
                            case "address": { 
                                if (answer.match(regex)) item.values[index++] = answer;
                                else if (Object.keys(accountRefs).includes(answer)) {
                                    item.values[index++] = <{name: string, address: Address }>accountRefs[<refKeys>answer].address;
                                    }
                                break;
                                } 
                            case "string": { item.values[index++] = String(answer); break; }                  
                            case "uint8": { 
                                const val = enumOrValue( item.args, index, answer );
                                if (val != undefined) item.values[index++] = val;
                                break; 
                                }                  
                            case "uint256": { item.values[index++] = BigInt(answer); break; }                  
                            case "bytes": { 
                                // we are in the case when an encoded complex struct is to be passed
                                // It may require additionnal sub-inputs to get
                                if (globalState.object) {
                                    var subValue = undefined;
                                    switch (ABIformat[0].components[<number>globalState.subIndex].type) {
                                        case "uint8": { subValue = enumOrValue( ABIformat[0].components, <number>globalState.subIndex, answer ); break; }
                                        case "string": { subValue = answer; break; }
                                        case "string[]": { subValue = answer.split(";"); break; }
                                        case "uint256": { subValue = BigInt(answer); break; }
                                        default:
                                        }
                                    if (subValue != undefined) {
                                        globalState.subItem?.push(subValue);
                                        setState( { subIndex: <number>globalState.subIndex + 1 });
                                        }
                                    }
                                if (globalState.subIndex >= ABIformat[0].components.length) {
                                    const encodedData = encodeAbiParameters( ABIformat, [globalState.subItem] );
                                    item.values[index++] = encodedData; 
                                    setState( { object: false, subIndex: 0, subItem: [] });
                                    }
                                break; 
                                }                  
                            case "bytes4": { 
                                if (answer.match(regex3)) item.values[index++] = answer;
                                break; 
                                }                  
                            case Value.TokenId: { item.values[index++] = BigInt(answer); break; }                  
                            case Value.Hash: { if (answer.match(regex2)) item.values[index++] = answer; break; }                  
                            case "bool": {
                                if (["True", "true", "Vrai", "vrai", "1"].includes(answer)) item.values[index++] = true;
                                else if (["False", "false", "Faux", "faux", "0", "-1"].includes(answer)) item.values[index++] = false;
                                else break;
                                break;
                            }
                            default:
                                
                            }   
                        setState( { inputs: (index < globalState.item.args.length) ? "Args" : "OK", index: index, item: item });
                        }
                    catch (error) {
                        console.log("erreur", Object.entries(error));                        
                        }
                    break;
                    }
                default:            
                    if (trace) console.log("Execute Input Default", globalState.inputs, globalState.level, globalState.tag, globalState.item)
                }
            // Checks whether input conditions are met or not. If so then call up smart contract function
            if (globalState.inputs == "OK") {
                await InteractWithContracts( <rwRecord>globalState.item, <Account>globalState.sender, accountRefs, accountList(), [ record, smart[1] ], <number>globalState.pad );
                setState( { inputs: "Function", tag: "" }, <rwRecord>{});
                }
            }

        //var preset: string = "";
        // We update the prompt text with the new status, waiting for new command
        switch (globalState.inputs) {
        case "None": {
            setState({ promptText: (globalState.deploy) ? "Deploy Smart Contract (<Help>, <Accounts> or Contract Name) " : 
                                    "Which Smart Contract (<Help>, <Accounts> or Contract Name) ? " , preset: "" });
            break;
            }
        case "Function": {
            setState({ promptText: `Which Function (<Help>, <Accounts>, <back> or Function Name ) ? `, preset: "" });
            break;
            }
        case "Sender": {
            setState({ promptText: "Which Sender's Account (msg.sender) [@0 ... @9] ? ", preset: "@" });
            break;                
            }
        case "Args": {
            const index = <number>globalState.index;
            const subIndex = <number>globalState.subIndex;
            if (index < (<rwRecord>globalState.item).args.length) {
                var argPointer = (<rwRecord>globalState.item).args[index];
                // Check if we are requesting simple type inputs or (bytes memory _data) -like input
                if (argPointer.type == "bytes" && argPointer.name == "_data") {
                    if (subIndex == 0) {
                        if ((<rwRecord>globalState.item).contract in encodeInterfaces) {
                            type encKeys = keyof typeof encodeInterfaces;
                            const encodeInput = encodeInterfaces[<encKeys>(<rwRecord>globalState.item).contract].find((item) => item.function == (<rwRecord>globalState.item).function);
                            // We check that the related function is concerned or not by the abi.encode
                            if (encodeInput != undefined) {
                                if ("_data" in encodeInput) {
                                    if (encodeInput._data in dataDecodeABI) {
                                        type decKeys = keyof typeof dataDecodeABI;
                                        ABIformat =  dataDecodeABI[<decKeys>encodeInput._data];
                                        setState( { object: true, subItem: [] });
                                        }
                                    }
                                }
                            }
                        }
                    setState({ promptText: "Arg".concat( ` [${index} / ${subIndex}] - ${argPointer.name} [${ABIformat[0].name} ${ABIformat[0].components[subIndex].name}]`), preset: "@" });
                    } 
                else setState({ promptText: "Arg".concat( ` [${index}] - ${argPointer.name} [${argPointer.type}] `), preset: "@" });
               }
            break;                
            }
        default:
        }

        setState({ promptText: "".concat( 
            colorOutput( `[ ${(globalState.level != "") ? globalState.level : "None"}|${(globalState.tag != "") ? globalState.tag : "None"}|${globalState.inputs}] `, "cyan", true ), 
                            <string>globalState.promptText ), 
                            preset: "" });
            
        rl.setPrompt(<string>(globalState.promptText).concat(` >> `));
        if (globalState.preset != "") {
            rl.write(globalState.preset); 
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