import hre from "hardhat";
import { diamondNames } from "./T2G_Data";
import { Address, InvalidSerializedTransactionTypeError } from "viem";
//import decodeMethod  from "abi-decoder-typescript"
//import { bigint } from "hardhat/internal/core/params/argumentTypes";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithContracts.ts --network localhost

// Expression régulière pour détecter une adresse ETH 
const regex = '^(0x)?[0-9a-fA-F]{40}$';
const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

/// enum type qui permet de définir si une interaction est de type READ ou WRITE
export enum rwType { READ, WRITE }

/// enum type qui permet de sélectionner les 6 premiers @Wallet du node hardhat
export enum Account { A0 = "0_", A1 = "1_", A2 = "2_", A3 = "3_", A4 = "4_", A5 = "5_", A6 = "6_" }
/// enum type qui permet dans le tableau args de définir une liste de valeur plutôt qu'une valeur spécifique
export enum Value { TokenId = "T__", Index = "I__", Account = "A__" }

export const Typeoftoken : string[] = ["None", "Pollen", "Honey", "Nektar", "Cell"]

export const Statusoftoken : string[] =  [ "None", "Draft", "Active", "Burnt", "Canceled"]

/// loopIndex: <null> | [index] | string -> [facultatif] Défini soit un ensemble de valeurs d'index dans le cas d'un appel multiple d'une fonction
///                                         qui a input des valeurs d'index, ou la référence à une valeur dans <storage> pour définir
///                                         un intervalle de valeur [0... Max] pour la liste des index. 
/// loopTokenId: <null> | [TokenId] | string -> [facultatif] Meme règle que loopIndex pour une liste de valeur de TokenId
/// Si l'un ou l'autre attibut est présent, alors dans la valeur args [], un des inputs est définit par Enum(Valeur | Account)
export type rwRecord = { 
    rwType: rwType,
    contract: string, 
    function: string, 
    args?: Array<any>,
    sender?: Account,
    fees?: number | bigint,
    loopTokenId? : number[] | string,   // Permet de gérer une liste d'inputs [...]de type index ou [0...Max] => Max : valeur dans storge
    loopIndex? : number[] | string,     // Permet de gérer une liste d'inputs [...]de type index ou [0...Max] => Max : valeur dans storge
    loopAccount? : Account[] | string,  // Permet de gérer une liste d'inputs [...]de type @Accounts ou valeur @Account stockée dans storge
    label?: string,                     // Affichage alternatif au nom de la fonction dans la console de log pour les résultats des appels
    decode?: string,                    // Flag pour décoder le résultat avec ABI.decode ou pas
    store?: boolean,                    // flag store pour définir si le résultat d'un READ doit être stocké pour être réutilisé par ailleurs
    outcome: string[]                   // flag qui type les résultats retournés par un READ [] : valeurs "array", "string", "bool", "bigint", "address" ou le nom d'une variable Typeoftoken ou StatusOfToken
  }


var storage : object = {};

/// Fonction qui parse un objet rwRecord à la recherche d'un "item" et renvoie une valeur si présent, ou une valeur par défaut defValue sinon
/// Si l'item est trouvé, la fonction renvoyée peut dépendre de l'item, qui peut également utiliser la valeur outcome passée en entrée
/// Renvoie une erreur si détecte la présence de item dans l'objet mais ne trouve pas sa valeur
function parseRwRecordForSpecificItemWithDefaultValue( item: string, rwItem: rwRecord, defValue: any, outcome?: any ) : any {
    if (item in rwItem) {
        const element : any = rwItem[item];
        switch (item) {
            case "sender": {
                if (Object.values(Account).includes(element)) return Number((<string>element).split('_')[0]);
                throw("parseRwRecord::Inconsistant Sender Input: ".concat(<string>element));                
                }
            case "store": return outcome;
            case "loopTokenId": 
            case "loopIndex": {
                if (typeof element === "string" && <string>element in storage) {
                    if (Array.isArray(storage[<string>element]) && storage[<string>element].length == 1)  {
                        if (typeof storage[<string>element][0] === "bigint") return [...Array(Number(storage[<string>element][0])).keys()];
                        }
                    }
                if (Array.isArray(element)) return element;
                throw("parseRwRecord::Inconsistant loopIndex Input: ".concat(<string>element));                
                }
            case "loopAccount": {
                if (typeof element === "string" && <string>element in storage) {
                    if (String(storage[<string>element]).match(regex)) return [storage[<string>element]];
                    }
                if (Array.isArray(element)) return element;
                throw("parseRwRecord::Inconsistant loopAccount Input: ".concat(<string>element));                
                }
            case "decode": {
                if (typeof element == "string") {
                    const codedstring = outcome.split(element);
                    return atob(codedstring[1]);
                    }
                } 
            default: throw("parseRwRecord::Inconsistant Input Record : ".concat(item));                
            } 
        }
    return defValue;
}

