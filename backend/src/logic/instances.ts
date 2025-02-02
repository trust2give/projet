const hre = require("hardhat");
import { Address } from "viem";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, smartEntry } from "../T2G_Data";
import { dataDecodeABI, abiData, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountIndex } from "../libraries/utils";
import { accountRefs, globalState, clientFormat } from "../logic/states";

export const showInstance = async ( contract : contractRecord ) : Promise<Array<any>> => {
   
    return contract.abi.file.abi.map( 
        (item : { input: Array<abiData>, name: string, type: string, stateMutability?: string, outputs?: string, anonymous?: boolean  }) => {

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