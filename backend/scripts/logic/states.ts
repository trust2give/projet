const hre = require("hardhat");
import { Address } from "viem";
import { rwRecord, Account, NULL_ADDRESS } from "../libraries/types";
import { colorOutput, displayAccountTable } from "../libraries/format";

export var globalState : menuState = {};

export const prompts = {
    Deploy: "Deploy Smart Contract (<Help>, <Accounts> or Contract Name) ",
    None: "Smart Contract (<Help>, <Accounts> or <Contact Name>) >> ",
    Function: `Which Function (<Help>, <Accounts>, <back> or Function Name ) ? `,
    Sender: "Which Sender's Account (msg.sender) [@0 ... @9] ? ",
    subArgs: (index: number, subIndex: number, name: string, abi: string, subName: string) => "Args ".concat( 
        ` [${index} / ${subIndex}] - ${name} [${abi} ${subName}]`
        ), 
    Args: (index: number, name: string, type: string) => "Args ".concat( 
        ` [${index}] - ${name} [${type}] ` 
        ), 
    display: () : string => "".concat( 
            colorOutput( 
                `[ ${(globalState.level != "") ? globalState.level : "None"}|${(globalState.tag != "") ? globalState.tag : "None"}|${globalState.inputs}] `, 
                "cyan", 
                true 
                ), 
                <string>globalState.promptText,
                ` >> ` )
    }

// accountReds represents the set of wallets EOA or Smwart Accounts
// { "@X": { name: string, address: Address, balance: bigint }}
// @0 to @9 => Wallet accounts from hardhat node
// @A : {name: T2G_root, address: <address of wallet bound to SC, not @SC itself if present, otherwise yes, balance: <balance of address in EUR contract> }
export var accountRefs: Object = {};

export function deployState() {
    setState( { 
        deploy: true, 
        object: false, 
        index: 0, 
        subIndex: 0, 
        level: "Deploy", 
        inputs: "None", 
        promptText: prompts.Deploy, 
        tag: "", 
        subItem: [] 
        }, 
        <rwRecord>{}
        );
    }

export function initState() {
    setState( { 
        index: 0, 
        subIndex: 0,
        help: "", 
        promptText: "Smart Contract (<Help>, <Accounts> or <Contact Name>) >> ", 
        inputs: "None", 
        deploy: false, 
        object: false, 
        tag: "", 
        level: "",
        pad: 10,
        subItem: [] 
        }, 
        <rwRecord>{}
        );
    }

export function setState( newState: menuState, item?: rwRecord) {
    globalState = Object.assign( globalState, newState );
    if (item != undefined) globalState.item = item; 
    }

export type accountType = {   
    name: string, 
    address: Address, 
    wallet: Address | undefined, 
    client?:  object | undefined,
    private?: '0x{string}' | undefined, 
    balance: bigint,
    decimals?: number
    }

export type  menuState = {
    inputs?: "None" | "Function" | "Sender" | "Args" | "OK",
    deploy?: boolean,
    object?: boolean,
    index?: number,
    subIndex?: number,
    tag?: string,
    help?: string,
    level?: string,
    promptText?: string,
    preset?: string,
    sender?: Account,
    item?: rwRecord,
    subItem?: Array<any>,
    pad?: number
    }

export async function updateAccountBalance() : Promise<Object> {
    const publicClient = await hre.viem.getPublicClient();
    var rank = 0;
    type refKeys = keyof typeof accountRefs;
    for (const wallet of Object.entries(accountRefs)) {
        accountRefs[<refKeys>wallet[0]].balance = await publicClient.getBalance({ address: wallet[1].address,});
        }
    }
    
export const addAccount = async (rank: number, name: string, addr: Address, wallet: Array<any> ) => {
        //console.log(name, addr, rank, wallet)
        const publicClient = await hre.viem.getPublicClient();
        const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const balance = await publicClient.getBalance({ address: addr,})    
        accountRefs = Object.assign( accountRefs, Object.fromEntries(new Map(
            [ [ `@${indice.substring(rank,rank + 1)}`, 
                {   name: name, 
                    wallet: (wallet.length > 0) ? wallet[0] : NULL_ADDRESS, 
                    address: addr, 
                    private: wallet[1], 
                    balance: balance } ] ])));
        }
    
export const account = async ( rank: number, wallet: boolean ) : Promise<Address> => {
        const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        type refKeys = keyof typeof accountRefs;
        if (rank != undefined && rank > -1 && rank < 36) {
            const index = <refKeys>`@${indice.substring(rank,rank + 1)}`;   
            return (wallet) ? accountRefs[index].wallet : accountRefs[index].address;
            }
        return NULL_ADDRESS;
        }

export const assignAccounts = async () => {
    // We get the list of available accounts from hardhat testnet
    const accounts = await hre.ethers.getSigners();
    const publicClient = await hre.viem.getPublicClient();
    const wallets = await hre.viem.getWalletClients();

    var rank = 0;
    for (const wallet of accounts.toSpliced(10)) {
        const balance = await publicClient.getBalance({ address: wallet.address,})    
        accountRefs = Object.assign( accountRefs, Object.fromEntries(new Map([ [`@${rank}`, 
            {   name: `Wallet ${rank}`, 
                address: wallet.address,
                client: wallets[rank], 
                balance: balance 
            } 
            ] ])));
        rank++;
        }
    }
