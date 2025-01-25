import hre from "hardhat";
import { Address, decodeAbiParameters  } from 'viem'
import { dataDecodeABI, abiItem } from "./interface/types";
import { manageErrors } from "./interface/errors";
import { encodeInterfaces, smartEntry } from "./T2G_Data";
import { convertType, accountIndex } from "./libraries/utils";
import { colorOutput, displayAddress, showLog, displayRetunedValue, displayEvents, displayInstance, displayReadValues } from "./libraries/format";
import { rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "./libraries/types";
import { accountRefs, globalState } from "./logic/states";

/*******************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Menu with T2G & ERC20 Contracts
* Version 1.0 - Date : 15/01/2025
* 
* This is the main script for running an interactive calls to functions to T2G smart contracts
* 
* The data structure of the T2G application is borne by both T2G_Data.ts file, to be updated
* mainly when a new smart contract is to be deployed, prior to running the script
* 
/*******************************************************************************************/

/*******************************************************************************************\
* This function relies on smart global variable in T2G_Data.ts file that gathers the 
* possible contracts that can be callable: [ menuRecord ]
* 
* This function is called after setrwRecordFromSmart
* 
* Inputs:
* * rwItem : object of type rwRecord that gives information related to the function to call and input values
* * from : Enum value of type Account that identifies the wallet index in the HadHat Node simulator
* * silent (optional) : boolean to hide (true) or not the output on the CLI console
* 
* This function runs in Hadhat / view environment
* 
* It also requires the globalState variable to be implemented with:
* * pad : lenght of strings to display in StdOut
* * log : buffer that stores the inputs and output and events of interaction
* * sender : the account to apply for sending a transaction (by default)
* 
/*******************************************************************************************/

export async function InteractWithContracts(
    rwItem : rwRecord, 
    from?: Account, 
    silent?: boolean ) : Promise<any> {

    const eur : menuRecord | undefined = smartEntry("EUR");

    if (eur == undefined) throw("No EUR found in smart variable");

    var sender: number | undefined = await accountIndex(
        accountRefs, 
        (from) ? from : globalState.sender, 
        true
        );

    type refKeys = keyof typeof accountRefs;

    displayInstance( rwItem, globalState.pad)

    displayAddress( 
        <Address>(accountRefs[<refKeys><string>((from) ? from : globalState.sender)].address), 
        "magenta", 
        <number>globalState.pad 
        );

    var values : any = "<Empty>";
        
    
    try {
        if (rwItem.rwType == rwType.WRITE) {
            
            const balance = await globalState.clients.getBalance({ 
                address: <Address>accountRefs[<refKeys><string>((from) ? from : globalState.sender)].address,
              })

            const gas = await globalState.clients.estimateContractGas(
                { 
                    address: rwItem.instance.address, 
                    abi: rwItem.instance.abi, 
                    functionName: rwItem.function, 
                    args: rwItem.values 
                });

            colorOutput(`Estimated Gas :: ${gas} - Balance ${balance}`, "blue");

            values = await rwItem.instance.write[rwItem.function](
                rwItem.values, 
                globalState.wallets[sender] 
                );
            
            displayRetunedValue( values, "green", globalState.pad );

            const eventFacetLogs = await globalState.clients.getContractEvents(
                { 
                    abi: rwItem.instance.abi, 
                    address: rwItem.instance.address, 
                });

            const eventSCLogs = await globalState.clients.getContractEvents(
                { 
                    abi: eur.instance.abi, 
                    address: eur.instance.address, 
                });
            
            for ( const event of eventFacetLogs) {
                if (event.transactionHash == values) {

                    const EvtInputs = rwItem.instance.abi.filter(
                        (item) => item.type == "event" && item.name == event.eventName
                        )[0].inputs;

                    displayEvents( EvtInputs, event, "yellow", globalState.pad );                
                    }
                }

            for ( const event of eventSCLogs) {
                const EvtInputs = eur.instance.abi.filter(
                    (item) => item.type == "event" && item.name == event.eventName
                    )[0].inputs;
                
                displayEvents( EvtInputs, event, "yellow", globalState.pad );                
                }
            } 
        else if (rwItem.rwType == rwType.READ) {

            const raw : any = await rwItem.instance.read[rwItem.function]( 
                rwItem.values, 
                globalState.wallets[sender] 
                );

            var result = (rwItem.outcome.length > 1) ? raw : [ raw ];
            var decodeFlag = false;
            values = raw;

            // we check if the result returned by the function is expected to be abo.encoded or not
            // This is flagged in encodedInterface object where all concerned contract / functions are set
            if (rwItem.contract in encodeInterfaces) {
                type encKeys = keyof typeof encodeInterfaces;
                
                const decodeOutput = encodeInterfaces[<encKeys>rwItem.contract].find((item) => item.function == rwItem.function);
                const decodeFlag : boolean = (decodeOutput != undefined) ? ("output" in decodeOutput) ? (decodeOutput.output in dataDecodeABI) ? true : false : false : false;

                // We check that the related function is concerned or not by the abi.encode
                // encode is applied to structs and outcomes
                // We check that the abi definition of the struct or outcome is present.
                if (decodeFlag) {
                    // to avoid warning in typescript code
                    type decKeys = keyof typeof dataDecodeABI;
                    // We get the abi format of the outcome or struct
                    const ABIformat : abiItem[] | { name: string, type: string }[] =  dataDecodeABI[<decKeys>decodeOutput.output];
                    // values is a an array of the outcomes
                    values = decodeAbiParameters( ABIformat, result[0] );
                    
                    displayReadValues( ABIformat, values, decodeFlag, "green", globalState.pad );
                    }
                else displayReadValues( rwItem, result, decodeFlag, "green", globalState.pad );
                }
            else displayReadValues( rwItem, result, decodeFlag, "green", globalState.pad );        

            }
            // We display the log
            showLog(silent);
            
            return values;
        } catch (error) { 
            if (!silent) manageErrors(error, globalState.pad) 
            return undefined;
            }    
        
    }
