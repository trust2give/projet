const hre = require("hardhat");
import { Address } from "viem";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "../logic/states";

export const getStableCoinApprovals = async ( 
    owners: Address | Address[], 
    spenders: Address | Address[] ) : Promise<{ owner: Address, spender: Address, value: bigint }[]> => {
    const wallets = await hre.viem.getWalletClients();
    const stable = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");

    var list : { owner: Address, spender: Address, value: bigint }[] = [];

    var Owners : Address[] = Array.isArray(owners) ? owners : [ owners ];
    var Spenders : Address[] = Array.isArray(spenders) ? spenders : [ spenders ];

    for ( const owner of Owners ) {
        if (owner != undefined || owner != NULL_ADDRESS ) {
            for ( const spender of Spenders ) {
                if (spender != undefined || spender != NULL_ADDRESS ) {
                    list.push( { 
                        owner: owner, 
                        spender: spender,
                        value: await stable.instance.read.allowance( [ owner, spender ], wallets[0] )
                        });                    
                    }
                }
            }
        }
    return list;
    }

export const showApprovals = async () => {
    const wallets = await hre.viem.getWalletClients();
    const stable = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");
    const syndic = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Syndication");

    console.log("Enter Get Allowances")

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

            balance = getStableCoinBalance( [ item[1].address ] );                    
            
            net1 = (balance != undefined) ? colorOutput( "[".concat( `${balance}`.padStart(32,"0"), "]"), (balance > 0) ? "yellow" : "blue", true) : "_";
            
            if (item[1].name.match("Wallet [0-9]")) {
                }
            var raw0 : bigint = BigInt(0);
            var net0 : string = "";

            if (AddressAndkeys[0] != NULL_ADDRESS) {
                raw0 = await stable.instance.read.balanceOf( [ AddressAndkeys[0] ], wallets[0] );
                net0 = (raw0 != undefined) ? colorOutput( "[".concat( `${raw0}`.padStart(32,"0"), "]"), (raw0 > 0) ? "cyan" : "blue", true) : "_";
                }
            
            //console.log(wallets[0])
            // Should a wallet@ exist, we display the approved @ related to it
            //colorOutput( "[".concat( accountRefs[index].name, ":", `${approve}`, "]" ), "yellow", true)
            var approveList : string[] = [];
            if (item[1].wallet != undefined && item[1].wallet != NULL_ADDRESS) {
                type AccountKeys = keyof typeof accountRefs;

                // Wallet 0
                // T2G_Root (Address) & (Wallet)
                // Honey (Address) & (Wallet)
                // Pool (Address) & (Wallet)
                // Pollen (Address) & (Wallet)
                const accountList : { label: AccountKeys, wallet: 'wallet' | 'address' }[] = [ 
                    { label: <AccountKeys>'@0', wallet: 'address' }, 
                    { label: <AccountKeys>'@A', wallet: 'wallet'  }, 
                    { label: <AccountKeys>'@E', wallet: 'wallet'  }, 
                    { label: <AccountKeys>'@F', wallet: 'wallet'  }, 
                    { label: <AccountKeys>'@G', wallet: 'wallet'  } 
                    ]
                
                approveList = [];

                for ( const index of accountList) {
                    //console.log(item[1].wallet, (accountRefs[index.label])[index.wallet])

                    const approve : { owner: Address, spender: Address, value: bigint }[] = await getStableCoinApprovals( 
                        item[1].wallet, 
                        (accountRefs[index.label])[index.wallet]
                        );
                    
                        //console.log(approve)
                    
                    approveList.push(
                        colorOutput( "[".concat( ["NOK", "OK "][Number(approve[0].value > 0)], "]" ), ["red", "green"][Number(approve[0].value > 0)], true)
                        );
                    }
                }

            colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => ", net1, net0, approveList.join(" ") ), "yellow"); //  , 
            }
        catch (error) {
            //console.log(error)
            //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
            }
        }
    }
