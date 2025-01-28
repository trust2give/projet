import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { colorOutput } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts, accountType } from "../logic/states";
//import { InteractWithContracts } from "../InteractWithContracts";
//import { setrwRecordFromSmart } from "../logic/instances";
import fs from 'fs';
import { Address } from "viem";

const rights = {
    VIEW: 1,
    GIVE: 2,
    OWN: 4,
    FARM: 8,
    GRANT: 16,
    COLLECT: 32,
    ADMIN: 64
    }

export const rightCallback : { 
    tag: string, 
    callback: any }[] = [
    { tag: "all",
      callback: async () : Promise<any> => {
            
        var result : { 
            wallet: Address,
            rights: number | string,
            isRegistered: boolean | string,
            isBanned: boolean | string
        }[] = [];
        
        const jsonRights = fs.readFileSync( 
            (<contractRecord>facetNames.find( (item) => item.name == "T2G_SyndicFacet")).abi.path, 
            'utf-8' 
            );
        
        const syndicABI : any = JSON.parse(jsonRights);
    
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
    { tag: "get",
        callback: async ( account?: Account ) : Promise<any> => {
                    
        const jsonRights = fs.readFileSync( 
            (<contractRecord>facetNames.find( (item) => item.name == "T2G_SyndicFacet")).abi.path, 
            'utf-8' 
            );

        const syndicABI : any = JSON.parse(jsonRights);

        type refKeys = keyof typeof accountRefs;

        console.log("account", account)
        var res : { 
                wallet: Address,
                rights: number | string,
                isRegistered: boolean | string,
                isBanned: boolean | string 
                } = {
                    wallet: <Address>(<accountType>accountRefs[<refKeys>account]).address,
                    rights: 0,
                    isRegistered: false,
                    isBanned: false
                };
                
        try {                        
            res.rights = await globalState.clients.readContract({
            address: diamondNames.Diamond.address,
            abi: syndicABI.abi,
            functionName: "getWalletRights",
            args: [ (<accountType>accountRefs[<refKeys>account]).address ]
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
            args: [ (<accountType>accountRefs[<refKeys>account]).address ]
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
            args: [ (<accountType>accountRefs[<refKeys>account]).address ]
            });
            }
        catch (error) {
            res.isBanned = "Error";
            }

        return res;
        }
      },
      { tag: "register",
      callback: async ( account?: Account, flags?: number | boolean ) : Promise<any> => {
            console.log("Register rights %s %d", account, flags)
        
            const jsonRights = fs.readFileSync( 
                (<contractRecord>facetNames.find( (item) => item.name == "T2G_SyndicFacet")).abi.path, 
                'utf-8' 
                );

            const syndicABI : any = JSON.parse(jsonRights);

            try {                        
                type refKeys = keyof typeof accountRefs;

                return await globalState.clients.writeContract({
                    address: diamondNames.Diamond.address,
                    abi: syndicABI.abi,
                    functionName: "registerWallet",
                    args: [ (<accountType>accountRefs[<refKeys>account]).address, flags ]
                    });
                }
            catch (error) {
                return error;
                }
            }
        },
    /*{ tag: "ban",
      callback: async ( account?: Account ) => {
            console.log("Ban rights %s %d", account)
        
            const registerWallet :rwRecord = await setrwRecordFromSmart( "banWallet", "Syndication" );
        
            try {                        
                if (Object.keys(accountRefs).includes(account)) {
                    type refKeys = keyof typeof accountRefs;
                    registerWallet.values = [ (<accountType>accountRefs[account]).address ];
                    await InteractWithContracts( <rwRecord>registerWallet, Account.A0 );            
                    }
                }
            catch (error) {
                console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            }
        }*/
    ]