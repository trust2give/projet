import { Address } from "viem";
import { FacetCutAction } from "../utils/diamond";
import fs from 'fs';

// Expression régulière pour détecter une adresse ETH 
export const regex = '^(0x)?[0-9a-fA-F]{40}$';
export const regex2 = '^(0x)?[0-9a-fA-F]{64}$';
export const regex3 = '^(0x)?[0-9a-fA-F]{8}$';
export const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"
export const NULL_HASH = <typeof regex2>"0x0000000000000000000000000000000000000000000000000000000000000000"


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

    export type cutRecord = {
        facetAddress: Address,
        action: FacetCutAction,
        functionSelectors: Array<any>
        }
    
    export interface contractRecord { 
        name: string, 
        address: Address,
        abi: { path: fs.PathOrFileDescriptor, file: any},
        beacon?: string | boolean,
        get?: string | boolean,
        wallet?: string,
        }
    
    export type diamondCore = {
        Diamond: contractRecord,
        DiamondCutFacet: contractRecord,
        DiamondInit: contractRecord,
        DiamondLoupeFacet: contractRecord,
        }
    
    /// enum type qui permet de définir si une interaction est de type READ ou WRITE
    export enum rwType { READ, WRITE, CONSTRUCTOR }
    
    export type rwRecord = { 
        rwType: rwType,
        contract: string, 
        instance: any,
        function: string, 
        args: Array<any>,
        values: Array<any>,
        outcome: Array<any>,
        events: any
    }
    
    export type menuRecord = {
        tag: string,
        contract: string | undefined
        args: Object,
        diamond: Account | undefined,
        events: any,
        }

    export type callbackType = {
        call: string,
        tag: string,
        help?: string,
        callback: ( inputs: Array<any> ) => {}
        }