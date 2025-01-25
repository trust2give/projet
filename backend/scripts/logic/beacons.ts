const hre = require("hardhat");
import { contractSet, diamondNames, facetNames, smart, smartEntry, encodeInterfaces } from "../T2G_Data";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "./states";
import { setrwRecordFromSmart } from "../logic/instances";
import { InteractWithContracts } from "../InteractWithContracts";
import { setNextBlockBaseFeePerGas } from "viem/_types/actions/test/setNextBlockBaseFeePerGas";

export const showBeacons = async ( records: contractRecord[]) => {

    const loupe :rwRecord = await setrwRecordFromSmart( 
        "facetAddresses", 
        "Loupe" 
        );
    
    const facets = await InteractWithContracts( <rwRecord>loupe );
    
    for ( const item of records) {
        try {
            const tag = smart.find( (el) => el.contract == item.name ); 
            if (tag != undefined) {

                // Read the beacon_<SC Name> function for each Smart Contract Facet of the Diamond
                var beacon : string = "None";

                if (item.get) {
                    const bfunction: rwRecord = await setrwRecordFromSmart( 
                    <string>item.beacon, 
                    tag.tag 
                    );
        
                    const raw1 = await InteractWithContracts( <rwRecord>bfunction, Account.A0, true );            
                    
                    beacon = colorOutput( "[".concat( (raw1 != undefined) ? raw1 : "None", "]"), "green", true);
                    }    
                // Read the get_<SC Name> function for each Smart Contract Facet of the Diamond
                var realAddress : string = NULL_ADDRESS;
                if (item.get) {
                    const gfunction: rwRecord = await setrwRecordFromSmart( 
                        <string>item.get, 
                        tag.tag 
                        );
        
                    const raw2 = await InteractWithContracts( <rwRecord>gfunction, Account.A0, true );            
        
                    realAddress = colorOutput( "[".concat( (raw2 != undefined) ? raw2 : `${NULL_ADDRESS}`, "]"), (facets.includes(raw2)) ? "green" : "red", true);
                    }
                
                // Read the wallet_<SC Name> function for each Smart Contract Facet of the Diamond
                var wallet : string = NULL_ADDRESS;
                if (item.wallet) {
                    const wfunction: rwRecord = await setrwRecordFromSmart( 
                        <string>item.wallet, 
                        tag.tag 
                        );
        
                    const raw3 = await InteractWithContracts( <rwRecord>wfunction, Account.A0, true );            
        
                    wallet = colorOutput( "[".concat( (raw3 != undefined) ? raw3[0] : `${NULL_ADDRESS}`, "]"), (raw3 != undefined) ? "white" : "blue", true);
                    }
    
                colorOutput( "> ".concat( item.name.padEnd(16, " "), " => ", beacon.padEnd(36, " "), realAddress.padEnd(42, " "), wallet ), "yellow");
            }

            }
        catch {
            colorOutput( "> ".concat( item.name.padEnd(16, " "), " => Error " ), "red");
            }
        }
    }

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
    }
    
    