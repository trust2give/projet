const hre = require("hardhat");
import { Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
import * as readline from 'readline';
import { InteractWithContracts } from "./InteractWithContracts";
import { readLastContractSetJSONfile, 
         readLastDiamondJSONfile } from "./libraries/files";
import { accountIndex, convertType, enumOrValue } from "./libraries/utils";
import { DeployContracts,  } from "./DeployContracts";
import { contractSet, diamondNames, facetNames, smart, smartEntry, encodeInterfaces } from "./T2G_Data";
import { commandItem, dataDecodeABI, abiData, typeRouteOutput, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "./interface/types";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "./libraries/types";
import { showBeacons } from "./logic/beacons";
import { showBalances } from "./logic/balances";
import { showTokens } from "./logic/tokens";
import { help } from "./logic/help";
import { rightCallback } from "./logic/rights";
import { approveCallback } from "./logic/approvals";
import { fundCallback, honeyCallback } from "./logic/honey";
import { createEntity, getAllEntities } from "./logic/entity";
import { showInstance, setrwRecordFromSmart, getFunctionsAbiFromInstance } from "./logic/instances";
import { initState, prompts, accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts, deployState, functionState } from "./logic/states";

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
* When in Deploy mode, three JSON files are updated : ContractSet.Json & T2G_root.Json
* These two files are to be kept as is and not altered by the user otherwise the reference
* and addresses of T2G_Root & StableCOint contracts will be lost. Theses files are used
* to get the addresses back when interacting with facets.
* 
/*******************************************************************************************/

async function main() {

    const width = 70;
    var ABIformat = [];
    
    // We complete the list with possible two other address: T2G_Root & EUR contracts
    // since they can be selected as Account.AA & Account.AE options
    
    var initialized : Boolean = false;

    type accKeys = keyof typeof accountRefs;

    if (await readLastDiamondJSONfile()) {

        try {            
            const getRoot = await hre.viem.getContractAt( 
                diamondNames.Diamond.name, 
                diamondNames.Diamond.address
                );

            initialized = await addAccount( 
                10, 
                diamondNames.Diamond.name, 
                diamondNames.Diamond.address, 
                await getRoot.read.wallet_T2G_root( 
                    [], 
                    accountRefs[<accKeys>`@0`].client 
                    ) //root 
                );        
            }
        catch (error) {
            console.error(">> Error :: No T2G_Root initialized @ %s", diamondNames.Diamond.address, error.shortMessage)
            }
    
        if (await readLastContractSetJSONfile()) {

            try {

                await addAccount( 
                    11, 
                    contractSet[0].name, 
                    contractSet[0].address, 
                    [] 
                    );

                }
            catch (error) {
                console.error(">> Error :: No StableCoin Contract initialized @ %s ", contractSet[0].address, error.shortMessage)
                }
            }
        
        if (initialized) {
            var rank = 12;
            type AccountKeys = keyof typeof Account;
            const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            for (const facet of facetNames) {
                if (smart.findIndex((item) => item.contract == facet.name) > -1) {
    
                    const getAddr = await hre.viem.getContractAt( 
                        facet.name, 
                        diamondNames.Diamond.address
                        );
    
                    try {    
    
                        const get : Address = (facet.get) ? await getAddr.read[<string>facet.get]( 
                            [], 
                            accountRefs[<accKeys>`@0`].client 
                            ) : NULL_ADDRESS;                
                                                
                        await addAccount( 
                            rank, 
                            facet.name, 
                            get, 
                            (facet.wallet) ? await getAddr.read[<string>facet.wallet]( 
                                [], 
                                accountRefs[<accKeys>`@0`].client 
                                ) : [] 
                            );
        
                        rank++;
                        }
                    catch (error) {
                        console.error(">> Error :: No Facet Contract initialized %s, @ %s", facet.name, diamondNames.Diamond.address)
                       }
                    }
                }
            } 
        }

    if (!initialized) {
        console.error("No T2G_Root contract initialised");        
        deployState();
        }

    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        });
    
        const trace : boolean = false                
        var Choices : string[] = [];
        
        rl.setPrompt(<string>globalState.promptText);
        rl.prompt();
        
        rl.on('line', async (line) => {
        var answer : string = line.trim();
        const keys = answer.split(" ");

        if (answer == "back") initState();
        else if (answer.startsWith("Help")) { 
            setState( { help: help.keywords() });

            type helpKeys = keyof typeof help;

            if (keys[1] in help)
                setState( { help: help[<helpKeys>keys[1]] });
            else {
                if (smart.some((el: menuRecord) => el.tag == keys[1]))
                    setState( { 
                        help: <string[]>await showInstance( <string>keys[1] ) 
                        });
                }

            }
        else if ((globalState.inputs == "None") && (answer == "Deploy")) deployState();
        else if ((globalState.inputs == "None") && (smart.some((el: menuRecord) => el.tag == answer))) {            
            functionState( answer );
            Choices = <string[]>await getFunctionsAbiFromInstance(
                <menuRecord>smartEntry(globalState.level)
                );
            }
        else if ((globalState.inputs == "Function") && (Choices.some((el : string) => el == answer))) {
            setState( { 
                inputs: "Args", 
                object: false, 
                tag: answer, 
                index: 0, 
                subIndex: 0 }, 
                await setrwRecordFromSmart(answer, globalState.level)
                );

            }
        else if (answer.startsWith("Sender"))  {
            if (Object.keys(accountRefs).includes(keys[1])) {
                    setState( { 
                        sender: <Account>keys[1] 
                        });
                    console.log("Sender set to ", globalState.sender)
                    }
            }
        else if (answer == "Accounts")  {
            //await updateAccountBalance(); 

            displayAccountTable(width);
            }
        else if (answer.startsWith("rights ")) { 
            const found = rightCallback.find((item) => item.tag == keys[1]);
            if (found != undefined) {
                await found.callback(
                    <Account>keys[2], 
                    Number(keys[3])
                    );
                }
            }
        else if (answer == "beacon") { 
            await showBeacons( [diamondNames.Diamond, ...facetNames, ...contractSet] ); 
            }
        else if (answer == "token") { 
            await showTokens(); 
            }
        else if (answer.startsWith("fund")) { 
            const found = fundCallback.find((item) => item.tag == keys[1]);
            if (found != undefined) {
                await found.callback(
                    false,
                    <Account>keys[2], 
                    Number(keys[3]), 
                    Number(keys[4])
                    );
                }
            }
        else if (answer.startsWith("mint")) { 
            const found = honeyCallback.find((item) => item.tag == keys[1]);
            if (found != undefined) {
                await found.callback(
                    <Account>keys[2], 
                    (<string[]>await fundCallback.find((item) => item.tag == "all")?.callback( true ))[Number(keys[3])], 
                    (<string[]>await getAllEntities( true ))[Number(keys[4])]
                    );
                }
            }
        else if (answer.startsWith("identity")) { 
            switch (keys[1]) {
                case "set": {
                    switch (keys[2]) {
                        case "person": {
                            await createEntity( true, { 
                                name: keys[3],
                                email: keys[4],
                                postal: keys[5],
                                country: keys[6]
                                } );
                            break;
                            }
                        case "entity": {
                            await createEntity( false, { 
                                name: keys[3],
                                uid: keys[4],
                                email: keys[5],
                                postal: keys[6],
                                entity: keys[7],
                                sector: keys[8],
                                unitType: keys[9],
                                unitSize: keys[10],
                                country: keys[11]
                                } );
                            break;
                            }
                        default:
                        }
                    break;
                    }
                case "all": {
                    await getAllEntities();
                    break;
                    }
                default:
                }
            }
        else if (answer.startsWith("allowance ")) { 
            const found = approveCallback.find((item) => item.tag == keys[1]);
            if (found != undefined) {
                await found.callback(                    
                    <Account>keys[2], 
                    <Account>keys[3]
                    );
                }
            }
        else if (answer == "balance") { 
            await showBalances(); 
            }
        
        // In the case when Deploy is selected
        if (globalState.deploy) {
            await DeployContracts( 
                answer, 
                smart 
                );

            await addAccount( 
                10, 
                diamondNames.Diamond.name, 
                diamondNames.Diamond.address, 
                [] 
                );

            await addAccount( 
                11, 
                contractSet[0].name, 
                contractSet[0].address, 
                [] 
                );
            }
        else {
            switch (globalState.inputs) {
                case "Args": {
                    try {
                        var index: number = <number>globalState.index;
                        var item: rwRecord = <rwRecord>globalState.item;
                        if (item.args.length > 0) {                        
                            if (item.args[index].type == "bytes") {
                                // we are in the case when an encoded complex struct is to be passed
                                // It may require additionnal sub-inputs to get
                                if (globalState.object) {

                                    var subValue = convertType( 
                                        ABIformat[0].components, 
                                        <number>globalState.subIndex, 
                                        answer, 
                                        typeRouteOutput, 
                                        "", 
                                        false
                                        );
                                    
                                    if (subValue != undefined) {
                                        var sub : Array<any> = globalState.subItem ? globalState.subItem : [];

                                        sub.push(subValue);

                                        setState( 
                                            { 
                                                subItem: sub, 
                                                subIndex: <number>globalState.subIndex + 1 
                                            });
                                        }
                                    }
                                if (globalState.subIndex >= ABIformat[0].components.length) {
                                    
                                    const encodedData = encodeAbiParameters( 
                                        ABIformat, 
                                        [globalState.subItem]
                                        );
                                    
                                    item.values[index++] = encodedData; 

                                    setState( { 
                                        object: false, 
                                        subIndex: 0, 
                                        subItem: [] 
                                        });
                                    }
                                }
                            else {
                                item.values[index] = convertType( 
                                    item.args, 
                                    <number>index, 
                                    answer, 
                                    typeRouteOutput, 
                                    "", 
                                    false
                                    );

                                if (item.values[index] != undefined) index++;
                                }
                            }

                        setState( 
                            { 
                                inputs: (index < globalState.item.args.length) ? "Args" : "OK", 
                                index: index, 
                                item: item 
                            });
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

                await InteractWithContracts( 
                    <rwRecord>globalState.item
                    );

                setState( 
                    { 
                        inputs: "Function", 
                        tag: "" 
                    }, 
                    <rwRecord>{}
                    );
                }
            }

        // We update the prompt text with the new status, waiting for new command
        switch (globalState.inputs) {
        case "None": {
            setState({ 
                promptText: (globalState.deploy) ? prompts.Deploy : prompts.None 
                });
            break;
            }
        case "Sender":
        case "Function": {
            setState({ 
                promptText: prompts[globalState.inputs], 
                });
            break;
            }
        case "Args": {
            
            const index = <number>globalState.index;
            const subIndex = <number>globalState.subIndex;

            if (index < (<rwRecord>globalState.item).args.length) {
                var argPointer = (<rwRecord>globalState.item).args[index];
                
                if (argPointer.type == "bytes" && argPointer.name == "_data") {

                    if (subIndex == 0) {
                    
                        if ((<rwRecord>globalState.item).contract in encodeInterfaces) {

                            type encKeys = keyof typeof encodeInterfaces;
                            
                            const encodeInput = encodeInterfaces[<encKeys>(<rwRecord>globalState.item).contract].find((item) => item.function == (<rwRecord>globalState.item).function);

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

                    setState({ 
                        promptText: prompts.subArgs( 
                            index, 
                            subIndex, 
                            argPointer.name, 
                            ABIformat[0].name, 
                            ABIformat[0].components[subIndex].name
                            )
                        });
                    } 
                else setState({ 
                    promptText: prompts.Args( 
                        index, 
                        argPointer.name, 
                        argPointer.type, 
                        )
                    });
               }
            break;                
            }
        default:
        }

        rl.setPrompt(prompts.display());
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