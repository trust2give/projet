import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { accountType, accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts } from "./states";
import { getGWEI, getABI, getStableABI, writeStableContract, encodeInputsAndSend, writeFacetContract } from "../logic/instances";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex, regex2, regex3 } from "../libraries/types";

type approval = { 
    owner: accountType, 
    spender: { 
        wallet: accountType, 
        value: bigint 
        }[] 
    }
    
export const approveCallback : callbackType[] = [
    { 
    tag: "get",
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
    tag: "update", 
    callback: async () => {
                
        const accounts = [ Account.A0, Account.AA, Account.AE, Account.AF, Account.AG ];
    
        for (const from of accounts ) {
            for (const to of accounts ) {
                const fromAccount = (<accountType>accountRefs[from]);
                const toAccount = (<accountType>accountRefs[to]);
                
                const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;
                const toAddress = ((toAccount.wallet != undefined) && (toAccount.wallet != NULL_ADDRESS)) ? toAccount.wallet : toAccount.address;

                return writeStableContract( 
                    "approve", 
                    [ 
                    toAddress,
                    BigInt(10**32) 
                    ], 
                    fromAddress
                    );
                }
            }
        return NULL_HASH;
        }
    },
    { tag: "set",
      callback: async ( from?: Account | accountType | accountType[], to?: Account ) => {
            console.log("Set Approvals %s => %s", from, to)

            const stableABI : any = getStableABI();
        
            if (Object.keys(accountRefs).includes(<Account>from) 
                && Object.keys(accountRefs).includes(<Account>to)) {
    
                const fromAccount = (<accountType>accountRefs[<Account>from]);
                const toAccount = (<accountType>accountRefs[<Account>to]);
                
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
            
                return writeStableContract( 
                    "approve", 
                    [ 
                    toAddress,
                    balance 
                    ], 
                    fromAddress
                    );
                }
            return NULL_HASH;
            }    
        }        
    ];