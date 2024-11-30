const hre = require("hardhat");
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "../logic/states";

export const showRights = async () => {
    const wallets = await hre.viem.getWalletClients();
    const stable = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");
    const syndic = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Syndication");

    const rights = {
        VIEW: 1,
        GIVE: 2,
        OWN: 4,
        FARM: 8,
        GRANT: 16,
        COLLECT: 32,
        ADMIN: 64
        }

    for ( const item of Object.entries(accountRefs)) {
        try {
            var AddressAndkeys : Array<any> = [ NULL_ADDRESS, "0x0000000000000000000000000000000000000000000000000000000000000000"];
            
            const facet : menuRecord = <menuRecord>smart.find((el: menuRecord ) => el.contract == item[1].name);
            if (facet != undefined) {
                const facets : contractRecord = <contractRecord>facetNames.find((el: contractRecord ) => el.name == item[1].name);
                if (facets != undefined) {
                    if (facets.wallet) {
                        AddressAndkeys = await facet.instance.read[<string>facets.wallet]( [], wallets[0] );
                    }
                }
                else {
                    if (diamondNames.Diamond.name == item[1].name) {
                        AddressAndkeys = await facet.instance.read[<string>diamondNames.Diamond.wallet]( [], wallets[0] );
                        }   
                    }   
                }   
            
            var balance : bigint = BigInt(0);
            var net1 : string = "";
            balance = await stable.instance.read.balanceOf( [ item[1].address ], wallets[0] );                    
            net1 = (balance != undefined) ? colorOutput( "[".concat( `${balance}`.padStart(32,"0"), "]"), (balance > 0) ? "yellow" : "blue", true) : "_";
            
            if (item[1].name.match("Wallet [0-9]")) {
                const isReg : string = (Number(await syndic.instance.read.isWalletRegistered( [ item[1].address ], wallets[0] )) == 1) ? "green" : "blue";
                const isBan = (Number(await syndic.instance.read.isWalletBanned( [ item[1].address ], wallets[0] )) == 1) ? "red" : isReg;
                const wRights : number = await syndic.instance.read.getWalletRights( [ item[1].address ], wallets[0] );
                
                // We format the display of rights for a wallet
                const flags = Object.entries(rights).reduce( ( acc, cur) => {
                    return acc.concat( colorOutput( cur[0], (cur[1] & wRights) ? isBan : "blue", true), ` `);
                    }, "[" );
                const net4 = (wRights != undefined) ? colorOutput( "[".concat( flags, "]"), "blue", true) : "_";
                
                colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => ", net1, net4 ), "yellow"); //  , 
                }
            }
        catch (error) {
            //console.log(error)
            //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
            }
        }
    }
