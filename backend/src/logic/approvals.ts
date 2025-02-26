import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { accountType, accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts } from "./states";
import { getGWEI, getABI, getStableABI, writeStableContract, encodeInputsAndSend, writeFacetContract } from "../logic/instances";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex, regex2, regex3 } from "../libraries/types";

/***************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* approvals.ts
*
* Library of Typescript functions to interact with smart contract instances
* deployed on the blockchain : EUR Stablecoin mockup
* 
* Mains functions:
* - approveCallback: Array of callback functions called through the web service interactions
*   - approve | get : Get the approval state fot the given account <from>
*   - approve | update : Update approval for all of the accounts to transfer on behalf of
*   - approve | set :  Approve to <account> to manage transfer on behalf of from <Account>"
* 
* Version
* 1.0.1 : Creation of the file
/**************************************************************************************/

type approval = { 
    owner: accountType, 
    spender: { 
        wallet: accountType, 
        value: bigint,
        tx?: typeof regex2
        }[] 
    }

/************************************************************************************** 
 * Array approveCallback[]
 * 
 * Array of objects { call, tag, help, callback } that contains the callback functions
 * that are performed when <call | tag> is passed through the web service interface
 * 
 * Inputs : arguments depends on the callback functions:
 *   - approve | get : [ { from <Account> }]
 *   - approve | update : no arguments
 *   - approve | set : 
 * 
 * Returned values : depends on the callback functions : TO BE UPDATED
 *   - approve | get : returns the list of { name <string>, type <string>, state <string>, inputs { <string> } }
 *   - approve | update : returns the list of { tag <Account>, name <string>, address <Address>, wallet <Address> }
 *   - approve | set : returns the list of smartContract [ names <string> ]
 *
***************************************************************************************/

export const approveCallback : callbackType[] = [
    { 
    call: "approve",
    tag: "get",
    help: "approve | get [ { from: <Account> }] -> Get the approval state fot the given account <from>",
    callback: async ( inputs: Array<{ from?: Account | accountType | accountType[] }> ) => {

        if (inputs.length == 0) return [];

        const stableABI : any = getStableABI();
        
        var list : approval[] = [];

        for ( const input of inputs) {

            var Owners : accountType[] = (Array.isArray(input.from) ? <accountType[]>input.from : [ <accountType>input.from ]).map((item: accountType) => {
        
                item.address = ((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) ? NULL_ADDRESS : item.address;
                item.wallet = ((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) ? item.wallet : NULL_ADDRESS;
        
                return item;
                });
        
            for ( var owner of Owners ) {
        
                var senderList : { wallet: accountType, value: bigint }[] = []; 
                
                for ( var spender of Owners ) {
                    
                    senderList.push( { 
                        wallet: spender,
        
                        value: await globalState.clients.readContract({
                            address: contractSet[0].address,
                            abi: stableABI.abi,
                            functionName: "allowance",
                            args: [ (owner.wallet != NULL_ADDRESS) ? owner.wallet : owner.address, 
                                (spender.wallet != NULL_ADDRESS) ? spender.wallet : spender.address ]
                                })
                            })   
        
                        list.push( { 
                            owner: owner, 
                            spender: senderList
                        });                    
                    }
                }
            }
        return list;
        }        
    },
    { 
    call: "approve",
    tag: "update", 
    help: "approve | update [ ] -> Update approval for all of the accounts to transfer on behalf of",
    callback: async () : Promise<approval[]> => {
                
        const accounts = [ Account.A0, Account.AA, Account.AE, Account.AF, Account.AG ];

        var approveList : approval[] = [];
    
        for (const from of accounts ) {

            const fromAccount = (<accountType>accountRefs[from]);
            const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;

            var approve : approval = {
                owner: { 
                    name: fromAccount.name,
                    address: fromAccount.address,
                    wallet: fromAccount.wallet 
                    },
                spender: []
                }

            for (const to of accounts ) {

                const toAccount = (<accountType>accountRefs[to]);                
                const toAddress = ((toAccount.wallet != undefined) && (toAccount.wallet != NULL_ADDRESS)) ? toAccount.wallet : toAccount.address;

                approve.spender.push(
                    {
                    wallet: {
                        name: toAccount.name,
                        address: toAccount.address,
                        wallet: toAccount.wallet   
                        },
                    value : BigInt(10**32),
                    tx : await writeStableContract( 
                        "approve", 
                        [ 
                        toAddress,
                        BigInt(10**32) 
                        ], 
                        fromAddress
                        )
                        }
                    );                        
                }

            approveList.push(
                approve
                );        
            }
        return approveList;
        }
    },
    { 
    call: "approve",
    tag: "set",
    help: "approve | set [ { from: <Account>, to: <Accoun> }] -> Approve to <account> to manage transfer on behalf of from <Account>",
    callback: async (  inputs: Array< { from: Account, to: Account }> ) => {

        const stableABI : any = getStableABI();

        var approveList : Object[] = [];

        for (const input of inputs ) {

            var tx : typeof regex2 | undefined = NULL_HASH;

            if (Object.keys(accountRefs).includes(<Account>input.from) 
                && Object.keys(accountRefs).includes(<Account>input.to)) {
    
                const fromAccount = (<accountType>accountRefs[<Account>input.from]);
                const toAccount = (<accountType>accountRefs[<Account>input.to]);
                
                const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;
                const toAddress = ((toAccount.wallet != undefined) && (toAccount.wallet != NULL_ADDRESS)) ? toAccount.wallet : toAccount.address;
    
                const [account] = await globalState.wallets.getAddresses()
                                    
                const balance = Number(
                    await globalState.clients.readContract({
                        address: contractSet[0].address,
                        abi: stableABI.abi.file.abi,
                        functionName: "balanceOf",
                        args: [ fromAddress ],
                        account
                        })
                    );            
            
                tx = await writeStableContract( 
                    "approve", 
                    [ 
                    toAddress,
                    balance 
                    ], 
                    fromAddress
                    );

                approveList.push(
                    Object.assign( { 
                        tx: tx
                        }, 
                        input
                        )
                    );        
                }
            }

        return approveList;
        }    
    }        
    ];