import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts, accountType } from "../logic/states";
import { Address } from "viem";
import { getGWEI, getABI, getStableABI, writeStableContract, encodeInputsAndSend, writeFacetContract } from "../logic/instances";

const rights = {
    VIEW: 1,
    GIVE: 2,
    OWN: 4,
    FARM: 8,
    GRANT: 16,
    COLLECT: 32,
    ADMIN: 64
    }

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
    help: "rights | ban [ { account: <Account> }] -> Ben the account <account> of the T2G access",
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