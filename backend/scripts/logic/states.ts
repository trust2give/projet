const hre = require("hardhat");
import { Address } from "viem";
import { rwRecord, Account, NULL_ADDRESS } from "../libraries/types";

export var globalState : menuState = {};

// accountReds represents the set of wallets EOA or Smwart Accounts
// { "@X": { name: string, address: Address, balance: bigint }}
// @0 to @9 => Wallet accounts from hardhat node
// @A : {name: T2G_root, address: <address of wallet bound to SC, not @SC itself if present, otherwise yes, balance: <balance of address in EUR contract> }
export var accountRefs: Object = {};

export function setState( newState: menuState, item?: rwRecord) {
    globalState = Object.assign( globalState, newState );
    if (item != undefined) globalState.item = item; 
    }

export type accountType = {   
    name: string, 
    address: Address, 
    wallet: Address | undefined, 
    private?: '0x{string}' | undefined, 
    balance: bigint 
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

    var rank = 0;
    for (const wallet of accounts.toSpliced(10)) {
        const balance = await publicClient.getBalance({ address: wallet.address,})    
        accountRefs = Object.assign( accountRefs, Object.fromEntries(new Map([ [`@${rank}`, 
            {   name: `Wallet ${rank}`, 
                address: wallet.address, 
                balance: balance } 
            ] ])));
        rank++;
        }
    }
