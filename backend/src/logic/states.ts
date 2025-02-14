import { http, Address, getContract, createPublicClient, createWalletClient, parseEther, formatEther } from 'viem'
import { mainnet, hardhat } from 'viem/chains'

import { rwRecord, Account, NULL_ADDRESS } from "../libraries/types";

export type  menuState = {
    inputs?: "None" | "Function" | "Sender" | "Args" | "OK",
    deploy?: boolean,
    object?: boolean,
    index?: number,
    subIndex?: number,
    tag?: string,
    help?: string | string[],
    level?: string,
    preset?: string,
    sender?: Account,
    item?: rwRecord,
    subItem?: Array<any>,
    log?: string,
    pad?: number,
    accountIndex?: number,
    wallets?: any,
    clients?: any
    }

export type accountType = {   
    name: string, 
    address: Address, 
    wallet: Address | undefined, 
    client?:  object | undefined,
    private?: '0x{string}' | undefined, 
    balance?: bigint,
    decimals?: number
    }

export interface accountList {
    [cle: string]: accountType; // Ici, 'cle' est le nom variable et 'number' est le type fixe
}

export interface clientFormat {
    [cle: string]: any,
    account: { address: Address, type: string }
    }

// globalState represents the set of variables that points out the current status of the interactions with user 
// and the Smart Contracts. The global variable is exported for use in the different functions

export var globalState : menuState = {};

// accountReds represents the set of wallets EOA or Smwart Accounts
// { "@X": { name: string, address: Address, balance: bigint }}
// @0 to @9 => Wallet accounts from hardhat node
// @A : {name: T2G_root, address: <address of wallet bound to SC, not @SC itself if present, otherwise yes, balance: <balance of address in EUR contract> }
export var accountRefs: accountList = {};

export function addLog( log: string ) {
    setState( { 
        log: globalState.log?.concat(log),
        }, 
        );
    }
    
export function deployState() {
    setState( { 
        deploy: true, 
        object: false, 
        index: 0, 
        subIndex: 0, 
        level: "Deploy", 
        inputs: "None", 
        tag: "", 
        log: "",
        subItem: [] 
        }, 
        <rwRecord>{}
        );
    }

// Used
export function initState() {
    setState( { 
        index: 0, 
        subIndex: 0,
        help: "", 
        inputs: "None", 
        deploy: false, 
        object: false, 
        sender: Account.A0,
        tag: "", 
        log: "",
        level: "",
        pad: 10,
        subItem: [] 
        }, 
        <rwRecord>{}
        );
    }

// Used
export async function loadWallets() {

    globalState.wallets = createWalletClient({
        chain: hardhat,
        transport: http('http://localhost:8545'), 
        })

    globalState.clients = createPublicClient({
        chain: hardhat,
        transport: http('http://localhost:8545'), // L'adresse de votre nœud Hardhat
    });
    }

export function functionState( level?: string ) {
    setState( { 
        inputs: "Function", 
        object: false, 
        deploy: false, 
        level: level, 
        log: ">>",
        });            
    }

export function setState( newState: menuState, item?: rwRecord) {
    globalState = Object.assign( globalState, newState );
    if (item != undefined) globalState.item = item; 
    }


export async function updateAccountBalance() {

    for (const wallet of Object.entries(accountRefs)) {
        accountRefs[<keyof typeof accountRefs>wallet[0]].balance = await globalState.clients.getBalance(
            { 
                address: wallet[1].address,
            }
            );
        }
    }

export const addAccount = async (rank: number, name: string, addr: Address, wallet: Array<any> ) : Promise<Boolean> => {
        const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const balance = await globalState.clients.getBalance({ address: addr,})    

        accountRefs = Object.assign( accountRefs, Object.fromEntries(new Map(
            [ [ `@${indice.substring(rank,rank + 1)}`, 
                {   name: name, 
                    wallet: (wallet.length > 0) ? wallet[0] : NULL_ADDRESS, 
                    address: addr, 
                    private: wallet[1], 
                    balance: balance } ] ])));
        
        return true;
        }

// Used
export const assignAccounts = async () => {

    var rank = 0;
    const wallets = await globalState.wallets.getAddresses();

    for (const wallet of wallets.toSpliced(10)) {

        const balance = await globalState.clients.getBalance({
            address: wallet,
            });
    
        console.log(
            `Balance of ${wallet}: ${formatEther(balance)} ETH`
            );
    
        accountRefs = Object.assign( accountRefs, Object.fromEntries(new Map([ [`@${rank}`, 
            {   name: `Wallet ${rank}`, 
                address: wallet,
                balance: balance 
            } 
            ] ])));
        rank++;
        }
    }
