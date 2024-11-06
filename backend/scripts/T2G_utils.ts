import { Address, stringify } from "viem";
import { FacetCutAction } from "./utils/diamond";
import { listOfEnums } from "./T2G_Types";


/// enum type qui permet de sélectionner les 6 premiers @Wallet du node hardhat
/// A0 à A9 : correspond aux vallets du hardhat testnet de 0 à 9
/// AA : correspond à l'adresse du Smart Contract T2G_Root
/// AE : correspond à l'adresse du Smart Contract StableCoin EUR
/// AF : correspond à l'adresse du Smart Contract PoolFacet
/// AH : correspond à l'adresse du Smart Contract HoneyFacet
/// AN : correspond à l'adresse du Smart Contract NektarFacet
/// AP : correspond à l'adresse du Smart Contract PollenFacet

export enum Account { 
    A0 = "@0", 
    A1 = "@1", 
    A2 = "@2", 
    A3 = "@3", 
    A4 = "@4", 
    A5 = "@5", 
    A6 = "@6", 
    A7 = "@7", 
    A8 = "@8", 
    A9 = "@9", 
    AA = "@A", 
    AB = "@B", 
    AC = "@C", 
    AD = "@D", 
    AE = "@E", 
    AF = "@F", 
    AG = "@G", 
    AH = "@H", 
    AI = "@I", 
    AN = "@N", 
    AP = "@P" 
    }


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
export const regex3 = '^(0x)?[0-9a-fA-F]{8}$';
export const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

export const accountIndex = ( label: Account ) : number => {
    if (label == undefined) return 0;
    return  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(label.substring(1));
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

export function parseAndDisplayInputAndOutputs( pointer : Array<any>, values : Array<any>, accountRefs : Object, accountList: Address[], pad: number  ) : string {
    const dispArgs : string = values.map((arg, i) => {
        switch (pointer[i].type) {
            case "address": { 
                if (arg.match(regex)) return pointer[i].name.concat( " ", displayAddress( <Address>arg, "green", accountRefs, accountList, pad));
                else return pointer[i].name.concat( " ", "<Wrong @>".concat(arg));
                } 
            case "string": return pointer[i].name.concat( ": ", arg);                  
            case "uint8": { 
                if ( "internalType" in pointer[i]) {
                    const parse = <string>pointer[i].internalType.split(' ');
                    if (parse[0] == "enum") {
                        const parseEnum = parse[1].split('.');
                        const val : string = (parseEnum.length > 1) ? parseEnum[1] : parseEnum[0];
                        if (val in listOfEnums)
                            if (!Number.isNaN(arg) && Number(arg) < listOfEnums[val].length) return pointer[i].name.concat( ": ", listOfEnums[val][arg]);
                        return pointer[i].name.concat( ": ", "<Wrong>".concat(arg));
                    }
                    else if (parse[0] == "uint8") return pointer[i].name.concat( ": ", (!Number.isNaN(arg) && Number(arg) < 2**8) ? arg : "<Wrong>".concat(arg));
                    }
                return arg;
                }                  
            case "uint256": return pointer[i].name.concat( ": ", (!Number.isNaN(arg)) ? arg : "<Wrong>".concat(arg));                 
            case "bool": {
                if (["True", "true", "Vrai", "vrai", "1"].includes(arg)) return "True";
                else if (["False", "false", "Faux", "faux", "0", "-1"].includes(arg)) return "False";
                return pointer[i].name.concat( ": ", "<Wrong>".concat(arg));
                }
            case "tuple[]": {
                return arg.reduce( ( acc, cur) => {
                    return acc.concat(stringify(cur), " |\n");
                    }, "\n[" );
                }                
        default:
            return pointer[i].name.concat( ": ", arg);            
        }   
    }).join("|\n");

    return dispArgs;
    }

// Display an address either as a full format or as an <Account> value
// depends on the value for accountList
// if pad = 0 / undefined / not present => Account format
// if pad > 0 : display the @x format, with the <pad> first characters (22+ = full display)
export function displayAddress( addr : Address, color: string, accountRefs : Object, accountList: Address[] | undefined, pad: number ) : string {
    var label : string;
    var rank : number;
    const item = Object.entries(accountRefs).find((item) => item[1].address.toUpperCase() == addr.toUpperCase())
    if (item != undefined) {
        return colorOutput( "[@".concat(item[1].name, "]"), color, true);
        }
    else return colorOutput( "[@".concat(addr.substring(0, (pad > 2) ? pad : 6 ), "...]"), color, true); 
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

export function displayAccountTable( accountRefs: Object, width: number ) {
    colorOutput( "*".padEnd(width, "*"), "yellow");
    colorOutput( ("*".concat(" ".padStart(9, " "), "List of avaibable wallets @hardhat testnet" ).padEnd(width - 1, " ")).concat("*"), "yellow");

    Object.entries(accountRefs).map( (item, i : number ) => {  
        colorOutput( ("*".concat(" ".padStart(2, " "), `${item[0]}: `.concat(item[1].address), " ", item[1].name ).padEnd(width - 1, " ")).concat("*"), "yellow");
        return item;
        })

    colorOutput( "*".padEnd(width, "*"), "yellow");
    }

export function enumOrValue( args: Array<any>, index: number, answer: string ) : number | undefined {
    if ("internalType" in args[index]) {
        const parse = <string>args[index].internalType.split(' ');
        if (parse[0] == "enum") {
            const parseEnum = parse[1].split('.');
            const val : string = (parseEnum.length > 1) ? parseEnum[1] : parseEnum[0];
            if (!Number.isNaN(answer) && Number(answer) < 2**8) return Number(answer); 
            else {
                type enumKeys = keyof typeof listOfEnums;
                const rank = (<string[]>listOfEnums[<enumKeys>val]).findIndex((item) => item == answer);
                if (rank > -1 ) return Number(rank);
                }
            }
        else if (parse[0] == "uint8") {
            if (!Number.isNaN(answer) && Number(answer) < 2**8)  {
                return Number(answer); 
                }
            } 
        else return undefined;
        }
    else return Number(answer);
    }