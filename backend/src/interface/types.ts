import { Address, stringify } from "viem";
import { NULL_ADDRESS } from "../libraries/types";


export const Typeoftoken : string[] = ["None", "Pollen", "Honey", "Nektar", "Cell"]

export const Statusoftoken : string[] =  [ "None", "Draft", "Validated", "Certified", "Active", "Burnt", "Canceled"]

export const TypeofUnit : string[] = ["None", "GWEI", "EURO", "DOLLAR", "SWISSFRANC", "STERLINGPOUND", "YEN", "YUAN", "USDC", "USDT", "EURC", "SUI"]

export const TypeofSector: string[] = [ "NONE", "TRANSPORT", "AUTOMOTIVE", "AEROSPACE", "SERVICES", "SOFTWARE", "ITINDUSTRY", "HIGHTECH", "LUXURY", "BUILDINGS", "SUPPLYCHAIN", "FOOD", "HEALTHCARE" ]

export const TypeofGainType : string[] = [ "NONE", "REDUCTION", "SEQUESTRATION", "EVIT_PRODUIT", "EVIT_CHAINE", "EVIT_COMPENSATION" ]

export const TypeofGainScope : string[] = [ "NONE", "S1_FIXE", "S1_MOBILE", "S1_PROCESS", "S1_FUGITIVE", "S1_BIOMASSE", "S2_ELECTRICITY", "S2_HEATCOLD", "S3_UPSTREAMNRJ", "S3_RAWPURCHASE", "S3_AMMORTIZATION", "S3_WASTES", "S3_UPSTREAMSUPPLY", "S3_TRAVELS", "S3_UPSTREAMLEASING", "S3_TBD2", "S3_VISITORS", "S3_DOWNSTREAMSUPPLY", "S3_SALES", "S3_ENDOFLIFE", "S3_DOWNSTREAMFRANCHISE", "S3_DOWNSTREAMLEASING", "S3_TBD3", "S3_TBD4" ]

export const TypeofGainSource : string[] = [ "NONE", "PROCESS", "PRODUCT", "SUPPLIER", "PROVIDER", "EQUIPMENT", "CONSUMPTION", "TRANSPORT", "OTHER" ]

export const TypeofsizeUnit : string[] = [ "NONE", "KILO", "TON", "KTON", "MTON" ]

export const TypeofEntityType : string[] = [ "NONE", "PERSON", "ENTITY", "GROUP", "NETWORK" ]

export const TypeofUnitType : string[] = [ "NONE", "ENTREPRISE", "ASSOCIATION", "FONDATION", "PLATEFORME", "COLLECTIVITE", "EPICS", "ETAT" ]

export const TypeofUnitSize : string[] = [ "NONE", "SOLE", "TPE", "PME", "ETI", "GE" ]

export const TypeCountries : string[] = [ "NONE", "FRANCE", "GERMANY", "BELGIUM", "SWITZERLAND", "ITALY", "SPAIN", "PORTUGAL", "GREATBRITAIN", "SCOTTLAND", "IRELAND", "NETHERLAND", "LUXEMBURG", "POLAND", "DENMARK", "SWEDEN", "NORWAY", "ISLAND", "FINLAND", "USA", "BRAZIL", "OTHERS" ]


export const listOfEnums = {
    Typeoftoken,
    Statusoftoken,
    TypeofUnit,
    TypeofSector,
    TypeofGainType,
    TypeofGainScope,
    TypeofGainSource,
    TypeofsizeUnit,
    TypeofEntityType,
    TypeofUnitType,
    TypeofUnitSize,
    TypeCountries
    }

export type abiData = {
    name: string,
    type: string,
    internalType?: string
    }

export type abiItem = {
    components: abiData[],
    name: string,
    type: string
    }

export interface typeItem {
    name: string,
    callback: (( answer: any, enumeration: number | undefined, convertAddress: Address, name: string | undefined ) => any ), 
    }

export interface commandItem {
    name: string,
    commands: { name: string, callback: (() => any)}[], 
    }
    
