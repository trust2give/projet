import { Contract, ContractSendMethod, Options } from 'web3-eth-contract'
//import { encodeFunctionSignature } from 'web3-eth-abi'


/**
 * Deploy the given contract
 * @param {string} contractName name of the contract to deploy
 * @param {Array<any>} args list of constructor' parameters
 * @param {string} from account used to send the transaction
 * @param {number} gas gas limit
 * @return {Options} deployed contract
 */

// depList is an object made up of several items:
// contractName/LibName: { "Path": relative path from rootPath, "Address": "0xXXX", "Valid": bool, "deploy": true, "action": false, "web": false, "args": [ "owner", "DiamondCutFacet" ] },
export var metadata: any;
export var gasAmount: number;
export var contract: Contract;
export var beacon: any;


export const deploy = async (contractName: string, depList: any, net: string, web3: any, args: Array<any>, from: string, gas: number, debug: boolean): Promise<Options> => {
    // Note that the script needs the ABI which is generated from the compilation artifact.
    // Make sure contract is compiled and artifacts are generated
    metadata = JSON.parse(await remix.call('fileManager', 'getFile', depList[contractName].Path))

    if (debug) console.log(`Deploy Step 1: ${contractName} - ${depList[contractName].Path}`)

    // Binding the libraries based on bytecode modifications
    var updatedByteCode = metadata.data.bytecode.object;
    for (const [network, params] of Object.entries(metadata.deploy)) {
        if (network === net) {
            const liblist = params.linkReferences;
            for (const [link, item] of Object.entries(liblist)) {
                metadata.deploy[network].linkReferences[Object.keys(item)[0]] = depList[Object.keys(item)[0]].Address;
                const add2Link = depList[Object.keys(item)[0]].update ? depList[Object.keys(item)[0]].newAddress.substring(2) : depList[Object.keys(item)[0]].Address.substring(2);
                const keylink = "__$" + web3.utils.keccak256(`${link}:${Object.keys(item)[0]}`).substring(2,36) + "$__";

                //console.log(`${Object.keys(item)[0]} - ${add2Link} - ${keylink}`);
                
                updatedByteCode = updatedByteCode.replaceAll( keylink, add2Link )
                }
            }
        }
    metadata.data.bytecode.object = updatedByteCode;
    
    if (debug) console.log(`Deploy Step 2: ${contractName} - args`)

    contract = new web3.eth.Contract(metadata.abi)
    const contractSend: ContractSendMethod = contract.deploy({ data: metadata.data.bytecode.object, arguments: args })
    gasAmount = await contractSend.estimateGas({from: from}) 

    if (debug) console.log(`Deploy Step 3: ${contractName} - Estimate Gas ${gasAmount}`)

    const newContractInstance = await contractSend.send({ from: from, gas: gas })
    contract.options.address = newContractInstance.options.address;
    return newContractInstance.options;
    }

export const getContract = async ( contractPath: string, hiveAddress: string, web3: any, debug: boolean ) => {
    const contractMetadata = JSON.parse(await remix.call('fileManager', 'getFile', contractPath))
    const result: Contract  = new web3.eth.Contract(contractMetadata.abi, hiveAddress);
    //contract.options.address = newContractInstance.options.address;
    //if (debug) console.log(`Hive @${hiveAddress} - contract @${contract.options.address}`)
    return result;
  }

export const getPath = (pathRoot: string, fileName: string) => {
    const rootPath: string = `./contracts/`;
    var middlePath: string = (pathRoot !== "") ? `${pathRoot}/` : "":
    return `${rootPath}${middlePath}artifacts/${fileName}.json`;;
  }

export function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

export function showObject( data: any, eol: boolean = true ) {
    var label: string = "";
    if (data == null) return "Object::Null";
    for (const [key, value] of Object.entries(data)) {
        const t = typeof value;
        const ret = eol ? `\n` : "";
        switch (t) {
            case "number":
            case "string":
            case "bigint": label += `${key} ${t.slice(0,1)}: ${value} ${ret}`; break;
            case "boolean": label += `${key} : ${value ? "TRUE" : "FALSE" } ${ret}`; break;
            case "object":
                if (Array.isArray(value)) {
                    const tab = value.reduce((accumulator, currentValue) => { 
                        return `${accumulator} ${typeof(currentValue) === "object" ? showObject(currentValue, false) : currentValue} |` }, "|") 
                    label += `${key}[Arr] : ${tab} ${ret}`;
                    }
                else label += showObject( value );
                break;
            default:
            }
        }
    return label;
    }

export function parseEventFromContract( result: Array<any>, objectName: string, eventName: string, errorName: string ) {
    //console.log(result);
    if (result.events) {
        const eventContent = (result.events[eventName]) ? result.events[eventName] : null; // Print event details
        const eventError = (result.events[errorName]) ? result.events[errorName] : null; // Print event details
        //console.log(eventContent, eventError);
        if (eventError) {
            const displayErr = (!Array.isArray(eventError)) ? [ eventError ] : eventError;
            displayErr.forEach((element) => {
                console.error(`${errorName} : Entity ${objectName} : Hash ${result.transactionHash} - Error ${element.returnValues._error} - User ${element.returnValues._user}` );
                });
            return null;
            }
        if (eventContent) {
            const display = (!Array.isArray(eventContent)) ? [ eventContent ] : eventContent;
            display.forEach((element) => {
                console.info(`${eventName} :Entity ${objectName} : Hash ${result.transactionHash} - ${element ? element.returnValues._id : null} - Label ${element.returnValues._label}`);
                });
            return eventContent;
            }
        }
    return null;
    }

export function parseResultFromGetter( result: any, label: string, show: boolean = false ) {
    var outcome = result;
    var valid: string = "";
    var ok: boolean = false;
    if (typeof(result) === "object") {
        if (!Array.isArray(result)) {
            outcome = {};
            for (const [key, val] of Object.entries(result)) {
                if (isNaN(parseInt(key, 10))) {
                    if ((key === "_valid" || key === "_error") && val !== "OK") { valid = val; ok = false; }
                    else if ((key === "_valid" || key === "_error") && val === "OK") { ok = true; }
                    else outcome[key] = val;
                    }
                }
            }
        outcome = JSON.stringify(outcome);
        }
    if (show) {
        if ((valid === "") && !ok) console.log(`${label} ${outcome}`);
        else if ((valid === "") && ok) console.info(`${label} ${outcome}`);
        else if (!ok) console.error(`${label} ${valid}`);
        }
    return result;
    }

/*
export function showArray( title: string, index: number, data: Array<any> ) {
    console.log( `${title} - ${index}` );
    var label: string;
    data.forEach((element) => {
        for (const [key, value] of Object.entries(element)) {
            if typeof(value) == 'object' {
                label = Array.isArray(value) ? value.reduce((accumulator, currentValue) => { return accumulator + "|" + currentValue }, "|") : JSON.stringify(value));
                console.log( `${key} : ${label}`)
                }
            else console.log( `${key} : ${value}`)
            }
        });
    }*/