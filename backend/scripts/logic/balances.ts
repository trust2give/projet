const hre = require("hardhat");
import { Address } from "viem";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountRefs, accountType, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "../logic/states";

export const getStableCoinBalance = async ( account: accountType | accountType[] ) : Promise<accountType | accountType[]> => {
    const wallets = await hre.viem.getWalletClients();
    const stable = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");
    var list : accountType[] = [];
    var item : accountType;
    var accounts : accountType[] = Array.isArray(account) ? account : [ account ];
    for ( item of accounts ) {
        if (item != undefined) {
            if (((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) || (item.address != NULL_ADDRESS)) {
                list.push( { 
                    name: item.name , 
                    address: item.address, 
                    wallet: item.wallet,
                    private: item.private,
                    balance: await stable.instance.read.balanceOf( [ 
                        ((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) ? item.wallet : item.address 
                        ], 
                        wallets[0] 
                        )});
                }
            }
        }
    return list;
    } 

export const showBalances = async () => {
    const wallets = await hre.viem.getWalletClients();

    console.log("Enter Get Balances")

    var balance : accountType[] = [{ 
        name: "", 
        address: NULL_ADDRESS, 
        wallet: undefined, 
        private: undefined, 
        balance: BigInt(0) 
        }];
        
    // Check and fetch possible wallet bound to account [ @Wallet, Private Key ]
    balance = await getWalletAddressFromSmartContract( <accountType[]>Object.values(accountRefs) );            
    balance = <accountType[]>await getStableCoinBalance( balance );
    //console.log(balance);

    colorOutput( "> ".concat( "Wallet".padEnd( 16, " "), " || ", " Balance (Stable Coin)".padEnd(34," "), "Address Primary[cyan] Secondary[yellow]".padEnd(34," ") ), "white"); //  , 

    for ( const item of balance) {
        try {
            const net1 : string = (item.balance > 0) ? colorOutput( "[".concat( 
                `${item.balance}`.padStart(32,"0"), "]"), 
                (((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) ? "yellow" : "cyan"), 
                true) : "";

            const net2 : string = (item.balance > 0) ? colorOutput( "[".concat( 
                (((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) ? item.wallet : item.address).padStart(32,"0"), "]"), 
                (((item.wallet != undefined) && (item.wallet != NULL_ADDRESS)) ? "yellow" : "cyan"), 
                true) : "";    
                
            colorOutput( "> ".concat( item.name.padEnd( 16, " "), " => ", net1, net2 ), "yellow"); //  , 
            }
        catch (error) {
            console.log(error)
            //colorOutput( "> ".concat( item.name.padEnd( 16, " "), " => Not Registered " ), "red");
            }
        }
    }
