const hre = require("hardhat");
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts, accountType } from "../logic/states";
import { InteractWithContracts, setRecord } from "../InteractWithContracts";

const rights = {
    VIEW: 1,
    GIVE: 2,
    OWN: 4,
    FARM: 8,
    GRANT: 16,
    COLLECT: 32,
    ADMIN: 64
    }

export const getRights = async ( account: Account ) => {
    console.log("Get rights %s", account)

    const syndic = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Syndication");

    const walletRights :rwRecord = setRecord( "Syndication", "getWalletRights");
    const isRegistered :rwRecord = setRecord( "Syndication", "isWalletRegistered");
    const isBanned :rwRecord = setRecord( "Syndication", "isWalletBanned");
    
    try {                        
        if (Object.keys(accountRefs).includes(account)) {
            type refKeys = keyof typeof accountRefs;

            walletRights.values = [ (<accountType>accountRefs[account]).address ];
            isRegistered.values = [ (<accountType>accountRefs[account]).address ];
            isBanned.values = [ (<accountType>accountRefs[account]).address ];

            const isReg = Boolean(await InteractWithContracts( <rwRecord>walletRights, Account.A0, syndic, true ));            
            const isBan = Boolean(await InteractWithContracts( <rwRecord>isRegistered, Account.A0, syndic, true ));            
            const wRights : number = Number(await InteractWithContracts( <rwRecord>isBanned, Account.A0, syndic, true ));            
            
            // We format the display of rights for a wallet
            const flags = Object.entries(rights).reduce( ( acc, cur) => {
                return acc.concat( colorOutput( cur[0], (cur[1] & wRights) ? (isBan) ? "red" : (isReg) ? "green" : "blue" : "blue", true), ` `);
                }, "[" );
            const net4 = (wRights != undefined) ? colorOutput( "[".concat( flags, "]"), "blue", true) : "_";
            
            colorOutput( "> ".concat( (<accountType>accountRefs[account]).name.padEnd( 16, " "), " => ", net4 ), "yellow"); //  , 
        }
        }
    catch (error) {
        console.log(error)
        //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
        }
    }
    

export const setRights = async ( account: Account, flags: number | boolean ) => {
    console.log("Set rights %s %d", account, flags)

    const syndic = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Syndication");
    const registerWallet :rwRecord = setRecord( "Syndication", "registerWallet");

    try {                        
        if (Object.keys(accountRefs).includes(account)) {
            type refKeys = keyof typeof accountRefs;
            registerWallet.values = [ (<accountType>accountRefs[account]).address, flags ];
            await InteractWithContracts( <rwRecord>registerWallet, Account.A0, syndic );            
            }
        }
    catch (error) {
        console.log(error)
        //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
        }
    }

export const banRights = async ( account: Account ) => {
    console.log("Ban rights %s %d", account)

    const syndic = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Syndication");
    const registerWallet :rwRecord = setRecord( "Syndication", "banWallet");

    try {                        
        if (Object.keys(accountRefs).includes(account)) {
            type refKeys = keyof typeof accountRefs;
            registerWallet.values = [ (<accountType>accountRefs[account]).address ];
            await InteractWithContracts( <rwRecord>registerWallet, Account.A0, syndic );            
            }
        }
    catch (error) {
        console.log(error)
        //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
        }
    }
    
export const showRights = async () => {
    const wallets = await hre.viem.getWalletClients();
    const syndic = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Syndication");

    for ( const item of Object.entries(accountRefs)) {
        try {                        
            if (item[1].name.match("Wallet [0-9]")) {
                const isReg : string = (Number(await syndic.instance.read.isWalletRegistered( [ item[1].address ], wallets[0] )) == 1) ? "green" : "blue";
                const isBan = (Number(await syndic.instance.read.isWalletBanned( [ item[1].address ], wallets[0] )) == 1) ? "red" : isReg;
                const wRights : number = await syndic.instance.read.getWalletRights( [ item[1].address ], wallets[0] );
                
                // We format the display of rights for a wallet
                const flags = Object.entries(rights).reduce( ( acc, cur) => {
                    return acc.concat( colorOutput( cur[0], (cur[1] & wRights) ? isBan : "blue", true), ` `);
                    }, "[" );
                const net4 = (wRights != undefined) ? colorOutput( "[".concat( flags, "]"), "blue", true) : "_";
                
                colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => ", net4 ), "yellow"); //  , 
                }
            }
        catch (error) {
            //console.log(error)
            //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
            }
        }
    }
