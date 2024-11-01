import hre from "hardhat";
import { Address } from "viem";
import fs from 'fs';
import { diamondNames, contractSet } from "./T2G_Data";
import { colorOutput, parseAndConvertInputArgs, parseAndDisplayInputAndOutputs, 
         displayAddress, displayContract, 
         parseRwRecordForSpecificItemWithDefaultValue, 
         storage, NULL_ADDRESS, Account, contractRecord, senderValue,
         diamondCore, regex, regex2, displayResults, rwRecord, rwType, errorFrame, menuRecord } from "./T2G_utils";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithContracts.ts --network localhost

export interface facetRecord { 
    diamond: Address, 
    facets: Object
    }

export function readLastContractSetJSONfile() : contractRecord[] {
    const jsonString = fs.readFileSync('./scripts/ContractSet.json', 'utf-8');
    const Items : contractRecord[] = JSON.parse(jsonString);
    const item : contractRecord = <contractRecord>Items.pop();
    if (item.name != "EUR") throw("Bad Record Name for EUR StableCoin Address recovery :: ".concat(item.name));
    //colorOutput("Recall Last EUR Smart Contract Record >> ".concat(JSON.stringify(item)), "cyan");
    contractSet[0] = <contractRecord>item;
    return contractSet;
    }

export function writeLastContractJSONfile( ) {
    const jsonString = fs.readFileSync('./scripts/ContractSet.json', 'utf-8');
    const Items : contractRecord[] = JSON.parse(jsonString);
    Items.push(contractSet[0]);
    
    let JsonFile = JSON.stringify(Items);
    //colorOutput("Save last EUR Contract Record >> ".concat(JSON.stringify(contractSet[0])), "cyan");
    fs.writeFile('./scripts/ContractSet.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }

export async function readLastFacetJSONfile( facetName: string, diamond: Address ) : Promise<Address> {
    const jsonString = fs.readFileSync('./scripts/T2G_Facets.json', 'utf-8');
    const FacetArray : facetRecord[] = JSON.parse(jsonString);
    const FacetList : facetRecord = <facetRecord>FacetArray.find( (facet) => ((facet.diamond == diamond) && (facetName in facet.facets) ));
    if (FacetList == undefined) throw("Bad Record Name for Facet Address recovery :: ".concat(facetName));
    return FacetList.facets[facetName];
    }

export function writeLastFacetJSONfile( facets: Object[], diamond: Address ) {
    console.log( facets, diamond )
    const jsonString = fs.readFileSync('./scripts/T2G_Facets.json', 'utf-8');
    const FacetArray : facetRecord[] = JSON.parse(jsonString);
    var DiamondRecord : facetRecord = <facetRecord>FacetArray.find( (facet) => (facet.diamond == diamond));
    if (DiamondRecord == undefined) DiamondRecord = { diamond: diamond, facets: {}};

    console.log( DiamondRecord )

    for ( const facet of Object.keys(facets)) {
        DiamondRecord.facets[facet] = facets[facet];
        }

    console.log( DiamondRecord )

    FacetArray.push(DiamondRecord);
     
    let JsonFile = JSON.stringify(FacetArray);
    fs.writeFile('./scripts/T2G_Facets.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }
    
export async function readLastDiamondJSONfile() : Promise<diamondCore> {
    const jsonString = fs.readFileSync('./scripts/T2G_Root.json', 'utf-8');
    const DiamondCoreArray : diamondCore[] = JSON.parse(jsonString);
    const DiamondCore : diamondCore = <diamondCore>DiamondCoreArray.pop();
    if (DiamondCore.Diamond.name != "T2G_root") throw("Bad Record Name for T2G_Root Address recovery :: ".concat(DiamondCore.Diamond.name));
    //colorOutput("Recall Last Diamond Core Record >> ".concat(JSON.stringify(DiamondCore)), "cyan");
    diamondNames.Diamond = <contractRecord>DiamondCore.Diamond;
    diamondNames.DiamondInit = <contractRecord>DiamondCore.DiamondInit;
    diamondNames.DiamondCutFacet = <contractRecord>DiamondCore.DiamondCutFacet;
    diamondNames.DiamondLoupeFacet = <contractRecord>DiamondCore.DiamondLoupeFacet;
    return diamondNames;
    }

/*    export function readLastDiamondJSONfile() : contractRecord {
        const jsonString = fs.readFileSync('./scripts/T2G_Root.json', 'utf-8');
        const Items : contractRecord[] = JSON.parse(jsonString);
        const item : contractRecord = <contractRecord>Items.pop();
        if (item.name != "T2G_Root") throw("Bad Record Name for T2G_Root Address recovery :: ".concat(item.name));
        colorOutput("Recall Last Diamonf Root Record >> ".concat(JSON.stringify(item)), "cyan");
        diamondNames.Diamond = item;
        return item;
        }*/
    
export async function InteractWithContracts(rwItem : rwRecord, from: Account, accountList: Address[], facets: menuRecord[] ) {
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    console.log("Enter InteractWithContracts app")

    const sender: number = senderValue( from );

    // const facet = await hre.viem.getContractAt( rwItem.contract, rootAddress, { client: { wallet: wallets[sender] } } );
    // const scEur = await hre.viem.getContractAt( contractSet[0].name, accountList[11], { client: { wallet: wallets[sender] } } );

    // On transcrit les arguments s'ils existent : type Account
    const newArgs = rwItem.values;
    // On format les valeurs pour affichage en stdout                                        
    const dispArgs = parseAndDisplayInputAndOutputs( rwItem.args, newArgs );

    var log : string  = displayAddress( facets[0].instance.address, "yellow", 10 );
    log = log.concat( ":", displayContract(rwItem.contract, "cyan", 15), "::" );
    log = log.concat( displayAddress( accountList[sender], "magenta", 10 ));
    log = log.concat( ":: ", ("label" in rwItem) ? <string>rwItem.label : rwItem.function );
    log = log.concat( "[ ", colorOutput(dispArgs, "blue", true)," ] >> " );

    try {
        if (rwItem.rwType == rwType.WRITE) {

            const gas = await publicClient.estimateContractGas({ address: facets[0].instance.address, abi: facets[0].instance.abi, functionName: rwItem.function, args: newArgs });

            colorOutput(`Estimated Gas :: ${gas}`, "blue");

            const method = await facets[0].instance.write[rwItem.function](newArgs, wallets[sender] );

            const eventFacetLogs = await publicClient.getContractEvents({ abi: facets[0].instance.abi, address: facets[0].instance.address, })
            const eventSCLogs = await publicClient.getContractEvents({ abi: facets[1].instance.abi, address: facets[1].instance.address, })
            
            log = log.concat( colorOutput( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : "[Tx:".concat( method.substring(0, 6), "..]"), "green", true ));

            for ( const event of eventFacetLogs) {
                if (event.transactionHash == method) {
                    const EvtInputs = facets[0].instance.abi.filter((item) => item.type == "event" && item.name == event.eventName)[0].inputs; //.map((item) => item.inputs);
                    const dispEvents = parseAndDisplayInputAndOutputs( EvtInputs, Object.values(event.args) );
                    log = log.concat( colorOutput( "\n >> Event ".concat( event.eventName, dispEvents, " "), "yellow", true ));                
                    }
                }

            for ( const event of eventSCLogs) {
                const EvtInputs = facets[1].instance.abi.filter((item) => item.type == "event" && item.name == event.eventName)[0].inputs; //.map((item) => item.inputs);
                const dispEvents = parseAndDisplayInputAndOutputs( EvtInputs, Object.values(event.args) );
                log = log.concat( colorOutput( "\n >> Event ".concat( event.eventName, dispEvents, " "), "yellow", true ));                
            }
            } 
        else if (rwItem.rwType == rwType.READ) {
            var result : any = await facets[0].instance.read[rwItem.function]( newArgs, wallets[sender] );

            const beacon = parseAndDisplayInputAndOutputs( rwItem.outcome, Array.isArray(result) ? result : [ result ] );

            if (Array.isArray(beacon)) log = log.concat( "\n[ ", colorOutput( beacon.join("|\n"), "green", true )," ]" );
            else log = log.concat( colorOutput( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "|\n" ) : <string>beacon, "green", true) );
            }
        colorOutput(log);
    } catch (error) {
        const errorLabel : Array<any> = Object.entries(<errorFrame>error);
        const errorDisplay : string = errorLabel.reduce( (last, item) => {
            switch (item[0]) {
                case "metaMessages": {
                    return last.concat( colorOutput(item[1][0], "red", true), " " );
                    }
                case "args": {
                    return last.concat( colorOutput( item[1].reduce( ( acc, cur) => {
                        if (typeof cur == "string") {
                            if (cur.match(regex)) return acc.concat( displayAddress( cur, "yellow", 10 ), " " );
                            if (cur.match(regex2)) return acc.concat( displayAddress( cur, "cyan", 10 ), " " );
                            }
                        else if (typeof cur == "bigint") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
                        else if (typeof cur == "boolean") return acc.concat( colorOutput( (cur) ? "True" : "False", "cyan", true ), " " );
                        else if (typeof cur == "number") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
                        return acc.concat( colorOutput( cur, "cyan", true ), " " );
                        }, "[ " ), "blue", true), " ]" );
                    }
                case "contractAddress": {
                    return last.concat( colorOutput( displayAddress( item[1], "yellow", 10 ), "yellow", true) );
                    }
                case "functionName": {
                    return last.concat( "[", colorOutput( item[1], "magenta", true), "] " );
                    }
                default:
                    return last;
                }
            }, colorOutput( ">> " , "red", true) );
        console.log(errorDisplay);
        }    
    }

