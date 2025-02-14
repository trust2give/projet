import { Address } from "viem";
import { contractSet, diamondNames, facetNames, smart, smartEntry, encodeInterfaces } from "../T2G_Data";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { globalState, setState } from "./states";
import fs from 'fs';

export const stateCallback : callbackType[] = [
    { 
    call: "state",
    tag: "beacon", 
    help: "state | beacon [] -> Get the list of smart contract instances that respond to beacon function call",
    callback: async ( inputs?: Array<any> ) : Promise<Object[] | undefined> => {

        const records : contractRecord[] = [diamondNames.Diamond, ...facetNames, ...contractSet];

        var result : { [cle: string]: string | Address; }[] = [];
    
        for ( const item of records) {
    
            var res : { [cle: string]: string; } = {
                name: item.name,
                beacon: "",
                address: NULL_ADDRESS,
                wallet: NULL_ADDRESS
                };
            
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
    }
    ]