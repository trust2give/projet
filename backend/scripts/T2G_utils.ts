import { Address } from "viem";
import { rwRecord } from "./InteractWithContracts";
import { FacetCutAction } from "./utils/diamond";


export const Typeoftoken : string[] = ["None", "Pollen", "Honey", "Nektar", "Cell"]

export const Statusoftoken : string[] =  [ "None", "Draft", "Validated", "Active", "Burnt", "Canceled"]

export const TypeofUnit : string[] = ["None", "GWEI", "EURO", "DOLLAR", "SWISSFRANC", "STERLINGPOUND", "YEN", "YUAN", "USDC", "USDT", "EURC", "SUI"]

export const TypeofSector: string[] = [ "NONE", "TRANSPORT", "AUTOMOTIVE", "AEROSPACE", "SERVICES", "SOFTWARE", "ITINDUSTRY", "HIGHTECH", "LUXURY", "BUILDINGS", "SUPPLYCHAIN", "FOOD", "HEALTHCARE" ]

export const TypeofGainType : string[] = [ "NONE", "REDUCTION", "SEQUESTRATION", "EVIT_PRODUIT", "EVIT_CHAINE", "EVIT_COMPENSATION" ]

export const TypeofGainScope : string[] = [ "NONE", "S1_FIXE", "S1_MOBILE", "S1_PROCESS", "S1_FUGITIVE", "S1_BIOMASSE", "S2_ELECTRICITY", "S2_HEATCOLD", "S3_UPSTREAMNRJ", "S3_RAWPURCHASE", "S3_AMMORTIZATION", "S3_WASTES", "S3_UPSTREAMSUPPLY", "S3_TRAVELS", "S3_UPSTREAMLEASING", "S3_TBD2", "S3_VISITORS", "S3_DOWNSTREAMSUPPLY", "S3_SALES", "S3_ENDOFLIFE", "S3_DOWNSTREAMFRANCHISE", "S3_DOWNSTREAMLEASING", "S3_TBD3", "S3_TBD4" ]

export const TypeofGainSource : string[] = [ "NONE", "PROCESS", "PRODUCT", "SUPPLIER", "PROVIDER", "EQUIPMENT", "CONSUMPTION", "TRANSPORT", "OTHER" ]

export const TypeofsizeUnit : string[] = [ "NONE", "KILO", "TON", "KTON", "MTON" ]

export const TypeofEntityType : string[] = [ "NONE", "PERSON", "ENTITY", "GROUP", "NETWORK" ]

export const TypeofUnitType : string[] = [ "NONE", "ENTREPRISE", "ASSOCIATION", "FONDATION", "PLATEFORME", "COLLECTIVITE", "EPICS", "ETAT" ]

export const TypeofUnitSize : string[] = [ "NONE", "SOLE", "TPE", "PME", "ETI", "GE" ]

export const TypeCountries : string[] = [ "NONE", "FRANCE", "GERMANY", "BELGIUM", "SWITZERLAND", "ITALY", "SPAIN", "PORTUGAL", "GREATBRITAIN", "SCOTTLAND", "IRELAND", "NETHERLAND", "LUXEMBURG", "POLAND", "DENMARK", "SWEDEN", "NORWAY", "ISLAND", "FINLAND", "USA", "BRAZIL", "OTHERS" ]

export const listOfEnums = {
    Typeoftoken,
    Statusoftoken,
    TypeofUnit,
    TypeofSector,
    TypeofGainType,
    TypeofGainScope,
    TypeofGainSource,
    TypeofsizeUnit,
    TypeofEntityType,
    TypeofUnitType,
    TypeofUnitSize,
    TypeCountries
    }

/// enum type qui permet de sélectionner les 6 premiers @Wallet du node hardhat
/// A0 à A9 : correspond aux vallets du hardhat testnet de 0 à 9
/// AA : correspond à l'adresse du Smart Contract T2G_Root
/// AE : correspond à l'adresse du Smart Contract StableCoin EUR
/// AF : correspond à l'adresse du Smart Contract PoolFacet
/// AH : correspond à l'adresse du Smart Contract HoneyFacet
/// AN : correspond à l'adresse du Smart Contract NektarFacet
/// AP : correspond à l'adresse du Smart Contract PollenFacet

export enum Account { A0 = "@0", A1 = "@1", A2 = "@2", A3 = "@3", A4 = "@4", A5 = "@5", A6 = "@6", A7 = "@7", A8 = "@8", A9 = "@9", AA = "@A", AE = "@E", AF = "@F", AH = "@H", AN = "@N", AP = "@P" }

/// enum type qui permet dans le tableau args de définir une liste de valeur plutôt qu'une valeur spécifique
export enum Value { TokenId = "[[TokenId]]", Index = "[[Index]]", Account = "[[Account]]", Address = "[[Address]]", Number = "[[Number]]", Flag = "[[Flag]]", Hash = "[[Hash]]", Enum = "[[Enum]]", Text = "[[Text]]" }

export var storage : object = {};

export type cutRecord = {
    facetAddress: Address,
    action: FacetCutAction,
    functionSelectors: Array<any>
    }

