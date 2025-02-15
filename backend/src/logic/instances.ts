import { BaseError, Address, ContractFunctionRevertedError, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { dataDecodeABI, abiData, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex2, regex3 } from "../libraries/types";
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { accountType, accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts } from "./states";
import fs from 'fs';
import { colorOutput } from '../libraries/format';

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

export const getGWEI = async () : Promise<Number | undefined> => {

    const jsonStable = fs.readFileSync( 
        contractSet[0].abi.path, 
        'utf-8' 
        );
    
    const stableABI : any = JSON.parse(jsonStable);
    
    try {                                
        return await globalState.clients.readContract({
                address: contractSet[0].address,
                abi: stableABI.abi.file.abi,
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

export const getABI = ( name: string ) => {
    return JSON.parse(fs.readFileSync( 
        (<contractRecord>facetNames.find( (item) => item.name == name )).abi.path, 
        'utf-8' 
        ));
    }

export const getStableABI = () => {
    return JSON.parse(fs.readFileSync( 
        contractSet[0].abi.path, 
        'utf-8' 
        ));
    }
    
export const writeStableContract = async ( name: string, args: Array<any>, account: any) : Promise<typeof regex2 | undefined> => {
    const jsonStable = fs.readFileSync( 
        contractSet[0].abi.path, 
        'utf-8' 
        );
    
    const stableABI : any = JSON.parse(jsonStable);

    try {                                    
                
        const { request } = await globalState.clients.simulateContract({
            address: contractSet[0].address,
            abi: stableABI.abi.file.abi,
            functionName: name,
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

export const writeFacetContract = async ( contractName: string, fName: string, args: Array<any>, account: any) : Promise<typeof regex2 | undefined> => {

    const facetABI : any = getABI(contractName);

    try {                                    
                
        const { request } = await globalState.clients.simulateContract({
            address: diamondNames.Diamond.address,
            abi: facetABI.abi,
            functionName: fName,
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

export const encodeInputsAndSend = async ( contractName: string, fName: string, args: Array<any>, account: any) : Promise<typeof regex2 | undefined> => {
        if (contractName in encodeInterfaces) {

        const encodeInput = encodeInterfaces[<keyof typeof encodeInterfaces>contractName].find((item) => item.function == fName);
        
        if (encodeInput != undefined) {
            if ("_data" in encodeInput) {

                const encodedData = encodeAbiParameters( dataDecodeABI[<keyof typeof dataDecodeABI>encodeInput._data], args );

                try {                                      
                    
                    const { request } = await globalState.clients.simulateContract({
                        address: diamondNames.Diamond.address,
                        abi: getABI(contractName).abi,
                        functionName: fName,
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

