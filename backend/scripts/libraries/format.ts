import { Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { accountRefs, accountType, setState, addAccount, account, updateAccountBalance, assignAccounts } from "../logic/states";


// Display an address either as a full format or as an <Account> value
// depends on the value for accountList
// if pad = 0 / undefined / not present => Account format
// if pad > 0 : display the @x format, with the <pad> first characters (22+ = full display)
export function displayAddress( addr : Address, color: string, pad: number | boolean) : string {
    const item : accountType = Object.values(accountRefs).find( (item : accountType) => item.address.toUpperCase() == addr.toUpperCase() );
    if (item != undefined && <boolean>pad != false) {
        return colorOutput( "[@".concat(item.name, "]"), color, true);
        }
    else return colorOutput( "[@".concat(addr.substring(0, (!<boolean>pad) ? 42 : (<number>pad > 2) ? <number>pad : 6 ), "...]"), color, true); 
    }

export function displayContract( contract : string, color: string, pad?: number ) : string {
    const label = contract.substring(0, pad ? pad : 20).padEnd( pad ? pad : 20, '.');
    return colorOutput( label, color, true);
    }
    
export function displayAccountTable( width: number ) {
    colorOutput( "*".padEnd(width, "*"), "yellow");
    colorOutput( ("*".concat(" ".padStart(9, " "), "List of avaibable wallets @hardhat testnet" ).padEnd(width - 1, " ")).concat("*"), "yellow");

    Object.entries(accountRefs).map( (item, i : number ) => {  
        colorOutput( ("*".concat(
            " ".padStart(2, " "), 
            (<accountType>item[1]).name.padEnd(16, " "), 
            " ", 
            `${item[0]}: `.concat( displayAddress((<accountType>item[1]).address, "yellow", false) ), 
            " ", 
            ((<accountType>item[1]).wallet) ? `${item[0]}: `.concat( displayAddress(<Address>(<accountType>item[1]).wallet, "cyan", false) ) : "", 
            ).padEnd(width - 1, " ")).concat("*"), "yellow");
        return item;
        })
    colorOutput( "*".padEnd(width, "*"), "yellow");
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
    