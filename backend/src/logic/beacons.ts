const hre = require("hardhat");
import { Address } from "viem";
import { contractSet, diamondNames, facetNames, smart, smartEntry, encodeInterfaces } from "../T2G_Data";
import { colorOutput } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts } from "./states";
import fs from 'fs';

export const showBeacons = async ( records: contractRecord[] ) : Promise<{ [cle: string]: string | Address; }[]> => {
        
    var result : { [cle: string]: string | Address; }[] = [];
    
    for ( const item of records) {

        console.log(item);

        var res : { [cle: string]: string; } = {
            name: item.name,
            beacon: "",
            address: NULL_ADDRESS,
            wallet: NULL_ADDRESS
            };

        // Read the beacon_<SC Name> function for each Smart Contract Facet of the Diamond
        var beacon : string = "None";
        var realAddress : string = NULL_ADDRESS;
        var wallet : string = NULL_ADDRESS;
        
        const jsonBeacon = fs.readFileSync( 
            item.abi.path, 
            'utf-8' 
        );
        
        const facetABI : any = JSON.parse(jsonBeacon);
        
        try {
            if (item.beacon) {
                
                const raw1 = await globalState.clients.readContract({
                    address: (item.address == NULL_ADDRESS) ? diamondNames.Diamond.address : item.address,
                    abi: facetABI.abi,
                    functionName: <string>item.beacon,
                    args: []
                    });
                
                res.beacon = "[".concat( (raw1 != undefined) ? raw1 : "None", "]");
                }
            }    
        catch {
            res.beacon = "[Error]";
            }
        
        try {
            if (item.get) {

                const raw2 = await globalState.clients.readContract({
                    address: (item.address == NULL_ADDRESS) ? diamondNames.Diamond.address : item.address,
                    abi: facetABI.abi,
                    functionName: <string>item.get,
                    args: []
                    });
    
                res.address = (raw2 != undefined) ? <Address>raw2 : NULL_ADDRESS;
                }
            }    
        catch {
            res.address = NULL_ADDRESS;
            }
    
        try {
            if (item.wallet) {

                const raw3 = await globalState.clients.readContract({
                    address: (item.address == NULL_ADDRESS) ? diamondNames.Diamond.address : item.address,
                    abi: facetABI.abi,
                    functionName: <string>item.wallet,
                    args: []
                    });

                res.wallet = (raw3 != undefined) ? <Address>raw3 : NULL_ADDRESS;
                }
            }    
        catch {
            res.wallet = NULL_ADDRESS;
            }

        result.push( res );
        }
    return result;
    }

    /*
export const getAddress = async ( item: contractRecord ) : Promise<Array<any>>=> {

    const loupe = <menuRecord>smart.find((el: menuRecord ) => el.contract == diamondNames.DiamondLoupeFacet.name);

    try {
        const record = <menuRecord>smart.find((el: menuRecord ) => el.contract == item.name);

        // Read the get_<SC Name> function for each Smart Contract Facet of the Diamond
        const raw2 : any = (item.get) ? await record.instance.read[<string>item.get]( [], globalState.wallets[0] ) : undefined;
        
        // Read the wallet_<SC Name> function for each Smart Contract Facet of the Diamond
        const raw3 : any = (item.wallet) ? await record.instance.read[<string>item.wallet]( [], globalState.wallets[0] ) : undefined;
        }
    catch {
        colorOutput( "> ".concat( item.name.padEnd(16, " "), " => Error " ), "red");
        }
    return [raw2, raw3];
    }*/
    
    