const hre = require("hardhat");
import { Address } from "viem";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, smartEntry } from "../T2G_Data";
import { dataDecodeABI, abiData, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountIndex } from "../libraries/utils";
import { accountRefs, globalState, clientFormat } from "../logic/states";

/// setrwRecordFromSmart represents the first function to call up when setting up an interaction
/// with a smart contract, to retreive the instance of the smart contract and and the abi
/// related to the target function to call
/// Step 1 : call this function and get a rwRecord object
/// Step 2 : populate the {rwRecord}.values attribute with input values related to abi types
/// Step 3 : call the InteractWithContract function to carry out the call

export const setrwRecordFromSmart = async (fname : string, level?: string ) : Promise<rwRecord> => {

    const record = <menuRecord>smartEntry(level);
    if (record == undefined) return <rwRecord>{};
  
    const instance = await getInstanceFromSmartRecord( record );
    const fct = instance.abi.filter((item: any) => (item.type == "function" && item.name == fname))[0];

    return <rwRecord>{ 
        rwType: (fct.stateMutability == "view" || fct.stateMutability == "pure") ? rwType.READ : rwType.WRITE,
        contract: record.contract,
        instance: instance,
        function: fct.name, 
        args: fct.inputs,
        values: [],
        outcome: fct.outputs,
        events: await globalState.clients.getContractEvents(
            { 
                abi: instance.abi, 
                address: instance.address, 
            }) 
        };
    }

export const setConstructorFromInstance = async (facet: string, root: Address, sender: number ) : Promise<rwRecord> => {

    const record = <menuRecord>smartEntry(facet);
    if (record == undefined) return <rwRecord>{};
    
    const instance =  await hre.viem.getContractAt( 
        record.contract, 
        root, 
        { client: { wallet: (<clientFormat[]>globalState.wallets)[<number>sender] } } 
        );

    const constructor = (instance.abi.filter((item: abiData) => item.type == "constructor"))

    return <rwRecord>{ 
        rwType: rwType.CONSTRUCTOR,
        contract: record.contract,
        instance: instance,
        function: "Constructor", 
        args: constructor.inputs,
        values: [],
        outcome: constructor.outputs,
        events: undefined 
        };
    }

export async function getFunctionsAbiFromInstance( record: menuRecord ) : Promise<string[]> {
    if (record != undefined) {
        const instance = await getInstanceFromSmartRecord( record );                
        return instance.abi.filter( (item: abiData) => (item.type == "function")).map((item: abiData) => item.name);                
        }
    return [];
    }
/*
export const showInstance = async ( level : string ) : Promise<Array<any>> => {

    const record = <menuRecord>smartEntry(level);
    if (record == undefined) return ["Undefined Contract"];
  
    const instance = await getInstanceFromSmartRecord( record );
    if (instance == undefined) return ["No instance implemented"]; 
    
    return instance.abi.map( 
        (item : { inputs: abiData[], name: string, outputs?: abiData[], stateMutability?: string, type: string, anonymous?: boolean }) => {
            const stateMutability = () => {
                if ("stateMutability" in item) {
                    if (item.stateMutability === "view") return colorOutput( "R", "yellow", true )
                    else if (item.stateMutability === "payable") return colorOutput( "$", "green", true )
                    else if (item.stateMutability === "nonpayable") return colorOutput( "W", "blue", true )
                    else if (item.stateMutability === "pure") return colorOutput( "P", "cyan", true )
                    else return colorOutput( "?", "red", true );
                    }
                else return colorOutput( " ", "blue", true );
                }

            const itemType = () => {
                if (item.type === "function") return colorOutput( "Fn", "yellow", true )
                else if (item.type === "constructor") return colorOutput( "Cr", "green", true )
                else if (item.type === "error") return colorOutput( "Er", "red", true )
                else if (item.type === "event") return colorOutput( "Ev", "cyan", true )
                else return colorOutput( "??", "red", true )
                }

                colorOutput( 
                    "> ".concat( 
                        itemType(), 
                        stateMutability(), 
                        item.name,                     
                        colorOutput( 
                            "[".concat( 
                                item.inputs.map( ( el: abiData ) => el.name).join("| "), 
                                "]" ), 
                            "green", 
                            true
                            ), 
                        " => ",
                        ("outputs" in item) ? colorOutput( "[".concat( item.outputs.map( ( el: abiData ) => {
                    return ((el.name != "") ? el.name : "").concat( "(", <string>(("internalType" in el) ? el.internalType : el.type), ")") 
                    }).join("| "), "]"), "cyan", true) : "_",
                ), "yellow");
            });
    }
*/

async function getInstanceFromSmartRecord( record: menuRecord ) : Promise<any> {

    const accounts = Object.values(accountRefs);

    var root = (record.diamond == Account.AA) ? accounts[10].address : (record.diamond == Account.AB) ? accounts[11].address : undefined;

    var index = await accountIndex(
        accountRefs, 
        <Account>globalState.sender, 
        true
        );

    if (index == undefined) index = 0;

    return await hre.viem.getContractAt( 
        record.contract, 
        (root != undefined) ? root : accounts[10].address, 
        { client: { wallet: (<clientFormat[]>globalState.wallets)[<number>index] } } 
        );                    
    }