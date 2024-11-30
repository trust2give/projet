const hre = require("hardhat");
import { Address } from "viem";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "../logic/states";

export const getStableCoinBalance = async ( account: Address | Address[] ) : Promise<{ address: Address, balance: bigint } | { address: Address, balance: bigint }[]> => {
    const wallets = await hre.viem.getWalletClients();
    const stable = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");
    var list : { address: Address, balance: bigint }[] = [];
    var accounts : Address[] = Array.isArray(account) ? account : [ account ];
    for ( const item of accounts ) {
        if (item != undefined || item != NULL_ADDRESS ) {
            list.push( { address: item, balance: await stable.instance.read.balanceOf( [ item ], wallets[0] ) } );                    
            }
        }
    return (list.length = 1) ? list[0] : list;
    } 


export const showBalances = async () => {
    const wallets = await hre.viem.getWalletClients();

    console.log("Enter Get Balances")

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
            
            var balance : { address: Address, balance: bigint } = { address: NULL_ADDRESS, balance: BigInt(0) };
            var net1 : string = "";
            
            balance = <{ address: Address, balance: bigint }>await getStableCoinBalance( item[1].address );
            //console.log(item[1].address, balance)
            
            net1 = (balance != undefined) ? colorOutput( "[".concat( `${balance.balance}`.padStart(32,"0"), "]"), (balance.balance > 0) ? "yellow" : "blue", true) : "_";
            
            var raw0 : { address: Address, balance: bigint } = { address: NULL_ADDRESS, balance: BigInt(0) };
            var net0 : string = "";

            if (AddressAndkeys[0] != NULL_ADDRESS) {
                raw0 = <{ address: Address, balance: bigint }>await getStableCoinBalance( AddressAndkeys[0] );
                net0 = (raw0 != undefined) ? colorOutput( "[".concat( `${raw0.balance}`.padStart(32,"0"), "]"), (raw0.balance > 0) ? "cyan" : "blue", true) : "_";
                }
            
            colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => ", net1, net0 ), "yellow"); //  , 
            }
        catch (error) {
            console.log(error)
            //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
            }
        }
    }
