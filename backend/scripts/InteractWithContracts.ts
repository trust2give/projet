import hre from "hardhat";
import { Address } from "viem";
import fs from 'fs';
import { diamondNames } from "./T2G_Data";
import { colorOutput, 
         parseAndConvertInputArgs, 
         parseAndDisplayInputArgs, 
         displayAddress, displayContract, 
         parseOutcome, 
         parseRwRecordForSpecificItemWithDefaultValue, 
         storage, NULL_ADDRESS, Account,
         contractRecord,
         diamondCore, regex, regex2 } from "./T2G_utils";
import { Currency } from "../recycle/web3-wrap";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithContracts.ts --network localhost

/// enum type qui permet de définir si une interaction est de type READ ou WRITE
export enum rwType { READ, WRITE }


/// loopIndex: <null> | [index] | string -> [facultatif] Défini soit un ensemble de valeurs d'index dans le cas d'un appel multiple d'une fonction
///                                         qui a input des valeurs d'index, ou la référence à une valeur dans <storage> pour définir
///                                         un intervalle de valeur [0... Max] pour la liste des index. 
/// loopTokenId: <null> | [TokenId] | string -> [facultatif] Meme règle que loopIndex pour une liste de valeur de TokenId
/// Si l'un ou l'autre attibut est présent, alors dans la valeur args [], un des inputs est définit par Enum(Valeur | Account)
export type rwRecord = { 
    rwType: rwType,
    contract: string, 
    function: string, 
    args: Array<any>,
    sender?: Account,
    fees?: number | bigint,
    loopAddress? : Address[] | string,  // Permet de gérer une liste d'inputs [...]de type Address ou valeur @ stockée dans storage
    loopTokenId? : number[] | string,   // Permet de gérer une liste d'inputs [...]de type index ou [0...Max] => Max : valeur dans storge
    loopIndex? : number[] | string,     // Permet de gérer une liste d'inputs [...]de type index ou [0...Max] => Max : valeur dans storge
    loopAccount? : Account[] | string,  // Permet de gérer une liste d'inputs [...]de type @Accounts ou valeur @Account stockée dans storge
    label?: string,                     // Affichage alternatif au nom de la fonction dans la console de log pour les résultats des appels
    decode?: string,                    // Flag pour décoder le résultat avec ABI.decode ou pas
    store?: boolean,                    // flag store pour définir si le résultat d'un READ doit être stocké pour être réutilisé par ailleurs
    outcome: string[]                   // flag qui type les résultats retournés par un READ [] : valeurs "array", "string", "bool", "bigint", "address" ou le nom d'une variable Typeoftoken ou StatusOfToken
  }

export interface errorFrame {
    cause : string,
    details : string,
    docsPath: string,
    metaMessages: string,
    shortMessage: string,
    version: string,
    name: string,
    abi: string,
    args: string,
    contractAddress: string,
    formattedArgs: string,
    functionName: string,
    sender: string
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
    
export async function InteractWithContracts(rwItem : rwRecord, accountList: Address[], rootAddress: Address ) {
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    console.log("Enter InteractWithContracts app")

        const sender: number = parseRwRecordForSpecificItemWithDefaultValue( "sender", rwItem, 0);

        const facet = await hre.viem.getContractAt(
            rwItem.contract,
            rootAddress,
            { client: { wallet: wallets[sender] } }
            );

            // On gère les liste de addresses
            const rangeAddress : Address[] = parseRwRecordForSpecificItemWithDefaultValue( "loopAddress", rwItem, [NULL_ADDRESS]);

            // On gère les liste de Accounts
            const rangeAccount : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopAccount", rwItem, [Account.A0]);

            // On gère les liste des Index si elle existe dans le record
            const rangeIndex : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopIndex", rwItem, [0]);

            // On récupère les liste de TokenId si elle existe dans le record
            const rangeToken : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopTokenId", rwItem, [0]);

            for ( const account of rangeAccount) {
                for ( const token of rangeToken) {
                    for ( const index of rangeIndex) {                    
                        for ( const addr of rangeAddress) {
                            
                            // On transcrit les arguments s'ils existent : type Account
                            const newArgs = parseAndConvertInputArgs( rwItem, accountList, account, index, token, addr );
                            // On format les valeurs pour affichage en stdout                                        
                            const dispArgs = parseAndDisplayInputArgs( rwItem, newArgs )
        
                            var log : string  = displayAddress( facet.address, "yellow", 10 );
                            log = log.concat( ":", displayContract(rwItem.contract, "cyan", 15), "::" );
                            log = log.concat( displayAddress( accountList[sender], "magenta", 10 ));
                            log = log.concat( ":: ", ("label" in rwItem) ? <string>rwItem.label : rwItem.function );
                            log = log.concat( "[ ", colorOutput(dispArgs, "blue", true)," ] >> " );
        
                            try {
                                if (rwItem.rwType == rwType.WRITE) {
                                    //console.log(newArgs);
                                    const method = await facet.write[rwItem.function](newArgs, rwItem.fees ? { 
                                        value: BigInt(rwItem.fees)
                                        }  : null, wallets[sender] );

                                    const eventLogs = await publicClient.getContractEvents({
                                        abi: facet.abi,
                                        address: rootAddress,
                                        })
                                        
                                    log = log.concat( colorOutput( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : "[Tx:".concat( method.substring(0, 6), "..]"), "green", true ));

                                    for ( const event of eventLogs) {
                                        if (event.transactionHash == method) {
                                            log = log.concat( colorOutput( "\n >> Event ".concat( event.eventName, "[ ", Object.values(event.args).join("| "), " ]"), "yellow", true ));                
                                            }
                                        }
                                    } 
                                else if (rwItem.rwType == rwType.READ) {
                                    //console.log("Read")
                                    var result : any = await facet.read[rwItem.function]( newArgs, wallets[sender] );

                                    var beacon : any = Array.isArray(result) ? result : [ result ];
                                    //console.log(beacon)

                                    storage[rwItem.function] = parseRwRecordForSpecificItemWithDefaultValue( "store", rwItem, [],  beacon);
                                    //console.log(storage[rwItem.function])

                                    beacon = parseOutcome( rwItem.outcome, result, rwItem);
                                    //console.log("Out", beacon)
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
                        }   
                    }          
                }    
    }

