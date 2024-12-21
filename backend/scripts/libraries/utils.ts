import { Address, stringify } from "viem";
import { FacetCutAction } from "../utils/diamond";
import { listOfEnums, typeItem, typeRouteOutput } from "../interface/types";
import { displayAddress } from "./format";
import { Account, NULL_ADDRESS, regex, regex2, regex3 } from "./types";
import { accountType, accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "../logic/states";

export var storage : object = {};

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

export function parseAndDisplayInputAndOutputs( pointer : Array<any>, values : Array<any>, pad: number | false  ) : string {
    //console.log( pointer, values, pad );
    const dispArgs : string = values.map((arg, i) => {
            return convertType( pointer, i, arg, typeRouteOutput, pointer[i].name, pad );
    }).join(" | ");
    return dispArgs;
    }

export function convertType( root: Array<any>, index: number, answer: any, router: typeItem[], name: string, output: number | false ) : any {
    //console.log( output, answer, typeof answer)
    if ((<number>output > 0) && (typeof answer == "string")) 
        if ((<string>answer).match('^(0x)?[0-9a-fA-F]{40}$')) return displayAddress( <Address>answer, "green", accountRefs, <number>output);
    //console.log( router, root, index)
    const branch : typeItem[] = router.filter( (item) => (item.name == root[index].type));
    const convert = (answer: any) : Address | undefined => {
        type refKeys = keyof typeof accountRefs;
        if (Object.keys(accountRefs).includes(answer)) {
            const account =  (<{name: string, address: Address, wallet?: Address }>accountRefs)[<refKeys>answer]
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