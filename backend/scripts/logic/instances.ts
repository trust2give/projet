const hre = require("hardhat");
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountIndex, convertType, enumOrValue } from "../libraries/utils";
import { accountRefs, globalState } from "../logic/states";

/// Function that fetch the new instances of each smart contract
/// given the sender wallet
export async function updateInstances() {
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const level : string | undefined = globalState.level;

    for( const item of smart ) {
        if (level == undefined || level == "" || level == item.tag) {
            if ((item.contract != undefined) || (item.diamond != undefined)) {
                    const accounts = Object.values(accountRefs);

                    var root = (item.diamond == Account.AA) ? accounts[10].address : (item.diamond == Account.AB) ? accounts[11].address : undefined;
                    var index = await accountIndex(accountRefs, <Account>globalState.sender, true);
                    if (index == undefined) index = 0;
                    item.instance = await hre.viem.getContractAt( 
                        item.contract, 
                        (root != undefined) ? root : accounts[10].address, 
                        { client: { wallet: wallets[<number>index] } } 
                        );
                    
                    item.events = await publicClient.getContractEvents({ abi: item.instance.abi, address: (root != undefined) ? root : accounts[10].address, })
                    }
            }
        }
    }

export const showInstance = ( level : string ) : Array<any> => {

    const record = <menuRecord>smart.find((el: menuRecord ) => el.tag == level);
    
    if (record == undefined) return ["Undefined Contract"];
    if (record.instance == undefined) return ["No instance implemented"]; 
    
    return record.instance.abi.map( 
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
                colorOutput( "> ".concat( itemType(), stateMutability(), item.name,                     
                colorOutput( "[".concat( item.inputs.map( ( el: abiData ) => el.name).join("| "), "]"), "green", true), " => ",
                ("outputs" in item) ? colorOutput( "[".concat( item.outputs.map( ( el: abiData ) => {
                    return ((el.name != "") ? el.name : "").concat( "(", <string>(("internalType" in el) ? el.internalType : el.type), ")") 
                    }).join("| "), "]"), "cyan", true) : "_",
                ), "yellow");
            });
    }
