import { Contract, ContractSendMethod, Options } from 'web3-eth-contract'
import  {deploy, metadata, gasAmount, contract, beacon, getContract, parseEventFromContract, parseResultFromGetter, getPath, sleep, showObject} from './web3-root'

export const Status = {
  DRAFT:  [1], 
	CERTIFIED: [2, "POLCertify" ],
  BOUND: [3],
  EATEN: [4],
  CANCELED: [5, "POLCancel" ]
  };

export const Scale = {
  G:  [0], 
	KG: [1],
  T: [2],
  KT: [3],
  MT: [4]
  };

export const Currency = {
  NONE:  [0], 
	EURO: [1],
  DOLLAR: [2],
  SWISSFRANC: [3],
  STERLINGPOUND: [4],
  YEN: [5],
  YUAN: [6]
  };

export const GainScope = {
  NONE: [0],
  S1_FIXE: [1],
  S1_MOBILE: [2],
  S1_PROCESS: [3],
  S1_FUGITIVE: [4],
  S1_BIOMASSE: [5],
  S2_ELECTRICITY: [6],
  S2_HEATCOLD: [7],
  S3_UPSTREAMNRJ: [8],
  S3_RAWPURCHASE: [9],
  S3_AMMORTIZATION: [10],
  S3_WASTES: [11],
  S3_UPSTREAMSUPPLY: [12],
  S3_TRAVELS: [13],
  S3_UPSTREAMLEASING: [14],
  S3_TBD2: [15],
  S3_VISITORS: [16],
  S3_DOWNSTREAMSUPPLY: [17],
  S3_SALES: [18],
  S3_ENDOFLIFE: [19],
  S3_DOWNSTREAMFRANCHISE: [20],
  S3_DOWNSTREAMLEASING: [21],
  S3_TBD3: [22],
  S3_TBD4: [23] 
  };

export async function meth_counts( hiveContract: Contract, options: any, label: string, show: boolean = false  ) {
  try {
    return parseResultFromGetter( await hiveContract.methods.counts().call(options), label, show ); 
    } catch (e) {
        console.error(`Error::${label} => `, e.message);
        return null;
        }
    }

export async function meth_pollenCounts( hiveContract: Contract, options: any, label: string, show: boolean = false  ) {
  try {
    return parseResultFromGetter( await hiveContract.methods.POLCounts().call(options), label, show ); 
    } catch (e) {
        console.error(`Error::${label} => `, e.message);
        return null;
        }
    }

export async function meth_beacon( hiveContract: Contract, options: any, name: string, show: boolean = false ) {
  try {
    return parseResultFromGetter( await hiveContract.methods[`beacon_${name}`]().call(options), name, show ); 
    } catch (e) {
        console.error(`Error::beacon_${name} => `, e.message);
        return null;
        }
    }

export async function meth_create( hiveContract: Contract, options: any, method: string, inputs: any, eventName: string, errorName: string, token: string ) {
  try {
    const create = await hiveContract.methods[method](...inputs).send(options);
    const result = parseEventFromContract(create, token, eventName, errorName );
    //if (result.returnValues) console.log( `Created ${method} => ${JSON.stringify(result.returnValues)}`);
    return (result.returnValues) ? result.returnValues : null;
    } catch (e) {
        console.error(`Error::Create ${method} => `, e.message);
        return null;
        }
    }

export async function meth_update( hiveContract: Contract, options: any, method: string, inputs: any, eventName: string, errorName: string, token: string ) {
  try {
    const create = await hiveContract.methods[method](...inputs).send(options);
    const result = parseEventFromContract(create, token, eventName, errorName );
    if (result.returnValues) console.log( `Created ${method} => ${JSON.stringify(result.returnValues)}`);
    return (result.returnValues) ? result.returnValues : null;
    } catch (e) {
        console.error(`Error::Update ${method} => `, e.message);
        return null;
        }
    }

export async function meth_readFromId( hiveContract: Contract, options: any, method: string, inputs: any, label: string ) {
  try {
    return parseResultFromGetter( await hiveContract.methods[method](...inputs).call(options), label ); 
    } catch (e) {
        console.error(`Error::${label} ${method} => `, e.message);
        return null;
        }
    }

export async function meth_read( hiveContract: Contract, options: any, method: string, label: string ) {
  try {
    return parseResultFromGetter( await hiveContract.methods[method]().call(options), label ); 
    } catch (e) {
        console.error(`Error::${label} ${method} => `, e.message);
        return null;
        }
    }

export async function meth_activate( hiveContract: Contract, options: any, method: string, inputs: any, eventName: string, errorName: string, token: string ) {
  try {
    const active = await hiveContract.methods[method](...inputs, "Active").send(options);
    const result = parseEventFromContract(active, token, eventName, errorName );
    return (result.returnValues) ? result.returnValues : null;
    } catch (e) {
        console.error(`Error::Create ${method} => `, e.message);
        return null;
        }
    }

