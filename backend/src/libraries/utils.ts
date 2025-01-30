import { Address, stringify } from "viem";
import { FacetCutAction } from "../utils/diamond";
import { listOfEnums, typeItem } from "../interface/types";
import { Account, NULL_ADDRESS, regex, regex2, regex3 } from "./types";
import { accountType, accountRefs, accountList, globalState, setState, clientFormat, assignAccounts } from "../logic/states";

export var storage : object = {};


export async function accountIndex( accounts: accountList, label?: Account, wallet?: boolean | undefined ) : Promise<number | undefined> {
    if (label == undefined) return 0;
    if (wallet) {
        if ('wallet' in accounts[label]) {
            const find = (<clientFormat[]>globalState.wallets).findIndex((item: any) => {
                return (item.account.address.toUpperCase() == (<Address>accounts[label].wallet).toUpperCase())
                });            
            return find;
            }
        }
    return  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(label.substring(1));
    }

// convertType function that transform inputs or outcomes of a smart contract function in readable result
// root => represents the 
// index => 
// answer =>
// router =>
// name =>
// output => represent the length of characters to apply on a string if not false or 0

export function convertType( 
    root: Array<any>, 
    index: number, 
    answer: any, 
    router: typeItem[], 
    name: string, 
    ) : any {
    
    if (typeof answer == "string")
        if ((<string>answer).match(regex)) 
            return answer;

    const branch : typeItem[] = router.filter( 
        (item) => (item.name == root[index].type)
        );

    const convert = (answer: any) : Address => {
        type refKeys = keyof typeof accountRefs;

        if (Object.keys(accountRefs).includes(answer)) {
            const account =  <accountType>accountRefs[<refKeys>answer]

            switch (account.wallet) {
                case undefined: 
                case NULL_ADDRESS: 
                    return <Address>(account.address);
                default:
                    return <Address>(account.wallet);
                }
            }
        return NULL_ADDRESS;
        }
    
    if (branch.length > 0) {
        return branch[0].callback( 
            answer, 
            enumOrValue( root, index, answer ), 
            <Address>convert(answer), 
            name
            );
        }
    else return undefined;
    }
    

export function enumOrValue( args: Array<any>, index: number, answer: string ) : number | string | undefined {

    if ("internalType" in args[index]) {

        const parse = <string>args[index].internalType.split(' ');

        if (parse[0] == "enum") {

            const parseEnum = parse[1].split('.');

            const val : string = (parseEnum.length > 1) ? parseEnum[1] : parseEnum[0];

            if (!Number.isNaN(answer) && Number(answer) < 2**8) {

                type enumKeys = keyof typeof listOfEnums;
                return <string>listOfEnums[<enumKeys>val][Number(answer)];
                }
            }
        else if (parse[0] == "uint8") {
            if (!Number.isNaN(answer) && Number(answer) < 2**8)  {
                return Number(answer); 
                }
            } 
        return undefined;
        }
    return Number(answer);
    }