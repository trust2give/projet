const hre = require("hardhat");
import { Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { Statusoftoken, dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, TypeofUnit } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "./states";
import { getStableCoinBalance } from "./balances";
import { InteractWithContracts, setRecord } from "../InteractWithContracts";

export const createFunds = async ( from: Account, value: Number, rate: number ) => {
    console.log("Create Fund %s => %s %d", from, value, rate)

    const eur = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");
    const honey = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Honey");

    const transfer :rwRecord = setRecord( "EUR", "transfer");
    const setfund :rwRecord = setRecord( "Honey", "setFund");
    const fund :rwRecord = setRecord( "Honey", "fund");

    try {                        
        if (Object.keys(accountRefs).includes(from)) {
        
            type refKeys = keyof typeof accountRefs;
            
            const fromAccount = (<accountType>accountRefs[from]);
            const toAccount = (<accountType>accountRefs[Account.AA]);

            transfer.values = [ 
                fromAccount.address,
                value 
                ];

            const tx1 = await InteractWithContracts( <rwRecord>transfer, Account.A0, eur, true );            

            transfer.values = [ 
                toAccount.wallet,
                value 
                ];

            const tx2 = await InteractWithContracts( <rwRecord>transfer, from, eur, true );            

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
                
                            await InteractWithContracts( <rwRecord>setfund, Account.A0, honey, true );   

                            fund.values = [ 
                                tx2 
                                ];

                            const fundValue : {
                                state: number,
                                value: bigint,
                                unit: number,
                                hash0: string,
                                rate: number
                                }[] = await InteractWithContracts( <rwRecord>fund, Account.A0, honey, true );   

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

export const getAllFunds = async ( ) => {
    console.log("Get All Fund");

    const honey = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Honey");

    const getfunds :rwRecord = setRecord( "Honey", "getFunds");
    const fund :rwRecord = setRecord( "Honey", "fund");

    try {                        
        getfunds.values = [];

        const fundIds : string[] = await InteractWithContracts( <rwRecord>getfunds, Account.A0, honey, true );   
        
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
                }[] = await InteractWithContracts( <rwRecord>fund, Account.A0, honey, true );   
                
            const color : string = ["blue", "yellow", "cyan", "green", "white", "red"][fundValue[0].state];

            colorOutput( "> ".concat(
                "[".concat(id,"] "), 
                " => Funded ", 
                `${fundValue[0].value}`,
                " ", 
                TypeofUnit[fundValue[0].unit], 
                " Rate: ",
                `${fundValue[0].rate}`
                 ), color);
            }
        }
    catch (error) {
        console.log(error)
        //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
        }
    }