import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { accountType, accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts } from "./states";
import { getGWEI, getABI, getStableABI, writeStableContract, encodeInputsAndSend, writeFacetContract } from "../logic/instances";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex, regex2, regex3 } from "../libraries/types";
import { Address } from "viem";

/***************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* approvals.ts
*
* Library of Typescript functions to interact with smart contract instances
* deployed on the blockchain : EUR Stablecoin mockup
* 
* Mains functions:
* - approveCallback: Array of callback functions called through the web service interactions
*   - stable | info : Get main features of the stable coin mock up contract
*   - stable | balance : get the balance of a specific wallet
*   - stable | allowance :  get all the allowances granted for a given account
*   - stable | update :  update all the approvals between T2G wallets
*   - stable | transfer :  transfer a stable coin amount to a wallet
*   - stable | transferFrom :  transfer a stable coin amount from a wallet to another, by an approved third party wallet
*   - stable | approve :  Approve to <account> to manage transfer on behalf of from <Account>"
* 
* Version
* 1.0.1 : Creation of the file
/**************************************************************************************/

type approval = { 
    owner: Address, 
    spender: { 
        wallet: Address, 
        value: bigint | string,
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
 *   - stable | info : no arguments
 *   - stable | balance : [ { from <Account> }]
 *   - stable | allowance : [ { from <Account>, to <Account> }]
 *   - stable | update :  no arguments
 *   - stable | transfer :  [ { from <Account>, to <Account>, value <BigInt> }]
 *   - stable | transferFrom :  [ { from <Account>, to <Account>, actor <Account>, value <BigInt> }]
 *   - stable | approve :  [ { from <Account>, to <Account> }]
 * 
 * Returned values : depends on the callback functions : TO BE UPDATED
 *   - stable | get : returns the list of { name <string>, type <string>, state <string>, inputs { <string> } }
 *   - stable | update : returns the list of { tag <Account>, name <string>, address <Address>, wallet <Address> }
 *   - stable | set : returns the list of smartContract [ names <string> ]
 *
***************************************************************************************/

export const approveCallback : callbackType[] = [
    { 
    call: "stable",
    tag: "info",
    help: "stable | info [] -> Get the name, symbol, decimal and total supply of Stablecoin contract",
    callback: async ( inputs?: any ) => {

        const stableABI : any = getStableABI();

        const supply = BigInt(await globalState.clients.readContract({
            address: contractSet[0].address,
            abi: stableABI.abi,
            functionName: "totalSupply",
            args: []
            }));

        return { 
            name: await globalState.clients.readContract({
                address: contractSet[0].address,
                abi: stableABI.abi,
                functionName: "name",
                args: []
                }),
            symbol: await globalState.clients.readContract({
                address: contractSet[0].address,
                abi: stableABI.abi,
                functionName: "symbol",
                args: []
                }),
            decimals: await getGWEI(),
            supply: supply.toString()
            }
        }        
    },
    { 
    call: "stable",
    tag: "balance",
    help: "stable | balance [ { from: <Account> }] -> Get the balance for the given account <from>",
    callback: async ( inputs: Array<{ from: Account }> ) => {

        if (inputs.length == 0) return [];

        const stableABI : any = getStableABI();
        
        var list : Object[] = [];

        for ( const input of inputs) {
      
            var account : { 
                wallet: Address, 
                value: string 
                }[] = []; 
            
            const balance1 = BigInt(await globalState.clients.readContract({
                address: contractSet[0].address,
                abi: stableABI.abi,
                functionName: "balanceOf",
                args: [ accountRefs[input.from].address ]
                }))

            account.push( { 
                wallet: accountRefs[input.from].address,
                value: balance1.toString()
                })   
            
            if (accountRefs[input.from].wallet != undefined && accountRefs[input.from].wallet != NULL_ADDRESS) {
                console.log(input.from, accountRefs[input.from].wallet)

                const balance2 = BigInt(await globalState.clients.readContract({
                    address: contractSet[0].address,
                    abi: stableABI.abi,
                    functionName: "balanceOf",
                    args: [ accountRefs[input.from].wallet ]
                    }))
    
                account.push( { 
                    wallet: <Address>accountRefs[input.from].wallet,
                    value: balance2.toString()
                    })   
                }
            
            list.push( { 
                account: input.from, 
                balance: account
                });                    
            }
        return list;
        }        
    },
    { 
    call: "stable",
    tag: "allowance",
    help: "stable | allowance [ { owner: <Account> }] -> Get the approval state for the given account <from>",
    callback: async ( inputs: Array<{ owner: Account }> ) => {

        if (inputs.length == 0) return [];

        const stableABI : any = getStableABI();
        
        var list : approval[] = [];

        for ( const input of inputs) {

            var spenders : Address[] = Object.entries(accountRefs).map((item: Array<any>) => {
                if (item[0] != input.owner) {
                    return ((item[1].wallet != undefined) && (item[1].wallet != NULL_ADDRESS)) ? item[1].wallet : item[1].address;
                    }
                return NULL_ADDRESS;
                });
                
            var senderList : { wallet: Address, value: bigint }[] = []; 

            const fromAccount = (<accountType>accountRefs[input.owner]);
            const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;
            
            for ( var spender of spenders ) {
                
                const balance1 = BigInt(await globalState.clients.readContract({
                    address: contractSet[0].address,
                    abi: stableABI.abi,
                    functionName: "allowance",
                    args: [ 
                        fromAddress, 
                        spender 
                        ]
                        }))
    
                senderList.push( { 
                    wallet: spender,
                    value: balance1.toString()
                    })   
    
                    list.push( { 
                        owner: fromAddress, 
                        spender: senderList
                    });                    
                }
            }
        return list;
        }        
    },
    { 
    call: "stable",
    tag: "update", 
    help: "stable | update [ ] -> Update approval for all of the accounts to transfer on behalf of",
    callback: async () : Promise<approval[]> => {
                
        const accounts = [ Account.A0, Account.AA, Account.AE, Account.AF, Account.AG ];

        var approveList : approval[] = [];
    
        for (const from of accounts ) {

            const fromAccount = (<accountType>accountRefs[from]);
            const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;

            var approve : approval = {
                owner: fromAddress,
                spender: []
                }

            for (const to of accounts ) {

                const toAccount = (<accountType>accountRefs[to]);                
                const toAddress = ((toAccount.wallet != undefined) && (toAccount.wallet != NULL_ADDRESS)) ? toAccount.wallet : toAccount.address;

                approve.spender.push(
                    {
                    wallet: toAddress,
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
    call: "stable",
    tag: "transfer",
    help: "stable | transfer [ { to: <Accoun>, value <bigint> }] -> Transfer <value> to <account> from <Wallet 0>",
    callback: async (  inputs: Array< { from: Account, to: Account, value: string }> ) => {

        var transferList : Object[] = [];

        for (const input of inputs ) {

            var tx : typeof regex2 | undefined = NULL_HASH;

            if (Object.keys(accountRefs).includes(<Account>input.from)
                && Object.keys(accountRefs).includes(<Account>input.to)) {

                const fromAccount = (<accountType>accountRefs[<Account>input.from]);                
                const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;
    
                const toAccount = (<accountType>accountRefs[<Account>input.to]);                
                const toAddress = ((toAccount.wallet != undefined) && (toAccount.wallet != NULL_ADDRESS)) ? toAccount.wallet : toAccount.address;
    
                tx = await writeStableContract( 
                    "transfer", 
                    [ 
                    toAddress,
                    input.value 
                    ], 
                    fromAddress
                    );

                transferList.push(
                    Object.assign( { 
                        tx: tx
                        }, 
                        input
                        )
                    );        
                }
            }

        return transferList;
        }    
    },
    { 
    call: "stable",
    tag: "transferFrom",
    help: "stable | transferFrom [ { from <Account>, to: <Accoun>, actor: <Account>, value <bigint> }] -> Transfer <value> to <account> from <Wallet 0>",
    callback: async (  inputs: Array< { from: Account, to: Account, actor: Account, value: string }> ) => {

        var transferList : Object[] = [];

        for (const input of inputs ) {

            var tx : typeof regex2 | undefined = NULL_HASH;

            if (Object.keys(accountRefs).includes(<Account>input.from)
                && Object.keys(accountRefs).includes(<Account>input.to)
                && Object.keys(accountRefs).includes(<Account>input.actor)) {

                const fromAccount = (<accountType>accountRefs[<Account>input.from]);                
                const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;

                const toAccount = (<accountType>accountRefs[<Account>input.to]);                
                const toAddress = ((toAccount.wallet != undefined) && (toAccount.wallet != NULL_ADDRESS)) ? toAccount.wallet : toAccount.address;

                const actAccount = (<accountType>accountRefs[<Account>input.value]);                
                const actAddress = ((actAccount.wallet != undefined) && (actAccount.wallet != NULL_ADDRESS)) ? actAccount.wallet : actAccount.address;

                tx = await writeStableContract( 
                    "transferFrom", 
                    [ 
                    fromAddress,
                    toAddress,
                    input.value 
                    ], 
                    actAddress
                    );

                transferList.push(
                    Object.assign( { 
                        tx: tx
                        }, 
                        input
                        )
                    );        
                }
            }

        return transferList;
        }    
    },
    { 
    call: "stable",
    tag: "approve",
    help: "stable | approve [ { from: <Account>, to: <Account> }] -> Approve to <account> to manage transfer on behalf of from <Account>",
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