import { BaseError, Address, ContractFunctionRevertedError, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { dataDecodeABI, abiData, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex2, regex3 } from "../libraries/types";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { accountType, accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts } from "./states";
import fs from 'fs';

/***************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* Instance.ts
*
* Library of Typescript functions to interact with smart contract instances
* depkoyed on the blockchain
* 
* Mains functions:
* - instanceCallback: Array of callback functions called through the web service interactions
*   - state | instance : return the specs of a given smartcontract
*   - state | accounts : returns the list of account wallets <accountsRef>
*   - state | contracts : returns the list of smartContract names
* - getGWEI: read the number of decimals for a GWEI 
* - getABI: fetch then json object of a contract
* - getStableABI:  fetch the json object of the stablecoin mockup contract
* - writeStableContract : calls a write function of the stablecoin mockup contract
* - writeFacetContract : calls a write function of a given facet contract
* - encodeInputsAndSend : calls a write function with encoded inputs
* 
* Version
* 1.0.1 : Creation of the file
/**************************************************************************************/


/************************************************************************************** 
 * Array instanceCallback[]
 * 
 * Array of objects { call, tag, help, callback } that contains the callback functions
 * that are performed when <call | tag> is passed through the web service interface
 * 
 * Inputs : arguments depends on the callback functions:
 *   - state | instance : [ { name <string> }]
 *   - state | accounts : no arguments
 *   - state | contracts : no arguments
 * 
 * Returned values : depends on the callback functions :
 *   - state | instance : returns the list of { name <string>, type <string>, state <string>, inputs { <string> } }
 *   - state | accounts : returns the list of { tag <Account>, name <string>, address <Address>, wallet <Address> }
 *   - state | contracts : returns the list of smartContract [ names <string> ]
 *
***************************************************************************************/

export const instanceCallback : callbackType[] = [
    { 
    call: "state",
    tag: "instance", 
    help: "state | instance [ { name: <string> }] -> Get the detail of a specific smart contract <name>",
    callback: async ( inputs: Array<{ name: string }> ) : Promise<Array<any> | undefined> => {

        console.log( "state instance ", inputs);

        if (inputs.length == 0) return undefined;

        var instanceList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        for ( const input of inputs) {
            var result : any = [];

            const record : contractRecord | undefined = [diamondNames.Diamond, ...facetNames, ...contractSet].find((item) => item.name == input.name)

            if (record != undefined) {

                const jsonFacet = fs.readFileSync( 
                    (<contractRecord>record).abi.path, 
                    'utf-8'
                    );
                
                result = JSON.parse(jsonFacet).abi.map( 
                    (item : { 
                        inputs: Array<abiData>, 
                        name: string, 
                        type: string, 
                        stateMutability?: string, 
                        outputs?: string, 
                        anonymous?: boolean  
                        }) => {
                        return {
                            name: item.name,
                            type: item.type,
                            state: item.stateMutability,
                            inputs: item.inputs.map( ( el: abiData ) => el.name ),
                            }   
                        });    

                        instanceList.push(
                    Object.assign( { 
                        instance: result
                        }, 
                        input
                        )
                    );
                }
            }

        return instanceList;
        }
    },
    { 
    call: "state",
    tag: "accounts", 
    help: "state | accounts [] -> Get the list of available accounts",
    callback: async ( inputs?: Array<any> ) : Promise<Array<any>> => {
        return Object.entries(accountRefs).map( (item ) => {  
            return { 
                tag: item[0],
                name: (<accountType>item[1]).name, 
                address: (<accountType>item[1]).address, 
                wallet: ((<accountType>item[1]).wallet) ? <Address>(<accountType>item[1]).wallet : NULL_ADDRESS
                }
            });
        }
    },
    { 
    call: "state",
    tag: "contracts", 
    help: "state | accounts [] -> Get the list of available smart contracts",
    callback: async ( inputs?: Array<any> ) : Promise<Array<any>> => {
        return facetNames.map( (el : contractRecord ) => el.name );
        }
    }    
    ]

/************************************************************************************** 
 * Function getGWEI
 * 
 * Calls the function <decimals> of the EUR stablecoin mockup smartContract and
 * returns the number of digits that represents a GWEI
 * 
 * Return value is a promise for either a <number> 
 * or <undefined> when call failed or error in the processing of aruments passed.
 *
***************************************************************************************/

export const getGWEI = async () : Promise<Number | undefined> => {
    
    const stableABI = getStableABI();
    
    try {                                
        return await globalState.clients.readContract({
                address: contractSet[0].address,
                abi: stableABI.abi,
                functionName: "decimals",
                args: [ ]
                });
        }
    catch (err) {
        console.log( "Error >> " )
        if (err instanceof BaseError) {
            const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
            if (revertError instanceof ContractFunctionRevertedError) {
                const errorName = revertError.data?.errorName ?? ''
                // do something with `errorName`
                console.error(errorName)
                }
            }                           
        console.error(err);
    }      
    return undefined;
}

/************************************************************************************** 
 * Function getABI
 * 
 * returns the json object for the compiled <name> smartContract, which is a facet
 * of the diamond architecture
 * 
 * Condition:
 * <facetNames> object set up with the <name> smart contract and its json file path
 * 
 * Return value is a json object that at least contains <abi> item
 *
***************************************************************************************/

export const getABI = ( name: string ) => {
    return JSON.parse(fs.readFileSync( 
        (<contractRecord>facetNames.find( (item) => item.name == name )).abi.path, 
        'utf-8' 
        ));
    }

/************************************************************************************** 
 * Function getStableABI
 * 
 * returns the json object for the compiled EUR stablecoin mockup smartContract
 * 
 * Condition:
 * <contractSet> object set up with EUR stablecoin mockup contract and json file path
 * 
 * Return value is a json object that at least contains <abi> item
 *
***************************************************************************************/

export const getStableABI = () => {
    return JSON.parse(fs.readFileSync( 
        contractSet[0].abi.path, 
        'utf-8' 
        ));
    }

/************************************************************************************** 
 * Function writeStableContract
 * 
 * Send a writeContract call to a EUR StableCoin Mochup instance, for the <functionName>
 * Arguments passed are <args>, an array of values (any type)
 * The <account> represents the sender wallet to use for the call
 * 
 * Condition:
 * <functionName> are to be function in its ABI
 * 
 * Return value is a promise for etheir the <transaction hash> result of the call
 * or <undefined> when call failed or error in the processing of aruments passed.
 * Reasons for such an error:
 * - wrong <functionName>
 * - writeCall returns an errror
 *
***************************************************************************************/

export const writeStableContract = async ( 
    functionName: string, 
    args: Array<any>, 
    account: any
    ) : Promise<typeof regex2 | undefined> => {

    const stableABI = getStableABI();

    try {                                    
                
        const { request } = await globalState.clients.simulateContract({
            address: contractSet[0].address,
            abi: stableABI.abi,
            functionName: functionName,
            args: args,
            account
        })
        
        return await globalState.wallets.writeContract(request)
        }
    catch (err) {
        console.log(err);
        }
    return undefined;
    }

/************************************************************************************** 
 * Function writeFacetContract
 * 
 * Send a writeContract call to a <contractName> instance, for the <functionName>
 * when the contractName represents a Facet of the Diamond Architecture
 * Arguments passed are <args>, an array of values (any type)
 * The <account> represents the sender wallet to use for the call
 * 
 * Condition:
 * <contractName> & <functionName> are to be facet contracts & function in its ABI
 * 
 * Return value is a promise for etheir the <transaction hash> result of the call
 * or <undefined> when call failed or error in the processing of aruments passed.
 * Reasons for such an error:
 * - wrong <contractName> or <functionName>
 * - writeCall returns an errror
 *
***************************************************************************************/

export const writeFacetContract = async ( 
    contractName: string, 
    functionName: string, 
    args: Array<any>, 
    account: any
    ) : Promise<typeof regex2 | undefined> => {

    const facetABI : any = getABI(contractName);

    try {                                    
                
        const { request } = await globalState.clients.simulateContract({
            address: diamondNames.Diamond.address,
            abi: facetABI.abi,
            functionName: functionName,
            args: args,
            account
        })
        
        return await globalState.wallets.writeContract(request)
        }
    catch (err) {
        console.log( "Error >> " )
        if (err instanceof BaseError) {
            const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
            if (revertError instanceof ContractFunctionRevertedError) {
                const errorName = revertError.data?.errorName ?? ''
                // do something with `errorName`
                console.error(errorName)
                }
            }                           
        console.error(err);
        }
    return undefined;
    }

/************************************************************************************** 
 * Function encodeInputsAndSend
 * 
 * Send a writeContract call to a <contractName> instance, for the <functionName>
 * when the function has a single input "_data" with encoded value, and values to
 * pass are <args> array of values (any type)
 * The <account> represents the sender wallet to use for the call
 * 
 * Condition:
 * <contractName> & <functionName> are to be presents in <encodeInterface> objects
 * "_data" inputs to be present also in <encodeInterface> objects
 * 
 * Return value is a promise for etheir the <transaction hash> result of the call
 * or <NULL_HASH> when call failed or error in the processing of aruments passed.
 * Reasons for such an error:
 * - no <contractName> or <functionName> in <encodeInterface>
 * - no "_data" input declared in <encodeInterface>
 * - writeCall returns an errror
 *
***************************************************************************************/

export const encodeInputsAndSend = async ( 
    contractName: string, 
    functionName: string, 
    args: Array<any>, 
    account: any
    ) : Promise<typeof regex2 | undefined> => {
    
        if (contractName in encodeInterfaces) {

        const encodeInput = encodeInterfaces[<keyof typeof encodeInterfaces>contractName].find((item) => item.function == functionName);
        
        if (encodeInput != undefined) {
            if ("_data" in encodeInput) {

                const encodedData = encodeAbiParameters( dataDecodeABI[<keyof typeof dataDecodeABI>encodeInput._data], args );

                try {                                      
                    
                    const { request } = await globalState.clients.simulateContract({
                        address: diamondNames.Diamond.address,
                        abi: getABI(contractName).abi,
                        functionName: functionName,
                        args: [ encodedData ],
                        account
                    })
                  
                    return <typeof regex2>await globalState.wallets.writeContract(request)

                    }
                catch (err) {
                    console.log( "Error >> " )
                    if (err instanceof BaseError) {
                        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
                        if (revertError instanceof ContractFunctionRevertedError) {
                        const errorName = revertError.data?.errorName ?? ''
                        // do something with `errorName`
                        console.error(errorName)
                        }
                    }                           
                    console.error(err)
                    return NULL_HASH;
                    }
                }
            }
        }
    return NULL_HASH;
    }

