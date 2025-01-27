const hre = require("hardhat");
import { contractSet, diamondNames, facetNames, smart, smartEntry, encodeInterfaces } from "../T2G_Data";
import { colorOutput } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts } from "./states";
import fs from 'fs';

export const showBeacons = async ( records: contractRecord[] ) : Promise<string[]> => {
        
    var result : string[] = [];

    for ( const item of records) {
        try {

            // Read the beacon_<SC Name> function for each Smart Contract Facet of the Diamond
            var beacon : string = "None";
            var realAddress : string = NULL_ADDRESS;
            var wallet : string = NULL_ADDRESS;
            
            const jsonBeacon = fs.readFileSync( 
                item.abi.path, 
                'utf-8' 
                );
        
            const facetABI : any = JSON.parse(jsonBeacon);

            if (item.beacon) {
                
                const raw1 = await globalState.clients.readContract({
                    address: (item.address == NULL_ADDRESS) ? diamondNames.Diamond.address : item.address,
                    abi: facetABI.abi,
                    functionName: <string>item.beacon,
                    args: []
                    });
                
                beacon = "[".concat( (raw1 != undefined) ? raw1 : "None", "]");
                }    

            if (item.get) {

                const raw2 = await globalState.clients.readContract({
                    address: (item.address == NULL_ADDRESS) ? diamondNames.Diamond.address : item.address,
                    abi: facetABI.abi,
                    functionName: <string>item.get,
                    args: []
                    });
    
                realAddress = "[".concat( (raw2 != undefined) ? raw2 : `${NULL_ADDRESS}`, "]" );
                }
    
            if (item.wallet) {

                const raw3 = await globalState.clients.readContract({
                    address: (item.address == NULL_ADDRESS) ? diamondNames.Diamond.address : item.address,
                    abi: facetABI.abi,
                    functionName: <string>item.wallet,
                    args: []
                    });
    
                wallet = "[".concat( (raw3 != undefined) ? raw3[0] : `${NULL_ADDRESS}`, "]");
                }

            result.push("> ".concat( item.name.padEnd(16, " "), " => ", beacon.padEnd(36, " "), realAddress.padEnd(42, " "), wallet ));

            }
        catch {
            result.push("> ".concat( item.name.padEnd(16, " "), " => Error " ));
            }
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
    
    