import { Address, stringify } from "viem";
import { FacetCutAction } from "./utils/diamond";
import { listOfEnums, typeItem, typeRouteOutput } from "./T2G_Types";


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

export var storage : object = {};

export type cutRecord = {
    facetAddress: Address,
    action: FacetCutAction,
    functionSelectors: Array<any>
    }

export interface contractRecord { 
    name: string, 
    address: Address,
    beacon: string | boolean,
    get: string | boolean,
    wallet: string | boolean
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
    contract: string | undefined
    args: Object,
    diamond: Account | undefined,
    instance: any,
    events: any,
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

export async function accountIndex( accounts: Object, label: Account, wallet: boolean | undefined ) : Promise<number | undefined> {
    if (label == undefined) return 0;
    const wallets = await hre.viem.getWalletClients();
    if (wallet) {
        if ('wallet' in accounts[label]) {
            const find = wallets.findIndex((item) => {
                return (item.account.address.toUpperCase() == accounts[label].wallet.toUpperCase())
                });            
            return find;
            }
        }
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

export function parseAndDisplayInputAndOutputs( pointer : Array<any>, values : Array<any>, accountRefs : Object, pad: number | false  ) : string {
    //console.log( pointer, values, pad );
    const dispArgs : string = values.map((arg, i) => {
            return convertType( pointer, i, arg, typeRouteOutput, accountRefs, pointer[i].name, pad );
    }).join(" | ");
    return dispArgs;
    }

// Display an address either as a full format or as an <Account> value
// depends on the value for accountList
// if pad = 0 / undefined / not present => Account format
// if pad > 0 : display the @x format, with the <pad> first characters (22+ = full display)
export function displayAddress( addr : Address, color: string, accountRefs : Object, pad: number ) : string {
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
        colorOutput( ("*".concat(" ".padStart(2, " "), `${item[0]}: `.concat(item[1].address), " ", item[1].name, " ", item[1].balance  ).padEnd(width - 1, " ")).concat("*"), "yellow");
        return item;
        })
    colorOutput( "*".padEnd(width, "*"), "yellow");
    }

export function convertType( root: Array<any>, index: number, answer: any, router: typeItem[], accounts: Object, name: string, output: number | false ) : any {
    //console.log( output, answer, typeof answer)
    if ((<number>output > 0) && (typeof answer == "string")) 
        if ((<string>answer).match('^(0x)?[0-9a-fA-F]{40}$')) return displayAddress( <Address>answer, "green", accounts, <number>output);
    //console.log( router, root, index)
    const branch : typeItem[] = router.filter( (item) => (item.name == root[index].type));
    const convert = (answer: any) : Address | undefined => {
        type refKeys = keyof typeof accounts;
        if (Object.keys(accounts).includes(answer)) {
            const account =  (<{name: string, address: Address, wallet?: Address }>accounts)[<refKeys>answer]
            switch (account.wallet) {
                case undefined: 
                case NULL_ADDRESS: 
                    return <Address>(account.address);
                default:
                    return <Address>(account.wallet);
                }
            }
        return undefined;
        }
    
    if (branch.length > 0) {
        return branch[0].callback( answer, enumOrValue( root, index, answer ), <Address>convert(answer), name  );
        }
    else return undefined;
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