function parseOutcome( template: Array<any>, result: Array<any>, rwItem: rwRecord) : Array<any> {
    result = Array.isArray(result) ? result : [ result ];

    if (template.length != result.length && template[0] != "array") throw("Inconstant Oucome");

    return result.map((res : any, i : number) => {
        const choice = (template[0] == "array") ? "" : template[i];
        switch (choice) {
            case "Typeoftoken": return Typeoftoken[res];
            case "Statusoftoken": return Statusoftoken[res];
            case "string": return parseRwRecordForSpecificItemWithDefaultValue( "decode", rwItem, res, res);
            case "address": {
                return "@".concat( res.substring(0, 12), "...");
                }
            case "bigint": {
                return res;
                }
            case "bool": {
                return res ? "True" : "False";
                }
            default: {
                return res;
                }
            }   
        });
    }

export async function InteractWithContracts(rwList : rwRecord[]) {
    const accounts = await hre.ethers.getSigners();
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    //const args = process.argv.slice(2);
    //var saisie = prompt('Saisir quelque chose');

    console.log("Enter InteractWithContracts app")

    var facet;
    for (const rwItem of rwList) {

        const sender: number = parseRwRecordForSpecificItemWithDefaultValue( "sender", rwItem, 0);

        facet = await hre.viem.getContractAt(
            rwItem.contract,
            (<Address>diamondNames.Diamond.address),
            { client: { wallet: wallets[sender] } }
            );

            // On gère les liste de Accounts
            const rangeAccount : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopAccount", rwItem, [Account.A0]);

            // On gère les liste des Index si elle existe dans le record
            const rangeIndex : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopIndex", rwItem, [0]);

            // On récupère les liste de TokenId si elle existe dans le record
            const rangeToken : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopTokenId", rwItem, [0]);

            for ( const account of rangeAccount) {
                for ( const token of rangeToken) {
                    for ( const index of rangeIndex) {
                    
                    // On transcrit les arguments s'ils existent : type Account

                    var newArgs = rwItem.args.map((x) => {
                        if (Object.values(Account).includes(x)) {       
                            return accounts[x.split('_')[0]].address;
                        }
                        else if (x === Value.Account) {
                            return accounts[account.split('_')[0]].address;
                        } 
                        else if (x === Value.Index) {
                            return index;
                        } 
                        else if (x === Value.TokenId) {
                            return token;
                        } 
                        return x;
                    });
                    
                    var log : string  = "[R_@".concat( facet.address.substring(0, 6), "..]:", rwItem.contract.padEnd(15, ' '), "::");
                    log = log.concat( "[S_@", accounts[sender].address.substring(0, 6), "..]::");
                    log = log.concat( ("label" in rwItem) ? <string>rwItem.label : rwItem.function );
                    log = log.concat( "[ ", newArgs.map((arg, i) => {
                        if (Object.values(Account).includes(rwItem.args[i]) || rwItem.args[i] === Value.Account) return "@".concat( arg.substring(0, 6), "..")
                        if (rwItem.args[i] === Value.Index) return "Index ".concat( arg )
                        if (rwItem.args[i] === Value.TokenId) return "Id ".concat( arg )
                        return arg;
                        }).join("| ")," ] >> " );

                    try {
                        if (rwItem.rwType == rwType.WRITE) {

                            const method = await facet.write[rwItem.function](newArgs, rwItem.fees ? { 
                                value: BigInt(rwItem.fees)
                                }  : null, wallets[sender] );

                            const eventLogs = await  publicClient.getContractEvents({
                                abi: facet.abi,
                                address: (<Address>diamondNames.Diamond.address),
                                })
                                
                            log = log.concat( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : "[Tx:".concat( method.substring(0, 6), "..]"));

                            for ( const event of eventLogs) {
                                if (event.transactionHash == method) {
                                    log = log.concat( " >> Event ", event.eventName, "[ ", Object.values(event.args).join("| "), " ]" );                
                                    }
                                }
                            } 
                        else if (rwItem.rwType == rwType.READ) {
                            var result : any = await facet.read[rwItem.function]( newArgs, wallets[sender] );

                            var beacon : any = Array.isArray(result) ? result : [ result ];

                            storage[rwItem.function] = parseRwRecordForSpecificItemWithDefaultValue( "store", rwItem, [],  beacon);

                            beacon = parseOutcome( rwItem.outcome, result, rwItem);

                            if (Array.isArray(beacon)) log = log.concat( "[ ", beacon.join("| ")," ]" );
                            else log = log.concat( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "| " ) : <string>beacon)
                            }
                            console.info(log);
                        } catch (error) {
                            //console.log(Object.entries(error));
                            log = log.concat( "[@", error.contractAddress.substring(0, 12), "...]:", error.functionName, "::");
                            log = log.concat( "[", error.args.join("|"),"] >> " );
                            log = log.concat( <string>error.metaMessages, "\n");
                            console.error(log); 
                        }  
                    }
                }          
            }    
        }
    }

