import { diamondNames } from "../T2G_Data";
import { callbackType, Account, NULL_ADDRESS, NULL_HASH, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, accountType } from "../logic/states";
import { Address } from "viem";
import { getABI, writeFacetContract } from "../logic/instances";

/***************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* rights.ts
*
* Library of Typescript functions to interact with smart contract instances
* deployed on the blockchain : T2G_SyndicFacet
* 
* Mains functions:
* - rightCallback: Array of callback functions called through the web service interactions
*   - rights | all : Get the list of users and their rights
*   - rights | get : Get the rights fot the given account <account>
*   - rights | register : set the <flag> rights to the user <Account>
*   - rights | ban : Ban the account <account> of the T2G access
* 
* Version
* 1.0.1 : Creation of the file
/**************************************************************************************/

/************************************************************************************** 
 * Array rightCallback[]
 * 
 * Array of objects { call, tag, help, callback } that contains the callback functions
 * that are performed when <call | tag> is passed through the web service interface
 * 
 * Inputs : arguments depends on the callback functions:
 *   - rights | all : no argument
 *   - rights | get : [ { accounts <Account> } ]
 *   - rights | register : [ { accounts <Account>, flags <Number 0 - 255 > } ]
 *   - rights | ban : [ { accounts <Account> } ]
 * 
 * Returned values : depends on the callback functions :
 *   - rights | all : list of { account <Account>, rights: { results } } of rights with results :
 *                         { wallet <Address>, 
 *                           rights <Number>, 
 *                           isRegistered <Boolean>, 
 *                           isBan <Boolean> }
 *   - rights | get : list of { account <Account>, rights: { results } } of rights with results :
 *                         { wallet <Address>, 
 *                           rights <Number>, 
 *                           isRegistered <Boolean>, 
 *                           isBan <Boolean> }
 *   - rights | register : list of { account <Account>, tx: <Hash> } banned accounts 
 *                         with transaction hash
 *   - rights | ban : list of { account <Account>, tx: <Hash> } banned accounts 
 *                    with transaction hash
 *
***************************************************************************************/

export const rightCallback : callbackType[] = [
    {
    call: "rights", 
    tag: "all",
    help: "rights | all [] -> Get the list of users and their rights",
    callback: async ( inputs?: Array<any> ) : Promise<any> => {
            
        var result : { 
            wallet: Address,
            rights: number | string,
            isRegistered: boolean | string,
            isBanned: boolean | string
        }[] = [];
        
        const syndicABI : any = getABI("T2G_SyndicFacet");
    
        for ( const item of Object.entries(accountRefs)) {            
            if (item[1].name.match("Wallet [0-9]")) {
                var res : { 
                        wallet: Address,
                        rights: number | string,
                        isRegistered: boolean | string,
                        isBanned: boolean | string 
                        } = {
                            wallet: <Address>item[1].address,
                            rights: 0,
                            isRegistered: false,
                            isBanned: false
                        };
                        
                try {                        
                    res.rights = await globalState.clients.readContract({
                    address: diamondNames.Diamond.address,
                    abi: syndicABI.abi,
                    functionName: "getWalletRights",
                    args: [ item[1].address ]
                    });
                    }
                catch (error) {
                    res.rights = "Error";
                    }
    
                try {                        
                    res.isRegistered = await globalState.clients.readContract({
                    address: diamondNames.Diamond.address,
                    abi: syndicABI.abi,
                    functionName: "isWalletRegistered",
                    args: [ item[1].address ]
                    });
                    }
                catch (error) {
                    res.isRegistered = "Error";
                    }

                try {                        
                    res.isBanned = await globalState.clients.readContract({
                    address: diamondNames.Diamond.address,
                    abi: syndicABI.abi,
                    functionName: "isWalletBanned",
                    args: [ item[1].address ]
                    });
                    }
                catch (error) {
                    res.isBanned = "Error";
                    }
                
                result.push(res);
                }
            }
        
        return result;
        }
    },
    { 
    call: "rights",
    tag: "get",
    help: "rights | get [ { account: <Account> }] -> Get the rights fot the given account <account>",
    callback: async ( inputs: Array<{ account: Account }> ) : Promise<any> => {
                    
        if (inputs.length == 0) return undefined;

        const syndicABI : any = getABI("T2G_SyndicFacet");

        type refKeys = keyof typeof accountRefs;

        var rightList : Object[] = [];

        for (const input of inputs ) {
            var res : { 
                    wallet: Address,
                    rights: number | string,
                    isRegistered: boolean | string,
                    isBanned: boolean | string 
                    } = {
                        wallet: <Address>(<accountType>accountRefs[<refKeys>input.account]).address,
                        rights: 0,
                        isRegistered: false,
                        isBanned: false
                    };

            try {                        
                res.rights = await globalState.clients.readContract({
                address: diamondNames.Diamond.address,
                abi: syndicABI.abi,
                functionName: "getWalletRights",
                args: [ (<accountType>accountRefs[<refKeys>input.account]).address ]
                });
                }
            catch (error) {
                res.rights = "Error";
                }

            try {                        
                res.isRegistered = await globalState.clients.readContract({
                address: diamondNames.Diamond.address,
                abi: syndicABI.abi,
                functionName: "isWalletRegistered",
                args: [ (<accountType>accountRefs[<refKeys>input.account]).address ]
                });
                }
            catch (error) {
                res.isRegistered = "Error";
                }
            try {                        
                res.isBanned = await globalState.clients.readContract({
                address: diamondNames.Diamond.address,
                abi: syndicABI.abi,
                functionName: "isWalletBanned",
                args: [ (<accountType>accountRefs[<refKeys>input.account]).address ]
                });
                }
            catch (error) {
                res.isBanned = "Error";
                }

                rightList.push(
                Object.assign( { 
                    rights: res
                    }, 
                    input
                    )
                );
            }   
        return rightList;
        }
      },
    {
    call: "rights", 
    tag: "register",
    help: "rights | register [ { account: <Account>, flags: number }] -> set the <flag> rights to the user <Account>",
    callback: async ( inputs: Array<{ account: Account, flags: number }> ) => {

        if (inputs.length == 0) return undefined;

        var registerList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()
        
        for ( const input of inputs) {
            var tx : typeof regex2 = NULL_HASH;

            tx = <typeof regex2>await writeFacetContract(
                "T2G_SyndicFacet", 
                "registerWallet", 
                [ 
                (<accountType>accountRefs[<keyof typeof accountRefs>input.account]).address,
                input.flags
                ], 
                account 
                )

                registerList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );
            }
        return registerList;
        }
    },
    { 
    call: "rights",
    tag: "ban",
    help: "rights | ban [ { account: <Account> }] -> Ban the account <account> of the T2G access",
    callback: async ( inputs: Array<{ account: Account }> ) => {

        if (inputs.length == 0) return undefined;

        var banList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()
        
        for ( const input of inputs) {
            var tx : typeof regex2 = NULL_HASH;

            tx = <typeof regex2>await writeFacetContract(
                "T2G_SyndicFacet", 
                "banWallet", 
                [ 
                (<accountType>accountRefs[<keyof typeof accountRefs>input.account]).address 
                ], 
                account 
                )

                banList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );
            }
        return banList;
        }
    }
    ]