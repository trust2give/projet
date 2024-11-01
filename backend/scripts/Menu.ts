const hre = require("hardhat");
import { readLastContractSetJSONfile, writeLastContractJSONfile, InteractWithContracts, readLastDiamondJSONfile, readLastFacetJSONfile, writeLastFacetJSONfile } from "./InteractWithContracts";
//import { T2G_InteractERC20, rwERC20List } from "./T2G_InteractERC20";
import { Address } from "viem";
//import { T2G_InteractDiamond, rwDiamondList } from "./T2G_InteractDiamond";
//import { T2G_InteractERC721, rwERC721List } from "./T2G_InteractERC721";
//import { T2G_InteractHoney, rwHoneyList } from "./T2G_InteractHoney";
//import { T2G_InteractPollen, rwPollenList } from "./T2G_InteractPollen";
//import { T2G_InteractNektar, rwNektarList } from "./T2G_InteractNektar";
//import { T2G_InteractPool, rwPoolList } from "./T2G_InteractPool";
//import { T2G_InteractSyndic, rwSyndicList } from "./T2G_InteractSyndic";
import { colorOutput, regex, regex2, Account, Value, NULL_ADDRESS, displayAccountTable, rwRecord, rwType, listOfEnums, menuRecord, senderValue } from "./T2G_utils";
import { DeployContracts, writeLastDiamondJSONfile } from "./DeployContracts";
import * as readline from 'readline';
import { contractSet, diamondNames } from "./T2G_Data";

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
    index?: number,
    tag?: string,
    help?: string,
    level?: string,
    promptText?: string,
    preset?: string,
    sender?: Account,
    item?: rwRecord
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
                    var root = (item.diamond == Account.AA) ? accountList[10] : (item.diamond == Account.AE) ? accountList[11] : undefined;
                    item.instance = await hre.viem.getContractAt( item.contract, (root != undefined) ? root : accountList[10], { client: { wallet: wallets[senderValue(globalState.sender)] } } );
                    item.events = await publicClient.getContractEvents({ abi: item.instance.abi, address: (root != undefined) ? root : accountList[10], })
                    }
            else item.instance = undefined;
            }
        else item.instance = undefined;
        }
    }

function setState( newState: menuState, item?: rwRecord) {
    globalState = Object.assign( globalState, newState );
    if (item != undefined) globalState.item = item; 
    }

export var globalState : menuState = {};

/// SMART OBJECT
/// Array to append when a new contract is to be deployed along with the T2G_Data.ts file
/// Add a new object after having created a new callback function (script T2G_InteractXXXX.ts)
/// Please be aware not to use a tag value which is similar to other keyword used. 
/// Nor similar to any function name of the facets to interact with. Make it unique.