const nameAbiData : abiData = { name: 'name', type: 'string', };
const emailAbiData : abiData = { name: 'email', type: 'string', };
const postalAbiData : abiData = { name: 'postal', type: 'string', };
const uidAbiData : abiData = { name: 'uid', type: 'string', };
const entityAbiData : abiData = { name: 'entity', type: 'uint8', internalType: "enum LibERC721.TypeofEntityType", };
const sectorAbiData : abiData = { name: 'sector', type: 'uint8', internalType: "enum LibERC721.TypeofSector", };
const unitTypeAbiData : abiData = { name: 'unitType', type: 'uint8', internalType: "enum LibERC721.TypeofUnitType", };
const unitSizeAbiData : abiData = { name: 'unitSize', type: 'uint8', internalType: "enum LibERC721.TypeofUnitSize", };
const countryAbiData : abiData = { name: 'country', type: 'uint8', internalType: "enum LibERC721.TypeCountries", };
const sourceAbiData : abiData = { name: 'source', type: 'uint8', internalType: "enum LibERC721.TypeofGainSource", };
const scopeAbiData : abiData = { name: 'scope', type: 'uint8', internalType: "enum LibERC721.TypeofGainScope", };
const gainAbiData : abiData = { name: 'gain type', type: 'uint8', internalType: "enum LibERC721.TypeofGainType", };
const stateAbiData : abiData = { name: 'state', type: 'uint8', internalType: "enum LibERC721.Statusoftoken", };
const tokenAbiData : abiData = { name: 'token', type: 'uint8', internalType: "enum LibERC721.Typeoftoken", };
const sizeAbiData : abiData = { name: 'size', type: 'uint8', internalType: "enum LibERC721.TypeofsizeUnit", };
const unitAbiData : abiData = { name: 'unit', type: 'uint8', internalType: "enum LibERC721.TypeofUnit", };
const createdAbiData : abiData = { name: 'created', type: 'uint256', };
const updatedAbiData : abiData = { name: 'updated', type: 'uint256', };
const valueAbiData : abiData = { name: 'value', type: 'uint256' };
const rateAbiData : abiData = { name: 'rate', type: 'uint8', };
const ownerAbiData : abiData = { name: 'owner', type: 'uint256', internalType: "bytes32" };
const assetAbiData : abiData = { name: 'owner', type: 'uint256', internalType: "bytes32" };
const report1AbiData : abiData = { name: 'report1', type: 'uint256', internalType: "bytes32" };
const report2AbiData : abiData = { name: 'report2', type: 'uint256', internalType: "bytes32" };
const hash0AbiData : abiData = { name: 'hash0', type: 'uint256', internalType: "bytes32" };

/*
export interface TokenEntitySpecific {
    name: string,
    uid: string,
    entity: keyof typeof TypeofEntityType,
    sector: keyof typeof TypeofSector,
    unitType: keyof typeof TypeofUnitType,
    unitSize: keyof typeof TypeofUnitSize,
    country: keyof typeof TypeCountries
    }
*/

const TokenStruct: abiItem = {
    components: [
        tokenAbiData,
        stateAbiData,
        createdAbiData,
        updatedAbiData,
        valueAbiData,
        sizeAbiData,
        unitAbiData,
        ownerAbiData,
        assetAbiData
        ],
    name: 'TokenStruct',
    type: 'tuple',
    }

const TokenEntitySpecific: abiItem = {
    components: [
        stateAbiData,
        nameAbiData, 
        uidAbiData,
        emailAbiData,
        postalAbiData,
        entityAbiData,
        sectorAbiData,
        unitTypeAbiData,
        unitSizeAbiData,
        countryAbiData,
        ],
    name: 'TokenEntitySpecific',
    type: 'tuple',
    }

const TokenRWASpecific: abiItem = {
    components: [
        stateAbiData,
        valueAbiData,
        sizeAbiData,
        sourceAbiData,
        scopeAbiData,
        gainAbiData,
        report1AbiData,
        report2AbiData
        ],
    name: 'TokenRWASpecific',
    type: 'tuple',
    }

const TokenFundSpecific: abiItem = {
    components: [
        stateAbiData,
        valueAbiData,
        unitAbiData,
        hash0AbiData,
        rateAbiData
        ],
    name: 'TokenFundSpecific',
    type: 'tuple',
    }

