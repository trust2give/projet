import { Address, InvalidSerializedTransactionTypeError } from "viem";
import { rwType, rwRecord } from "./InteractWithContracts";

export const Typeoftoken : string[] = ["None", "Pollen", "Honey", "Nektar", "Cell"]

export const Statusoftoken : string[] =  [ "None", "Draft", "Active", "Burnt", "Canceled"]

export const TypeofUnit : string[] = ["None", "GWEI", "EURO", "DOLLAR", "SWISSFRANC", "STERLINGPOUND", "YEN", "YUAN", "USDC", "USDT", "EURC", "SUI"]

/// enum type qui permet de sélectionner les 6 premiers @Wallet du node hardhat
export enum Account { A0 = "@0", A1 = "@1", A2 = "@2", A3 = "@3", A4 = "@4", A5 = "@5", A6 = "@6", A7 = "@7", A8 = "@8", A9 = "@9" }

/// enum type qui permet dans le tableau args de définir une liste de valeur plutôt qu'une valeur spécifique
export enum Value { TokenId = "[[TokenId]]", Index = "[[Index]]", Account = "[[Account]]", Address = "[[Address]]", Number = "[[Number]]", Flag = "[[Flag]]", Hash = "[[Hash]]", Enum = "[[Enum]]", Text = "[[Text]]" }

export var storage : object = {};

// Expression régulière pour détecter une adresse ETH 
export const regex = '^(0x)?[0-9a-fA-F]{40}$';
export const regex2 = '^(0x)?[0-9a-fA-F]{64}$';
export const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

export function parseAndConvertInputArgs( rwItem : rwRecord, accounts: Address[], account: number, index: number, token: number, addr: Address) : Array<any> {
    const tab: Array<any> = rwItem.args.map((x) => {
        if (Object.values(Account).includes(x)) return accounts[x.substring(1)];
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

export function parseAndDisplayInputArgs( rwItem : rwRecord, newArgs : Array<any>) : string {
    const dispArgs : string = newArgs.map((arg, i) => {
        if (Object.values(Account).includes(rwItem.args[i]) || rwItem.args[i] === Value.Account) return "@".concat( arg.substring(0, 6), "..")
        if (rwItem.args[i] === Value.Index) return "Index ".concat( arg )
        if (rwItem.args[i] === Value.TokenId) return "Id ".concat( arg )
        if (rwItem.args[i] === Value.Address) return "@".concat( arg.substring(0, 6), "..")
        return arg;
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
    
export function parseOutcome( template: Array<any>, result: Array<any>, rwItem: rwRecord) : Array<any> {
    result = Array.isArray(result) ? result : [ result ];

    if (template.length != result.length && template[0] != "array") throw("Inconstant Oucome");

    return result.map((res : any, i : number) => {
        if (template[0] == "array") {
            if (Array.isArray(res)) return "[ ".concat( Object.values(res).join("| "), "]");
            if (typeof res === "object") return "[ ".concat( Object.values(res).join("| "), "]");
            return res;
            }
        switch (template[i]) {
            case "Typeoftoken": return Typeoftoken[res];
            case "Statusoftoken": return Statusoftoken[res];
            case "TypeOfUnit": return TypeofUnit[res];
            case "string": return parseRwRecordForSpecificItemWithDefaultValue( "decode", rwItem, res, res);
            case "address": {
                return "@".concat( res.substring(0, 12), "...");
                }
            case "number":
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