import hre from "hardhat";
import { Address } from "viem";
import fs from 'fs';
import { diamondNames, contractSet } from "./T2G_Data";
import { colorOutput, parseAndDisplayInputAndOutputs, 
         displayAddress, displayContract, NULL_ADDRESS, Account, contractRecord, senderValue,
         diamondCore, regex, regex2, rwRecord, rwType, errorFrame, menuRecord } from "./T2G_utils";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithContracts.ts --network localhost


//{"diamond":"0xb9d9e972100a1dd01cd441774b45b5821e136043","facets":{"T2G_HoneyFacet":"0x6b21b3ae41f818fc91e322b53f8d0773d31ecb75","T2G_NektarFacet":"0xbf2ad38fd09f37f50f723e35dd84eea1c282c5c9","T2G_PollenFacet":"0xd0ec100f1252a53322051a95cf05c32f0c174354","T2G_PoolFacet":"0x20d7b364e8ed1f4260b5b90c41c2dec3c1f6d367","T2G_SyndicFacet":"Object"} }

export interface facetRecord { 
    diamond: Address, 
    facets: Object
    }

export async function readLastContractSetJSONfile() : Promise<contractRecord[]> {
    const jsonString = fs.readFileSync('./scripts/ContractSet.json', 'utf-8');
    const Items : contractRecord[] = JSON.parse(jsonString);
    const item : contractRecord = <contractRecord>Items.pop();
    if (item.name != "EUR") throw("Bad Record Name for EUR StableCoin Address recovery :: ".concat(item.name));
    //colorOutput("Recall Last EUR Smart Contract Record >> ".concat(JSON.stringify(item)), "cyan");
    contractSet[0] = <contractRecord>item;
    return contractSet;
    }

export async function writeLastContractJSONfile( ) {
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
    const FacetList : facetRecord = JSON.parse(jsonString);
    if (FacetList.diamond != diamond) throw("Bad Record Name for Diamond Address recovery :: ".concat(FacetList.diamond));
    if (!(facetName in FacetList.facets)) throw("Bad Record Name for Facet Address recovery :: ".concat(facetName));
    return FacetList.facets[facetName];
    }

export async function writeLastFacetJSONfile( facets: Object, diamond: Address ) {
    const jsonString = fs.readFileSync('./scripts/T2G_Facets.json', 'utf-8');
    const FacetRecord : facetRecord = JSON.parse(jsonString);
    if (FacetRecord.diamond != diamond) throw("Bad Record Name for Diamond Address recovery :: ".concat(FacetRecord.diamond));

    for ( const facet of Object.keys(facets)) {
        FacetRecord.facets[facet] = facets[facet];
        }

    let JsonFile = JSON.stringify(FacetRecord);
    fs.writeFile('./scripts/T2G_Facets.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }

export async function writeLastDiamondJSONfile( ) {
    let JsonFile = JSON.stringify(diamondNames);
    fs.writeFile('./scripts/T2G_Root.json', JsonFile, (err) => {
        if (err) {
            console.log('Error writing file:', err);
        } else {
            console.log('Successfully wrote file');
            }
        });
    }
      
export async function readLastDiamondJSONfile() : Promise<diamondCore> {
    const jsonString = fs.readFileSync('./scripts/T2G_Root.json', 'utf-8');
    const DiamondCore : diamondCore = JSON.parse(jsonString);
    if (DiamondCore.Diamond.name != "T2G_root") throw("Bad Record Name for T2G_Root Address recovery :: ".concat(DiamondCore.Diamond.name));
    diamondNames.Diamond = <contractRecord>DiamondCore.Diamond;
    diamondNames.DiamondInit = <contractRecord>DiamondCore.DiamondInit;
    diamondNames.DiamondCutFacet = <contractRecord>DiamondCore.DiamondCutFacet;
    diamondNames.DiamondLoupeFacet = <contractRecord>DiamondCore.DiamondLoupeFacet;
    return diamondNames;
    }
    
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
            const raw : any = await facets[0].instance.read[rwItem.function]( newArgs, wallets[sender] );
            const result = (rwItem.outcome.length > 1) ? raw : [ raw ];
            const beacon = parseAndDisplayInputAndOutputs( rwItem.outcome, result );

            if (Array.isArray(beacon)) log = log.concat( "\n[ ", colorOutput( beacon.join("|\n"), "green", true )," ]" );
            else log = log.concat( colorOutput( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "|\n" ) : <string>beacon, "green", true) );
            }

        // We display the log
        colorOutput(log);

    } catch (error) {
        console.log(error)
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

