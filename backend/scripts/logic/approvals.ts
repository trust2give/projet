const hre = require("hardhat");
import { Address } from "viem";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "./states";
import { InteractWithContracts } from "../InteractWithContracts";
import { setrwRecordFromSmart } from "../logic/instances";

type approval = { 
    owner: accountType, 
    spender: { 
        wallet: accountType, 
        value: bigint 
        }[] 
    }

    export const getStableCoinApprovals = async ( owners: accountType | accountType[] ) : Promise<approval[]> => {

        const stable = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");
    
        var list : approval[] = [];
    
        var Owners : accountType[] = (Array.isArray(owners) ? owners : [ owners ]).map((item: accountType) => {
            item.address = ((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) ? NULL_ADDRESS : item.address;
            item.wallet = ((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) ? item.wallet : NULL_ADDRESS;
            return item;
            });
    
            for ( var owner of Owners ) {
                var senderList : { wallet: accountType, value: bigint }[] = []; 
                for ( var spender of Owners ) {
                    senderList.push( { 
                        wallet: spender,
                        value: await stable.instance.read.allowance( 
                            [ (owner.wallet != NULL_ADDRESS) ? owner.wallet : owner.address, 
                                (spender.wallet != NULL_ADDRESS) ? spender.wallet : spender.address ], 
                                globalState.wallets[0] )
                            });                    
                        }   
                        list.push( { 
                            owner: owner, 
                            spender: senderList
                        });                    
                    }
        return list;
        }
    
export const approveCallback : { tag: string, callback: (from?: Account, to?: Account) => {} }[] = [
    { tag: "update", 
      callback: async () => {
            console.log("Update Approvals")
                
            const approve :rwRecord = await setrwRecordFromSmart( "approve", "EUR");
        
            const accounts = [ Account.A0, Account.AA, Account.AE, Account.AF, Account.AG ];
        
            try {                        
                for (const from of accounts ) {
                    for (const to of accounts ) {
                        const fromAccount = (<accountType>accountRefs[from]);
                        const toAccount = (<accountType>accountRefs[to]);
                        
                        const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;
                        const toAddress = ((toAccount.wallet != undefined) && (toAccount.wallet != NULL_ADDRESS)) ? toAccount.wallet : toAccount.address;
                   
                        approve.values = [ 
                            toAddress,
                            BigInt(10**32) 
                            ];
                
                        await InteractWithContracts( <rwRecord>approve, from );            
                        }
                    }
                }
            catch (error) {
                console.log(error)
                }
            }
        },
    { tag: "all",
      callback: async () => {
            console.log("Enter Get Allowances")
            
            const approve : approval[] = await getStableCoinApprovals( Object.values(accountRefs) );
        
            for ( var item of approve) {
                try {
                    //console.log(item)
                    const displaySender = item.spender.map((item) => {
                        if (item.value > 0) {
                            return colorOutput( 
                                "[".concat( 
                                    item.wallet.name, 
                                    `:${item.value}`, 
                                    "]" 
                                    ), 
                                ["cyan", "yellow"][Number(item.wallet.wallet != NULL_ADDRESS)], 
                                true)
                            }
                        return "";
                        });
        
                    colorOutput( "> ".concat( item.owner.name.padEnd( 16, " "), " => ", displaySender.join(" ") ), "yellow"); //  , 
                    }
                catch (error) {
                    console.log(error)
                    //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                    }
                }
            }
        },
    { tag: "set",
      callback: async ( from?: Account, to?: Account ) => {
            console.log("Set Approvals %s => %s", from, to)
                
            const approve :rwRecord = await setrwRecordFromSmart( "approve", "EUR");
            const balanceOf :rwRecord = await setrwRecordFromSmart( "balanceOf", "EUR");
        
            try {                        
                if (Object.keys(accountRefs).includes(from) 
                    && Object.keys(accountRefs).includes(to)) {
        
                    const fromAccount = (<accountType>accountRefs[from]);
                    const toAccount = (<accountType>accountRefs[to]);
                    
                    const fromAddress = ((fromAccount.wallet != undefined) && (fromAccount.wallet != NULL_ADDRESS)) ? fromAccount.wallet : fromAccount.address;
                    const toAddress = ((toAccount.wallet != undefined) && (toAccount.wallet != NULL_ADDRESS)) ? toAccount.wallet : toAccount.address;
        
                    type refKeys = keyof typeof accountRefs;
        
                    balanceOf.values = [ fromAddress ];
                    const balance = Number(await InteractWithContracts( <rwRecord>balanceOf, Account.A0, true ));            
                    //console.log("balance", fromAddress, balance)
                    approve.values = [ 
                        toAddress,
                        balance 
                        ];
        
                    await InteractWithContracts( <rwRecord>approve, <Account>from );            
                    }
                }
            catch (error) {
                console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            }    
        }        
    ];