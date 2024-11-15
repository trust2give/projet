

export const Typeoftoken : string[] = ["None", "Pollen", "Honey", "Nektar", "Cell"]

export const Statusoftoken : string[] =  [ "None", "Draft", "Validated", "Active", "Burnt", "Canceled"]

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

type abiData = {
    name: string,
    type: string,
    internalType?: string
    }

type abiItem = {
    components: abiData[],
    name: string,
    type: string
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
const scopeAbiData : abiData = { name: 'country', type: 'uint8', internalType: "enum LibERC721.TypeCountries", };
const gainAbiData : abiData = { name: 'country', type: 'uint8', internalType: "enum LibERC721.TypeCountries", };
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
        valueAbiData,
        unitAbiData,
        hash0AbiData,
        rateAbiData
        ],
    name: 'TokenFundSpecific',
    type: 'tuple',
    }

const pollenFeatures: abiItem = {
    components: [
        TokenStruct,
        TokenEntitySpecific,
        TokenRWASpecific,
        ],
    name: 'pollenFeatures',
    type: 'tuple',
    }

const honeyFeaures: abiItem = {
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
    honeyFeaturesABI : [ honeyFeaures ]
    };