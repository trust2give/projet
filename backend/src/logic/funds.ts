import { BaseError, Address, ContractFunctionRevertedError, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { getGWEI, getABI, writeStableContract, encodeInputsAndSend, writeFacetContract } from "../logic/instances";
import { Statusoftoken, dataDecodeABI, setIndex, honeyFeatures, pollenFeatures, TypeofUnit } from "../interface/types";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState } from "./states";
import { parseReadValues } from "../libraries/format";

/***************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* funds.ts
*
* Library of Typescript functions to interact with smart contract instances
* deployed on the blockchain : T2G_HoneyFacet
* 
* Mains functions:
* - fundCallback: Array of callback functions called through the web service interactions
*   - fund | set : create a new fund <value> | <rate> from <from>
*   - fund | get : get the fund features for the given hash <hash>
*   - fund | all : No arguments
* 
* Version
* 1.0.1 : Creation of the file
/**************************************************************************************/

/************************************************************************************** 
 * Array fundCallback[]
 * 
 * Array of objects { call, tag, help, callback } that contains the callback functions
 * that are performed when <call | tag> is passed through the web service interface
 * 
 * Inputs : arguments depends on the callback functions:
 *   - fund | set : [{ person <Boolean>, inputs <Object> }]
 *   - fund | get : [{ hash <Hash> }]
 *   - fund | all : no arguments 
 * 
 * Returned values : depends on the callback functions :
 *   - entity | set : list of { inputs <Object>, tx1: <Hash>, tx2: <Hash>, tx3: <Hash> } created funds 
 *                    with transaction hashes
 *   - entity | get : list of { fund <Object>, hash: <Hash> } read fund 
 *   - entity | all : list of funds' hash 
 *
***************************************************************************************/

export const fundCallback : callbackType[] = [
    { 
    call: "fund",
    tag: "set",
    help: "fund | set [ { from: <Account>, value: <number>, rate: <number> }] -> Create a new fund and return the Id <hash>",
    callback: async ( inputs: Array<{ from?: Account, value?: number, rate?: number }> ) : Promise<Object[] | undefined> => {

        if (inputs.length == 0) return undefined;

        var setList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        //const gwei : Number | undefined = await getGWEI();
        //if (gwei == undefined) return undefined;
        
        const toAccount = (<accountType>accountRefs[Account.AA]);

        for ( const input of inputs) {
            var tx1 : typeof regex2 = NULL_HASH;
            var tx2 : typeof regex2 = NULL_HASH;
            var tx3 : typeof regex2 = NULL_HASH;

            if (Object.keys(accountRefs).includes(<string>input.from)) {

                const fromAccount = (<accountType>accountRefs[<keyof typeof accountRefs>input.from]);

                tx1 = <typeof regex2>await writeStableContract( 
                    "transfer", 
                    [ 
                    fromAccount.address,
                    BigInt(<number>input.value), // * (10 ** <number>gwei)),
                    ],
                    account 
                    )

                console.log(tx1, BigInt(<number>input.value))
    
                tx2 = <typeof regex2>await writeStableContract( 
                    "transfer", 
                    [ 
                    toAccount.address,
                    BigInt(<number>input.value), // * (10 ** <number>gwei)),
                    ],
                    fromAccount.address 
                    )
                
                console.log(tx2, BigInt(<number>input.value))
                
                tx3 = <typeof regex2>await encodeInputsAndSend( "T2G_HoneyFacet", "setFund", [[
                    setIndex( Statusoftoken, 'None' ),
                    input.value,
                    setIndex( TypeofUnit,  'GWEI'),
                    tx2,
                    input.rate
                    ]], account );
                };    

            setList.push(
                Object.assign( { 
                    tx1: tx1,
                    tx2: tx2,
                    tx3: tx3
                    }, 
                    input
                    )
                );    
            }

        return setList;
        } 
    },
    { 
    call: "fund",
    tag: "get", 
    help: "fund | get [ { hash: <regex2> }] -> Get the details of the fund with Id <hash>",
    callback: async ( inputs: Array<{  hash: typeof regex2  }> ) : Promise< Array<Object> | undefined> => {

        const fundABI : any = getABI("T2G_HoneyFacet");

        var fundList : Object[] = [];
        
        for ( const input of inputs) {

            var value : `0x${string}` = "0x0";
        
            if ("T2G_HoneyFacet" in encodeInterfaces) {
                try {                                
                    value = await globalState.clients.readContract({
                            address: diamondNames.Diamond.address,
                            abi: fundABI.abi,
                            functionName: "fund",
                            args: [ input.hash ]
                            });
                    }
                catch (error) {
                    return undefined;
                    }      
                
                // decodeOutput get the name of "TokenEntitySpecificABI"
                // 
                const decodeOutput = encodeInterfaces[<keyof typeof encodeInterfaces>"T2G_HoneyFacet"].find(
                    (item) => item.function == "fund"
                    );
                
                // Get the ABI format to apply to the byte coded result in dataDecodeABI "TokenEntitySpecific"
                // abiItem { component: [ abiData ], name: string, type: string }
                // abiData { name, type, internalType }
                
                const obj = parseReadValues( 
                    (decodeOutput != undefined) ? dataDecodeABI[<keyof typeof dataDecodeABI>decodeOutput?.output] : [], 
                    value, 
                    (decodeOutput != undefined) 
                    );
        
                fundList.push(
                    Object.assign( { 
                        fund: obj
                        }, 
                        input
                        )
                    );        
                }
            }
        return fundList;
        }
    },
    { 
    call: "fund",
    tag: "all",
    help: "fund | all [ ] -> Get the list of fund Ids that exists",
    callback: async ( inputs?: Array<any> ) : Promise<Array<string> | undefined> => {
        
        const honeyABI : any = getABI("T2G_HoneyFacet");
        
        const gwei : Number | undefined = await getGWEI();
        if (gwei == undefined) return undefined;
        console.log("GWEI decimals %d", gwei);
            
        var fundIds : string[] = [];

        try {                                
            return await globalState.clients.readContract({
                    address: diamondNames.Diamond.address,
                    abi: honeyABI.abi.file.abi,
                    functionName: "getFunds",
                    args: [ ]
                    });
            }
        catch (error) {
            return fundIds;
            }      
        }
    }
    ]