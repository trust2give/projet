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
    /*{ tag: "set",
      callback: async ( account?: Account, flags?: number | boolean ) => {
            console.log("Set rights %s %d", account, flags)
        
            const registerWallet :rwRecord = await setrwRecordFromSmart( "registerWallet", "Syndication");
        
            try {                        
                if (Object.keys(accountRefs).includes(account)) {
                    
                    type refKeys = keyof typeof accountRefs;
                    
                    registerWallet.values = [ (<accountType>accountRefs[account]).address, flags ];

                    await InteractWithContracts( <rwRecord>registerWallet, Account.A0, true );            
                    }
                }
            catch (error) {
                console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            }
        },
    { tag: "get",
      callback: async ( account?: Account ) => {
            console.log("Get rights %s", account)
                
            const walletRights :rwRecord = await setrwRecordFromSmart( "getWalletRights", "Syndication");
            const isRegistered :rwRecord = await setrwRecordFromSmart( "isWalletRegistered", "Syndication" );
            const isBanned :rwRecord = await setrwRecordFromSmart( "isWalletBanned", "Syndication" );
            
            try {                        
                if (Object.keys(accountRefs).includes(account)) {
                    type refKeys = keyof typeof accountRefs;
        
                    walletRights.values = [ (<accountType>accountRefs[account]).address ];
                    isRegistered.values = [ (<accountType>accountRefs[account]).address ];
                    isBanned.values = [ (<accountType>accountRefs[account]).address ];
        
                    const isReg = Boolean(await InteractWithContracts( <rwRecord>walletRights, Account.A0, true ));            
                    const isBan = Boolean(await InteractWithContracts( <rwRecord>isRegistered, Account.A0, true ));            
                    const wRights : number = Number(await InteractWithContracts( <rwRecord>isBanned, Account.A0, true ));            
                    
                    // We format the display of rights for a wallet
                    const flags = Object.entries(rights).reduce( ( acc, cur) => {
                        return acc.concat( colorOutput( cur[0], (cur[1] & wRights) ? (isBan) ? "red" : (isReg) ? "green" : "blue" : "blue", true), ` `);
                        }, "[" );
                    const net4 = (wRights != undefined) ? colorOutput( "[".concat( flags, "]"), "blue", true) : "_";
                    
                    colorOutput( "> ".concat( (<accountType>accountRefs[account]).name.padEnd( 16, " "), " => ", net4 ), "yellow"); //  , 
                }
                }
            catch (error) {
                //console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            }
        },
    { tag: "ban",
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