const hre = require("hardhat");
import { Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { Statusoftoken, dataDecodeABI, abiData, honeyFeatures, pollenFeatures, TypeofUnit } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "./states";
import { getStableCoinBalance } from "./balances";
import { setrwRecordFromSmart } from "../logic/instances";
import { InteractWithContracts } from "../InteractWithContracts";

  
export const honeyCallback : { tag: string, callback: (from: Account, fund: string, entity?: string) => {} }[] = [
    { tag: "mint", 
      callback: async ( from: Account, fund: string, entity?: string ) => {

            const mint: rwRecord = await setrwRecordFromSmart( "mintHoney", "Honey" );
        
            try {                        
                if (Object.keys(accountRefs).includes(from)) {
                            
                    const fromAccount = (<accountType>accountRefs[from]);
        
                    mint.values = [ 
                        fromAccount.address,
                        entity,
                        fund
                        ];
        
                    const tx1 = await InteractWithContracts( <rwRecord>mint, Account.A0, true );            
                    }
                }
            catch (error) {
                console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            }
        },
    { tag: "approve",
      callback: async ( from: Account, fund: string ) => {

            const approve :rwRecord = await setrwRecordFromSmart( "approveHoney", "Honey" );
        
            try {                        
                if (Object.keys(accountRefs).includes(from)) {
                            
                    const fromAccount = (<accountType>accountRefs[from]);
        
                    approve.values = [ 
                        fund,
                        fromAccount.address
                        ];
                        
                    await InteractWithContracts( <rwRecord>approve, Account.A0 );            
                    }
                }
            catch (error) {
                console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            }
        },
    { tag: "transfer",
      callback: async ( from: Account, fund: string ) => {

            const transfer :rwRecord = await setrwRecordFromSmart( "transferToPool", "Honey");
        
            try {                        
                if (Object.keys(accountRefs).includes(from)) {
                            
                    const fromAccount = (<accountType>accountRefs[from]);
        
                    transfer.values = [ 
                        fund,
                        fromAccount.address
                        ];
        
                    await InteractWithContracts( <rwRecord>transfer, Account.A0 );            
                    }
                }
            catch (error) {
                console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            }
        }
    ]

export const fundCallback : { tag: string, callback: (silent: boolean, from?: Account, value?: number, rate?: number) => {} }[] = [
    { tag: "set",
      callback: async ( silent: boolean, from?: Account, value?: number, rate?: number ) => {
            console.log("Create Fund %s => %s %d", from, value, rate)
     
            const decimals :rwRecord = await setrwRecordFromSmart( "decimals", "EUR");
            const transfer :rwRecord = await setrwRecordFromSmart( "transfer", "EUR");
            const setfund :rwRecord = await setrwRecordFromSmart( "setFund", "Honey" );
            const fund :rwRecord = await setrwRecordFromSmart( "fund", "Honey");
        
            const gwei = await InteractWithContracts( <rwRecord>decimals, Account.A0, true );            
            console.log("GWEI decimals %d", gwei);
        
            try {                        
                if (Object.keys(accountRefs).includes(from)) {
                
                    type refKeys = keyof typeof accountRefs;
                    
                    const fromAccount = (<accountType>accountRefs[from]);
                    const toAccount = (<accountType>accountRefs[Account.AA]);
        
                    transfer.values = [ 
                        fromAccount.address,
                        BigInt(value * (10 ** gwei))
                        ];
        
                    const tx1 = await InteractWithContracts( <rwRecord>transfer, Account.A0 );            
        
                    transfer.values = [ 
                        toAccount.wallet,
                        BigInt(value * (10 ** gwei))
                        ];
                    console.log( transfer )
                    const tx2 = await InteractWithContracts( <rwRecord>transfer, <Account>from );            
        
                    if ("T2G_HoneyFacet" in encodeInterfaces) {
                        const encodeInput = encodeInterfaces.T2G_HoneyFacet.find((item) => item.function == "setFund");
        
                        type decKeys = keyof typeof dataDecodeABI;
        
                        if (encodeInput != undefined) {
                            if ("_data" in encodeInput) {
                                if (encodeInput._data in dataDecodeABI) {
        
                                    const encodedData = encodeAbiParameters( dataDecodeABI[<decKeys>encodeInput._data], [[
                                        Statusoftoken.findIndex((item) => item == 'None'),
                                        value,
                                        TypeofUnit.findIndex((item) => item == 'GWEI'),
                                        tx2,
                                        rate
                                        ]] );
        
                                    setfund.values = [ 
                                        encodedData 
                                        ];
                        
                                    await InteractWithContracts( <rwRecord>setfund, Account.A0 );   
        
                                    fund.values = [ 
                                        tx2 
                                        ];
        
                                    const fundValue : {
                                        state: number,
                                        value: bigint,
                                        unit: number,
                                        hash0: string,
                                        rate: number
                                        }[] = await InteractWithContracts( <rwRecord>fund, Account.A0, true );   
                            
                                    colorOutput( "> ".concat(
                                        "[".concat(tx2,"] "), 
                                        Statusoftoken[fundValue[0].state], 
                                        " => Funded ", 
                                        `${fundValue[0].value}`,
                                        " ", 
                                        TypeofUnit[fundValue[0].unit], 
                                        " Rate: ",
                                        `${fundValue[0].rate}`
                                         ), "green");
                                    }
                                }
                            }
                        }
        
                    }
                }
            catch (error) {
                console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            } 
    },
    { tag: "all",
      callback: async ( silent: boolean ) : Promise<string[] | undefined> => {
            console.log("Get All Fund");
                
            const getfunds :rwRecord = await setrwRecordFromSmart( "getFunds", "Honey");
            const fund :rwRecord = await setrwRecordFromSmart( "fund", "Honey");
        
            const decimals :rwRecord = await setrwRecordFromSmart( "decimals", "EUR");
        
            const gwei = await InteractWithContracts( <rwRecord>decimals, Account.A0, true );            
            console.log("GWEI decimals %d", gwei);
            //BigInt(value * (10 ** gwei)),
        
            try {                        
                getfunds.values = [];
        
                const fundIds : string[] = await InteractWithContracts( <rwRecord>getfunds, Account.A0, true );   
                
                if (!silent) {
                    var rank = 0;
                    for (const id of fundIds) {
                        fund.values = [
                            id
                            ];
                        
                        const fundValue : {
                            state: number,
                            value: bigint,
                            unit: number,
                            hash0: string,
                            rate: number
                            }[] = await InteractWithContracts( <rwRecord>fund, Account.A0, true );   
                            
                        const color : string = ["blue", "yellow", "cyan", "green", "white", "red", "red"][fundValue[0].state];
            
                        colorOutput( `> ${rank++} => `.concat(
                            "[".concat(id,"] "), 
                            " => Funded ", 
                            `${fundValue[0].value}`,
                            ".".padEnd(gwei, "0"),
                            " ", 
                            TypeofUnit[fundValue[0].unit], 
                            " Rate: ",
                            `${fundValue[0].rate}`
                                ), color);
                        }
                    }
                return fundIds;
                }
            catch (error) {
                console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
        }
    }
    ]