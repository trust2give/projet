

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

export interface TokenEntitySpecific {
    name: string,
    uid: string,
    entity: keyof typeof TypeofEntityType,
    sector: keyof typeof TypeofSector,
    unitType: keyof typeof TypeofUnitType,
    unitSize: keyof typeof TypeofUnitSize,
    country: keyof typeof TypeCountries
    }

export const dataDecodeABI = {
TokenRWASpecificABI: [{
        components: [
            { name: 'source', type: 'uint8', internalType: "enum LibERC721.TypeofGainSource", },
            { name: 'scope', type: 'uint8', internalType: "enum LibERC721.TypeofGainScope", },
            { name: 'gain', type: 'uint8', internalType: "enum LibERC721.TypeofGainType", },
            { name: 'uri', type: 'string[]', }, 
            ],
        name: 'TokenRWASpecific',
        type: 'tuple',
    },],
TokenEntitySpecificABI: [{
        components: [
            { name: 'name', type: 'string', }, 
            { name: 'uid', type: 'string', },
            { name: 'entity', type: 'uint8', internalType: "enum LibERC721.TypeofEntityType", },
            { name: 'sector', type: 'uint8', internalType: "enum LibERC721.TypeofSector", },
            { name: 'unitType', type: 'uint8', internalType: "enum LibERC721.TypeofUnitType", },
            { name: 'unitSize', type: 'uint8', internalType: "enum LibERC721.TypeofUnitSize", },
            { name: 'country', type: 'uint8', internalType: "enum LibERC721.TypeCountries", },
            ],
        name: 'TokenRWASpecific',
        type: 'tuple',
    },],
pollenFeaturesABI : [{
        components: [
        {
            components: [
            { name: 'token', type: 'uint8', internalType: "enum LibERC721.Typeoftoken", },
            { name: 'state', type: 'uint8', internalType: "enum LibERC721.Statusoftoken", },
            { name: 'created', type: 'uint256', },
            { name: 'updated', type: 'uint256', },
            { name: 'value', type: 'uint256', },
            { name: 'size', type: 'uint8', internalType: "enum LibERC721.TypeofsizeUnit", },
            { name: 'unit', type: 'uint8', internalType: "enum LibERC721.TypeofUnit", },
            ],
            name: 'TokenStruct',
            type: 'tuple',
        },
        {
            components: [
                { name: 'name', type: 'string', }, 
                { name: 'uid', type: 'string', },
                { name: 'entity', type: 'uint8', internalType: "enum LibERC721.TypeofEntityType", },
                { name: 'sector', type: 'uint8', internalType: "enum LibERC721.TypeofSector", },
                { name: 'unitType', type: 'uint8', internalType: "enum LibERC721.TypeofUnitType", },
                { name: 'unitSize', type: 'uint8', internalType: "enum LibERC721.TypeofUnitSize", },
                { name: 'country', type: 'uint8', internalType: "enum LibERC721.TypeCountries", },
                ],
            name: 'TokenEntitySpecific',
            type: 'tuple',
        },
        {
            components: [
                { name: 'source', type: 'uint8', internalType: "enum LibERC721.TypeofGainSource", },
                { name: 'scope', type: 'uint8', internalType: "enum LibERC721.TypeofGainScope", },
                { name: 'gain', type: 'uint8', internalType: "enum LibERC721.TypeofGainType", },
                { name: 'uri', type: 'string[]', }, 
                ],
            name: 'TokenRWASpecific',
            type: 'tuple',
        },
        ],
        name: 'pollenFeatures',
        type: 'tuple',
        },],
    honeyFeaturesABI : [{
        components: [
        {
            components: [
            { name: 'token', type: 'uint8', internalType: "enum LibERC721.Typeoftoken", },
            { name: 'state', type: 'uint8', internalType: "enum LibERC721.Statusoftoken", },
            { name: 'created', type: 'uint256', },
            { name: 'updated', type: 'uint256', },
            { name: 'value', type: 'uint256', },
            { name: 'size', type: 'uint8', internalType: "enum LibERC721.TypeofsizeUnit", },
            { name: 'unit', type: 'uint8', internalType: "enum LibERC721.TypeofUnit", },
            ],
            name: 'TokenStruct',
            type: 'tuple',
        },
        {
            components: [
                { name: 'hash', type: 'string[]', }, 
                { name: 'rate', type: 'uint8', },
                ],
            name: 'TokenFundSpecific',
            type: 'tuple',
        },
        ],
        name: 'honeyFeatures',
        type: 'tuple',
    },]
    };