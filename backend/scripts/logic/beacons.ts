const hre = require("hardhat");
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";

export const showBeacons = async ( records: contractRecord[]) => {
    const wallets = await hre.viem.getWalletClients();
    const loupe = <menuRecord>smart.find((el: menuRecord ) => el.contract == diamondNames.DiamondLoupeFacet.name);
    const facets = await loupe.instance.read["facetAddresses"]( [], wallets[0] );

    for ( const item of records) {
        try {
            const record = <menuRecord>smart.find((el: menuRecord ) => el.contract == item.name);

            // Read the beacon_<SC Name> function for each Smart Contract Facet of the Diamond
            const raw1 : any = (item.beacon) ? await record.instance.read[<string>item.beacon]( [], wallets[0] ) : undefined;
            const beacon = colorOutput( "[".concat( (raw1 != undefined) ? raw1 : "None", "]"), "green", true);
            // Read the get_<SC Name> function for each Smart Contract Facet of the Diamond
            const raw2 : any = (item.get) ? await record.instance.read[<string>item.get]( [], wallets[0] ) : undefined;
            const present : boolean = facets.includes(raw2);
            const realAddress = colorOutput( "[".concat( (raw2 != undefined) ? raw2 : `${NULL_ADDRESS}`, "]"), (present) ? "green" : "red", true);
            // Read the wallet_<SC Name> function for each Smart Contract Facet of the Diamond
            const raw3 : any = (item.wallet) ? await record.instance.read[<string>item.wallet]( [], wallets[0] ) : undefined;
            const wallet = colorOutput( "[".concat( (raw3 != undefined) ? raw3[0] : `${NULL_ADDRESS}`, "]"), (raw3 != undefined) ? "white" : "blue", true);

            colorOutput( "> ".concat( item.name.padEnd(16, " "), " => ", beacon.padEnd(36, " "), realAddress.padEnd(42, " "), wallet ), "yellow");
            }
        catch {
            colorOutput( "> ".concat( item.name.padEnd(16, " "), " => Error " ), "red");
            }
        }
    }


    