export interface contractRecord { 
    name: string, 
    argInit: boolean,
    addReader: boolean,
    address: Address,
    beacon: string | boolean
    }

export type diamondCore = {
    Diamond: contractRecord,
    DiamondCutFacet: contractRecord,
    DiamondInit: contractRecord,
    DiamondLoupeFacet: contractRecord,
    }

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
    values: Array<any>,
    outcome: Array<any>
}

export type menuRecord = {
    tag: string,
    args: Object,
    diamond: Account | undefined,
    instance: any,
    events: any,
    contract: string | undefined
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

// Expression régulière pour détecter une adresse ETH 
export const regex = '^(0x)?[0-9a-fA-F]{40}$';
export const regex2 = '^(0x)?[0-9a-fA-F]{64}$';
export const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

export const senderValue = (x: Account | undefined) : number => {
    if (Object.values(Account).includes(x)) {
        if (x == Account.AA) return 10;
        else if (x == Account.AE) return 11;
        else if (x == Account.AF) return 12;
        else if (x == Account.AH) return 13;
        else if (x == Account.AN) return 14;
        else if (x == Account.AP) return 15;
        else return Number(x.substring(1));
        }
    else return 0;
    };

/// get the args attibute in rwRecord object, parses it and convert the enum values into real values to be passed to the target function as inputs
export function parseAndConvertInputArgs( rwItem : rwRecord, accounts: Address[], account: number, index: number, token: number, addr: Address) : Array<any> {
    const tab: Array<any> = rwItem.args.map((x) => {
        if (Object.values(Account).includes(x)) {
            if (<Account>x == Account.AA) return accounts[10];
            else if (<Account>x == Account.AE) return accounts[11];
            else if (<Account>x == Account.AF) return accounts[12];
            else if (<Account>x == Account.AH) return accounts[13];
            else if (<Account>x == Account.AN) return accounts[14];
            else if (<Account>x == Account.AP) return accounts[15];
            else return accounts[x.substring(1)];
            }
        else if (x === Value.Account) return accounts[account];
        else if (x === Value.Index) return index;
        else if (x === Value.TokenId) return token;
        else if (x === Value.Address) return addr;
        return x;
    });
    return tab;
}

export function showObject( data: any, eol: boolean = false ) {
    var label: string = "";
    if (data == null) return "Object::Null";
    for (const [key, value] of Object.entries(data)) {
        const t = typeof value;
        const ret = eol ? `\n` : "";
        switch (t) {
            case "number":
            case "string":
            case "bigint": label += `${key} ${t.slice(0,1)}: ${value} ${ret}`; break;
            case "boolean": label += `${key} : ${value ? "TRUE" : "FALSE" } ${ret}`; break;
            case "object":
                if (Array.isArray(value)) {
                    const tab = value.reduce((accumulator, currentValue) => { 
                        return `${accumulator} ${typeof(currentValue) === "object" ? showObject(currentValue, false) : currentValue} |` }, "|") 
                    label += `${key}[Arr] : ${tab} ${ret}`;
                    }
                else label += showObject( value );
                break;
            default:
            }
        }
    return label;
    }

export function parseAndDisplayInputAndOutputs( pointer : Array<any>, values : Array<any> ) : string {
const dispArgs : string = values.map((arg, i) => {
    switch (pointer[i].type) {
        case "address": { 
            if (arg.match(regex)) return pointer[i].name.concat( ": ", "@".concat( arg.substring(0, 10), ".."));
            else return pointer[i].name.concat( ": ", "<Wrong @>".concat(arg));
            } 
        case "string": return pointer[i].name.concat( ": ", arg);                  
        case "uint8": { 
            const parse = <string>pointer[i].internalType.split(' ');
            if (parse[0] == "enum") {
                const parseEnum = parse[1].split('.');
                const val : string = (parseEnum.length > 1) ? parseEnum[1] : parseEnum[0];
                if (val in listOfEnums)
                    if (!Number.isNaN(arg) && Number(arg) < listOfEnums[val].length) return pointer[i].name.concat( ": ", listOfEnums[val][arg]);
                return pointer[i].name.concat( ": ", "<Wrong>".concat(arg));
                }
            else if (parse[0] == "uint8") return pointer[i].name.concat( ": ", (!Number.isNaN(arg) && Number(arg) < 2**8) ? arg : "<Wrong>".concat(arg));
            return arg;
            }                  
        case "uint256": return pointer[i].name.concat( ": ", (!Number.isNaN(arg)) ? arg : "<Wrong>".concat(arg));                 
        case "bool": {
            if (["True", "true", "Vrai", "vrai", "1"].includes(arg)) return "True";
            else if (["False", "false", "Faux", "faux", "0", "-1"].includes(arg)) return "False";
            return pointer[i].name.concat( ": ", "<Wrong>".concat(arg));
            }
        default:
            return pointer[i].name.concat( ": ", arg);            
        }   
    }).join("| ");

    return dispArgs;
    }

export function displayAddress( addr : Address, color: string, pad?: number ) : string {
    return colorOutput( "[@".concat(addr.substring(0, pad ? pad : 6), "...]"), color, true);
    }

export function displayContract( contract : string, color: string, pad?: number ) : string {
    const label = contract.substring(0, pad ? pad : 20).padEnd( pad ? pad : 20, '.');
    return colorOutput( label, color, true);
    }

export function displayResults( start: string, results: Array<any> ) : string {
    return start.concat( results.reduce( ( acc, cur) => {
        if (typeof cur == "string") {
            if (cur.match(regex)) return acc.concat( displayAddress( cur, "yellow", 10 ), " " );
            if (cur.match(regex2)) return acc.concat( displayAddress( cur, "cyan", 10 ), " " );
            }
        else if (typeof cur == "bigint") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
        else if (typeof cur == "boolean") return acc.concat( colorOutput( (cur) ? "True" : "False", "cyan", true ), " " );
        else if (typeof cur == "number") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
        return acc.concat( colorOutput( cur, "cyan", true ), " " );
        }, "[ " ), " ]" );
    }

/// Fonction qui parse un objet rwRecord à la recherche d'un "item" et renvoie une valeur si présent, ou une valeur par défaut defValue sinon
/// Si l'item est trouvé, la fonction renvoyée peut dépendre de l'item, qui peut également utiliser la valeur outcome passée en entrée
/// Renvoie une erreur si détecte la présence de item dans l'objet mais ne trouve pas sa valeur
export function parseRwRecordForSpecificItemWithDefaultValue( item: string, rwItem: rwRecord, defValue: any, outcome?: any ) : any {
    if (item in rwItem) {
        const element : any = rwItem[item];
        switch (item) {
            case "sender": {
                if (Object.values(Account).includes(element)) return Number((<string>element).substring(1));
                throw("parseRwRecord::Inconsistant Sender Input: ".concat(<string>element));                
                }
            case "store": return outcome;
            case "loopAddress": {
                if (typeof element === "string" && <string>element in storage) {
                    if (Array.isArray(storage[<string>element]) && storage[<string>element].length > 0)  {
                        return storage[<string>element];
                        }
                    }
                if (Array.isArray(element)) return element;
                throw("parseRwRecord::Inconsistant loopAddress Input: ".concat(<string>element));                
                }
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

export function colorOutput( text: string, color?: string, hide?: boolean ) : string {
    var output ="";
    switch (color) {
        case "yellow": {
            output = '\x1b[33m '.concat( text, ' \x1b[0m');
            break;
            }
        case "blue": {
            output = '\x1b[34m '.concat( text, ' \x1b[0m');
            break;
            }
        case "green": {
            output = '\x1b[32m '.concat( text, ' \x1b[0m');
            break;
            }
        case "red": {
            output = '\x1b[31m '.concat( text, ' \x1b[0m');
            break;
            }
        case "cyan": {
            output = '\x1b[36m '.concat( text, ' \x1b[0m');
            break;
            }
        case "magenta": {
            output = '\x1b[35m '.concat( text, ' \x1b[0m');
            break;
            }    
        case "white": {
            output = '\x1b[37m '.concat( text, ' \x1b[0m');
            break;
            }
        default: {
            output = text;
            }
        }
    if (!hide) console.log(output);
    return output;
    }

export function displayAccountTable( accountList: Address[] ) {
    colorOutput( "*".padEnd(60, "*"), "yellow");
    colorOutput( ("*".concat(" ".padStart(9, " "), "List of avaibable wallets @hardhat testnet" ).padEnd(59, " ")).concat("*"), "yellow");

    accountList.map( (add: Address, i : number ) => {    
        if (i == 0) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["A0"]}: `.concat(add), " T2G Owner" ).padEnd(59, " ")).concat("*"), "cyan");
        if (i > 0 && i < 10) {
            colorOutput( ("*".concat(" ".padStart(2, " "), `${Account[<string>("A".concat(i))]}: `.concat(add), " Wallet" ).padEnd(59, " ")).concat("*"), "yellow");
            }
        if (i == 10) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AA"]}: `.concat(add), " T2G Root" ).padEnd(59, " ")).concat("*"), "cyan");
        if (i == 11) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AE"]}: `.concat(add), " EUR SC" ).padEnd(59, " ")).concat("*"), "cyan");
        if (i == 12) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AF"]}: `.concat(add), " PoolSC" ).padEnd(59, " ")).concat("*"), "cyan");
        if (i == 13) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AH"]}: `.concat(add), " HoneySC" ).padEnd(59, " ")).concat("*"), "cyan");
        if (i == 14) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AN"]}: `.concat(add), " NektarSC" ).padEnd(59, " ")).concat("*"), "cyan");
        if (i == 15) colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AP"]}: `.concat(add), " PollenSC" ).padEnd(59, " ")).concat("*"), "cyan");
        return <Address>add;
        })

    colorOutput( ("*".concat(" ".padStart(2, " "), "@0, @A & @AE : T2G dApp set, Other @x ready for testings" ).padEnd(59, " ")).concat("*"), "yellow");
    colorOutput( "*".padEnd(60, "*"), "yellow");
}