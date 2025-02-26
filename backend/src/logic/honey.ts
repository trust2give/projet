import { BaseError, Address, ContractFunctionRevertedError, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { getGWEI, getABI, writeStableContract, encodeInputsAndSend, writeFacetContract } from "../logic/instances";
import { Statusoftoken, dataDecodeABI, setIndex, honeyFeatures, pollenFeatures, TypeofUnit } from "../interface/types";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState } from "./states";
import { colorOutput, parseReadValues } from "../libraries/format";

/***************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* honey.ts
*
* Library of Typescript functions to interact with smart contract instances
* deployed on the blockchain : T2G_HoneyFacet
* 
* Mains functions:
* - honeyCallback: Array of callback functions called through the web service interactions
*   - honey | mint : 
*   - honey | approve : 
*   - honey | transfer : 
* 
* Version
* 1.0.1 : Creation of the file
/**************************************************************************************/

/************************************************************************************** 
 * Array honeyCallback[]
 * 
 * Array of objects { call, tag, help, callback } that contains the callback functions
 * that are performed when <call | tag> is passed through the web service interface
 * 
 * Inputs : arguments depends on the callback functions:
 *   - honey | mint : [{ from <Account>, fund <hash>, enity <hash> }]
 *   - honey | approve : [{ from <Account>, fund <hash> }]
 *   - honey | transfer : [{ from <Account>, fund <hash> }]
 * 
 * Returned values : depends on the callback functions :
 *   - honey | mint : 
 *   - honey | approve :  
 *   - honey | transfer :  
 *
***************************************************************************************/

export const honeyCallback : callbackType[] = [
    { 
    call: "honey",
    tag: "mint", 
    help: "honey | mint [ { fund: <regex2>, entity: <regex2> }] -> Mint a new honey with entity Id <entity> & fund Id <fund>",
    callback: async ( inputs: Array<{ from: Account, fund: string, entity: string }> ) => {

        if (inputs.length == 0) return undefined;

        var mintList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        for ( const input of inputs) {
            var tx : typeof regex2 = NULL_HASH;

            if (Object.keys(accountRefs).includes(input.from)) {
                const fromAccount = (<accountType>accountRefs[input.from]);        

                tx = <typeof regex2>await writeFacetContract( 
                    "T2G_HoneyFacet", 
                    "mintHoney", 
                    [ 
                    fromAccount.address,
                    input.entity,
                    input.fund
                    ], 
                    account 
                    )
                }
            
            mintList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );
            }
        
        return mintList;
        }
    },
    { 
    call: "honey",
    tag: "approve", 
    help: "honey | approve [ { hash: <regex2> }] -> Get the details of the entity with Id <hash>",
    callback: async ( inputs: Array<{ from: Account, fund: string }> ) => {

        if (inputs.length == 0) return undefined;

        var approveList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        for ( const input of inputs) {
            var tx : typeof regex2 = NULL_HASH;

            if (Object.keys(accountRefs).includes(input.from)) {
                const fromAccount = (<accountType>accountRefs[input.from]);        

                tx = <typeof regex2>await writeFacetContract( 
                    "T2G_HoneyFacet", 
                    "mintHoney", 
                    [ 
                    input.fund,
                    fromAccount.address
                    ], 
                    account 
                    )
                }

            approveList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );
            }
        
        return approveList;
        }
    },
    { 
    call: "honey",
    tag: "transfer", 
    help: "honey | transfer [ { from: <Account>, fund: <regex2> }] -> Transfer the fund id ",
    callback: async ( inputs: Array<{ from: Account, fund: string }> ) => {

        if (inputs.length == 0) return undefined;

        var transferList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        for ( const input of inputs) {
            var tx : typeof regex2 = NULL_HASH;

            if (Object.keys(accountRefs).includes(input.from)) {
                const fromAccount = (<accountType>accountRefs[input.from]);        

                tx = <typeof regex2>await writeFacetContract( 
                    "T2G_HoneyFacet", 
                    "mintHoney", 
                    [ 
                    input.fund,
                    fromAccount.address
                    ], 
                    account 
                    )
                }

            transferList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );
            }
        
        return transferList;
        }
    }
]