export const pollenFeatures: abiItem = {
    components: [
        TokenStruct,
        TokenEntitySpecific,
        TokenRWASpecific,
        ],
    name: 'pollenFeatures',
    type: 'tuple',
    }

export const honeyFeatures: abiItem = {
    components: [ 
        TokenStruct, 
        TokenFundSpecific,
        ],
    name: 'honeyFeatures',
    type: 'tuple',
    }

export const dataDecodeABI = {
    pollenListABI: [ { name: "", type: 'uint256[]' }, ],
    TokenRWASpecificABI: [ TokenRWASpecific,],
    TokenEntitySpecificABI: [ TokenEntitySpecific,],
    TokenFundSpecificABI: [ TokenFundSpecific ],
    pollenFeaturesABI : [ pollenFeatures ],
    honeyFeaturesABI : [ honeyFeatures ]
    };

export const typeRouteOutput: typeItem[] = [
    { name: "uint8", 
      callback: ( answer: string, 
                  enumeration: number | undefined ) => {
        return enumeration;
        }},    
    { name: "address", 
      callback: ( answer: string, 
                  enumeration: number | undefined, 
                  convertAddress: Address, 
                  name: string | undefined ) => { 
        return (convertAddress.match('^(0x)?[0-9a-fA-F]{40}$') && convertAddress != NULL_ADDRESS) ? <Address>convertAddress : undefined;
        }},    
    { name: "bytes", 
        callback: ( answer: string ) => {
            return answer;
            }},    
    { name: "bytes4", 
      callback: ( answer: string, 
                  enumeration: number | undefined, 
                  convertAddress: Address, 
                  name: string | undefined ) => { 
        return (answer.match('^(0x)?[0-9a-fA-F]{8}$')) ? answer : undefined;
        }},    
    { name: "bytes32", 
      callback: ( answer: string, 
                  enumeration: number | undefined, 
                  convertAddress: Address, 
                  name: string | undefined ) => { 
        return (answer.match('^(0x)?[0-9a-fA-F]{64}$')) ? answer : undefined;
        }},    
    { name: "uint256", 
      callback: ( answer: string, 
                  enumeration: number | undefined, 
                  convertAddress: Address, 
                  name: string | undefined ) => {
        return ((!Number.isNaN(answer)) ? BigInt(answer) : undefined);                 
        }},    
    { name: "string", 
      callback: ( answer: string, 
                  enumeration: number | undefined, 
                  convertAddress: Address, 
                  name: string | undefined ) => {
        return <string>answer;
        }},    
    { name: "bool", 
      callback: ( answer: string, 
                  enumeration: number | undefined, 
                  convertAddress: Address, 
                  name: string | undefined ) => {
        if (["True", "true", "Vrai", "vrai", "1"].includes(answer)) return 1;
        else if (["False", "false", "Faux", "faux", "0", "-1"].includes(answer)) return 0;
        return undefined;
        } },    
    { name: "tuple[]", 
      callback: ( answer : Array<any> ) => { 
        return answer.reduce( ( acc, cur) => {
            return acc.concat(stringify(cur), " |\n");
            }, "\n[" );
        }},    
    { name: "bytes32[]", 
      callback: ( answer: string[] ) => {
        return (<string[]>answer).reduce( ( acc, cur) => {
            return acc.concat(cur, ` |`);
            }, "[" );
        }},    
    { name: "string[]", 
        callback: ( answer: string[] ) => {
            return (<string[]>answer).reduce( ( acc, cur) => {
                return acc.concat(cur, ` |`);
                }, "[" );
            }},    
    /*{ name: "uint256[]", 
      callback: ( answer: bigint[] ) => {
        return (<bigint[]>answer).reduce( ( acc, cur) => {
            return acc.concat(cur, ` |`);
            }, "[" );
        }},    */
    ]


export const setIndex = ( list: string[], value: string) : number => {
    const maxIndex = list.length;
    if (maxIndex == 0) return 0;
    const found : number = list.findIndex( (item) => item == value.toUpperCase() );
    return (found < 0) ? 0 : found;
    }