export var smart : menuRecord[] = [ 
    { tag: "Deploy", contract: undefined, diamond: undefined, args: [], instance: undefined, events: undefined }, 
    { tag: "EUR", contract: "EUR", diamond: Account.AE, args: [], instance: undefined, events: undefined },
    { tag: "Honey", contract: "T2G_HoneyFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined },
    { tag: "Diamond", contract: "T2G_root", diamond: Account.AA, args: [], instance: undefined, events: undefined },
    { tag: "Erc721", contract: "ERC721Facet", diamond: Account.AA, args: [], instance: undefined, events: undefined }, 
    { tag: "Pool", contract: "T2G_PoolFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined },
    { tag: "Nektar", contract: "T2G_NektarFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined }, 
    { tag: "Pollen", contract: "T2G_PollenFacet", diamond: Account.AA, args: [], instance: undefined, events: undefined },
    { tag: "Syndication", contract: "T2G_SyndicFacet",  diamond: Account.AA, args: [], instance: undefined, events: undefined } 
    ];


async function main() {

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

    setState( { inputs: "None", deploy: false, index: 0, tag: "", help: "", level: "", promptText: "Smart Contract (<Help>, <Accounts> or <Contact Name>) >> ", preset: "" }, <rwRecord>{});

    // Get the "Get_T2G_XXXFacet()" readers for fetching real addresses.
    accountList.push( (await readLastDiamondJSONfile()).Diamond.address );
    accountList.push( (await readLastContractSetJSONfile()[0]).address );
    accountList.push( await readLastFacetJSONfile( "T2G_PoolFacet", accountList[10]) );
    accountList.push( await readLastFacetJSONfile( "T2G_HoneyFacet", accountList[10]) );
    accountList.push( await readLastFacetJSONfile( "T2G_NektarFacet", accountList[10]) );
    accountList.push( await readLastFacetJSONfile( "T2G_PollenFacet", accountList[10]) );

    await updateInstances( accountList );    
  
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AA"]}: `.concat(accountList[10]), " T2G Root" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AE"]}: `.concat(accountList[11]), " EUR SC" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AF"]}: `.concat(accountList[12]), " PoolSC" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AH"]}: `.concat(accountList[13]), " HoneySC" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AN"]}: `.concat(accountList[14]), " NektarSC" ).padEnd(59, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AP"]}: `.concat(accountList[15]), " PollenSC" ).padEnd(59, " ")).concat("*"), "cyan");

    
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
        
        if ((globalState.inputs == "None") && (smart.some((el: menuRecord) => el.tag == answer))) {            
            // Check whether Deploy option is selected or not
            setState( { deploy: <boolean>(answer == smart[0].tag ) });
            setState( { level: !globalState.deploy ? answer : "", inputs: globalState.deploy ? "None" : "Function" });
            
            if (globalState.deploy) setState( { tag: "" }, <rwRecord>{});
            else {
                record = <menuRecord>smart.find((el: menuRecord ) => el.tag == globalState.level);
                Choices = record.instance.abi.filter( (item) => (item.type == "function")).map((item) => item.name);
                }            
            }
        else if ((globalState.inputs == "Function") && (Choices.some((el : string) => el == answer))) {      
            const rwRec = (name : string) : rwRecord => {
                const fct = record.instance.abi.filter((item) => (item.type == "function" && item.name == answer))[0];
                return <rwRecord>{ 
                    rwType: fct.stateMutability == "view" ? rwType.READ : rwType.WRITE,
                    contract: record.contract,
                    function: fct.name, 
                    args: fct.inputs,
                    values: [],
                    outcome: fct.outputs };
                    }             
            setState( { inputs: "Sender", tag: answer }, rwRec(answer));
            }
        else if (answer == "Accounts")  displayAccountTable(accountList);
        else if (answer == "State")  console.log(globalState);
        else if (answer == "back") setState( { inputs: "None", tag: "", level: "" }, <rwRecord>{});
        else if (answer == "Help") {
            if (globalState.level == "") setState( { help: "Avalaible Smart Contract Keywords [".concat( smart.map( (el) => el.tag ).join("| "), "]\n") });
            else setState( { help: "Avalaible Function Keywords [".concat( Choices.join("| "), "]\n") });
            colorOutput(<string>globalState.help, "yellow");
            }
        
        // In the case when Deploy is selected
        if (globalState.deploy) {
            if (answer == "back") setState( { inputs: "None", deploy: false, tag: "", level: "" }, <rwRecord>{});
            else if (answer == "Help") {
                setState( { help: "Command template : <Contract> <Action> <List of Smart Contract> \n where Contract = {Facet/Contract/Diamond} action = {Add/Replace/Remove} {[contractName ContractName...]} ]\n" });
                colorOutput(<string>globalState.help, "yellow");
                }
            else {
                const [ diaAddress, scAddress, facetList ] = await DeployContracts( accountList, answer );
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
                if (facetList != NULL_ADDRESS && typeof facetList == "object") {
                    console.log(facetList);
                    writeLastFacetJSONfile( facetList, diamondNames.Diamond.address );
                    }
                }
            }
        // In the case when contract are selected. 
        // Checks if contract and function are set up. If so, key in the values for sender and inputs
        else {
            switch (globalState.inputs) {
                case "Sender": {
                    if (!Object.values(Account).includes(<Account>answer)) break;
                    else {
                        if (globalState.sender != <Account>answer) {
                            globalState.sender = <Account>answer;
                            await updateInstances( accountList );    
                            }

                        setState( { inputs: (globalState.item.args.length > 0) ? "Args" : "OK", index: 0 });
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
                                else if (Object.values(Account).includes(<Account>answer)) {
                                    if (<Account>answer == Account.AA) item.values[index++] = accountList[10];
                                    else if (<Account>answer == Account.AE) item.values[index++] = accountList[11];
                                    else if (<Account>answer == Account.AF) item.values[index++] = accountList[12];
                                    else if (<Account>answer == Account.AH) item.values[index++] = accountList[13];
                                    else if (<Account>answer == Account.AN) item.values[index++] = accountList[14];
                                    else if (<Account>answer == Account.AP) item.values[index++] = accountList[15];
                                    else item.values[index++] = accountList[Number(answer.substring(1))];
                                    }
                                break;
                                } 
                            case "string": { item.values[index++] = String(answer); break; }                  
                            case "uint8": { 
                                const parse = <string>item.args[index].internalType.split(' ');
                                if (parse[0] == "enum") {
                                    const parseEnum = parse[1].split('.');
                                    const val : string = (parseEnum.length > 1) ? parseEnum[1] : parseEnum[0];
                                    if (!Number.isNaN(answer) && Number(answer) < 2**8) item.values[index++] = Number(answer); 
                                    else {
                                        const rank = (<string[]>listOfEnums[val]).findIndex((item) => item == answer);
                                        if (rank > -1 ) item.values[index++] = Number(rank);
                                        }
                                    }
                                else if (parse[0] == "uint8") {
                                    if (!Number.isNaN(answer) && Number(answer) < 2**8)  {
                                        item.values[index++] = Number(answer); 
                                        }
                                    }                                      
                                break; 
                                }                  
                            case "uint256": { item.values[index++] = BigInt(answer); break; }                  
                            case Value.Index: { item.values[index++] = BigInt(answer); break; }                  
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
                var rootAddress: Address = accountList[10];
                
                if (record.diamond == Account.AA) rootAddress = accountList[10]; // (readLastContractSetJSONfile())[0].address;
                else if (record.diamond == Account.AE) rootAddress = accountList[11]; // (readLastContractSetJSONfile())[0].address;

                await InteractWithContracts( <rwRecord>globalState.item, <Account>globalState.sender, accountList, [ record, smart[1] ] );
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
            if (index < globalState.item.args.length)
                var args = globalState.item.args[index];
                setState({ promptText: "Arg".concat( ` [${index}] - ${args.name} [${args.type}] `), preset: "@" });
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