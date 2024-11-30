const hre = require("hardhat");
import { Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
import * as readline from 'readline';
import { InteractWithContracts } from "./InteractWithContracts";
import { readLastContractSetJSONfile, 
         writeLastContractJSONfile, 
         writeLastDiamondJSONfile, 
         readLastDiamondJSONfile, 
         readLastFacetJSONfile, 
         writeLastFacetJSONfile } from "./libraries/files";
import { accountIndex, convertType, enumOrValue } from "./libraries/utils";
import { DeployContracts,  } from "./DeployContracts";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "./T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "./interface/types";
import { colorOutput, displayAccountTable } from "./libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "./libraries/types";
import { showBeacons } from "./logic/beacons";
import { showBalances } from "./logic/balances";
import { showTokens } from "./logic/tokens";
import { showRights } from "./logic/rights";
import { showApprovals } from "./logic/approvals";
import { showInstance, updateInstances } from "./logic/instances";
import { accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "./logic/states";

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

async function main() {

    const width = 70;
    var ABIformat = [];

    colorOutput( "*".padEnd(width, "*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(5, " "), "Welcome to the Trust2Give dApp Interaction Menu" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(7, " "), "This application allow to interact and test" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(10, " "), "Author: franck.dervillez@trust2give.fr" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( "*".padEnd(width, "*"), "cyan");
        
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

    await assignAccounts();

    // We complete the list with possible two other address: T2G_Root & EUR contracts
    // since they can be selected as Account.AA & Account.AE options

    await readLastDiamondJSONfile();    
    
    const getRoot = await hre.viem.getContractAt( 
        diamondNames.Diamond.name, 
        diamondNames.Diamond.address
        );
    
    const wallets = await hre.viem.getWalletClients();
    const root : Array<any> = await getRoot.read.wallet_T2G_root( [], wallets[0] );

    await addAccount( 10, diamondNames.Diamond.name, diamondNames.Diamond.address, root );
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AA"]}: `.concat(await account(10, false)), " T2G Root" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    
    await readLastContractSetJSONfile();
    await addAccount( 11, contractSet[0].name, contractSet[0].address, [] );
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AB"]}: `.concat(await account(11, false)), " EUR SC" ).padEnd(width - 1, " ")).concat("*"), "cyan");

    var rank = 12;
    type AccountKeys = keyof typeof Account;
    const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const facet of facetNames) {
        if (smart.findIndex((item) => item.contract == facet.name) > -1) {
            try {
                const newAddress = await readLastFacetJSONfile( facet.name, await account(10, false)); 
                
                const getAddr = await hre.viem.getContractAt( 
                    facet.name, 
                    diamondNames.Diamond.address
                    );

                const raw : Array<any> = (facet.wallet) ? await getAddr.read[<string>facet.wallet]( [], wallets[0] ) : [];
                await addAccount( rank, facet.name, newAddress, raw );
                colorOutput( ("*".concat(" ".padStart(2, " "), `${Account[<AccountKeys>`A${indice.substring(rank,rank + 1)}`]}: `.concat(await account(rank, false)), " ", facet.name ).padEnd(width - 1, " ")).concat("*"), "cyan");
                rank++;
                }
            catch (error) {
                //console.log(error);
                }
            }
        }
    //console.log(accountRefs)
    await updateInstances();    
    
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
        else if (answer == "Accounts")  {
            //const balance = await publicClient.getBalance({ address: addr,})     
            await updateAccountBalance();       
            displayAccountTable(accountRefs, width);
            }
        else if (answer == "State")  console.log(globalState);
        else if (answer == "rights") { 
            await showRights();
            }
        else if (answer == "back") setState( { inputs: "None", object: false, tag: "", level: "" }, <rwRecord>{});
        else if (answer == "beacon") {
            await showBeacons( [diamondNames.Diamond] );
            await showBeacons( facetNames );
            await showBeacons( contractSet );
            }
        else if (answer == "token") {
            await showTokens();            
            }
        else if (answer == "allowance") {
            await showApprovals();            
            }
        else if (answer == "balance") { await showBalances(); }
        else if (answer == "Help") {
            if (globalState.level == "") setState( { help: "Keywords: help, balance, beacon, back, state, accounts + [".concat( smart.map( (el) => el.tag ).join("| "), "]\n") });
            else  setState( { help: showInstance( <string>globalState.level ) });
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
                await DeployContracts( accountRefs, answer, smart );

                await addAccount( 10, diamondNames.Diamond.name, diamondNames.Diamond.address, [] );
                await addAccount( 11, contractSet[0].name, contractSet[0].address, [] );
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
                            setState( { sender: <Account>answer } );
                            await updateInstances();  
                            }

                        setState( { inputs: (globalState.item.args.length > 0) ? "Args" : "OK", object: false, index: 0, subIndex: 0, subItem: [] });
                        answer = "";
                        }
                    break;
                    }
                case "Args": {
                    try {
                        var index: number = <number>globalState.index;
                        var item: rwRecord = <rwRecord>globalState.item;
                        if (item.args[index].type == "bytes") {
                            // we are in the case when an encoded complex struct is to be passed
                            // It may require additionnal sub-inputs to get
                            if (globalState.object) {
                                var subValue = convertType( ABIformat[0].components, <number>globalState.subIndex, answer, typeRouteArgs, accountRefs, "", false);
                                
                                if (subValue != undefined) {
                                    var sub : Array<any> = globalState.subItem ? globalState.subItem : [];
                                    sub.push(subValue);
                                    setState( { subItem: sub, subIndex: <number>globalState.subIndex + 1 });
                                    }
                                }
                            if (globalState.subIndex >= ABIformat[0].components.length) {
                                const encodedData = encodeAbiParameters( ABIformat, [globalState.subItem] );
                                item.values[index++] = encodedData; 
                                setState( { object: false, subIndex: 0, subItem: [] });
                                }
                            }
                        else {
                            item.values[index] = convertType( item.args, <number>index, answer, typeRouteArgs, accountRefs, "", false);
                            if (item.values[index] != undefined) index++;
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
                await InteractWithContracts( <rwRecord>globalState.item, <Account>globalState.sender, accountRefs, [ record, smart[1] ], <number>globalState.pad );
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
                //console.log((<rwRecord>globalState.item).args)
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