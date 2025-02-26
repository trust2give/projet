import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, NULL_HASH } from "../libraries/types";
import { globalState, setState } from "./states";
import { getGWEI, getABI, writeStableContract, encodeInputsAndSend, writeFacetContract } from "../logic/instances";
import { colorOutput, parseReadValues } from "../libraries/format";
import { setIndex, dataDecodeABI, TypeCountries, 
    TypeofUnitType,
    TypeofUnitSize, 
    TypeofSector, 
    TypeofEntityType, 
    Statusoftoken } from "../interface/types";

/***************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.fr>, Github: @fdervillez
* rights.ts
*
* Library of Typescript functions to interact with smart contract instances
* deployed on the blockchain : T2G_EntityFacet
* 
* Mains functions:
* - entityCallback: Array of callback functions called through the web service interactions
*   - entity | all : get the list of enitites' hash 
*   - entity | get : get the features for the given entity <hash>
*   - entity | set : create a new entity
* 
* Version
* 1.0.1 : Creation of the file
/**************************************************************************************/

/************************************************************************************** 
 * Array entityCallback[]
 * 
 * Array of objects { call, tag, help, callback } that contains the callback functions
 * that are performed when <call | tag> is passed through the web service interface
 * 
 * Inputs : arguments depends on the callback functions:
 *   - entity | get : [{ hash <Hash> }]
 *   - entity | set : [{ person <Boolean>, inputs <Object> }]
 *   - entity | all : no arguments 
 * 
 * For the set function, person is a flag that defines whether entity is to be created
 * as a physical person (true) or an entity. 
 * 
 * Object features to set or get depends on entity type (person or entity)
 * 
 *        name: string - name of the entity (both)
 *        uid?: string - uid of the entity (entity)
 *        email: string - email of the entity (both)
 *        postal: string - postal address of the entity (both)
 *        entity?: string - entity type (both)
 *        sector?: string - sector value (entity)
 *        unitType?: string - unitType of the entity (entity)
 *        unitSize?: string - unit size of the entity (entity)
 *        country: string - Country code of the entity (both)
 * 
 * Returned values : depends on the callback functions :
 *   - entity | get : list of { entity <Object>, hash: <Hash> } read entities 
 *   - entity | set : list of { inputs <Object>, tx: <Hash> } created entities 
 *                    with transaction hash
 *   - entity | all : list of enitites' hash 
 *
***************************************************************************************/

export const entityCallback : callbackType[] = [
    { 
    call: "entity",
    tag: "get", 
    help: "entity | get [ { hash: <regex2> }] -> Get the details of the entity with Id <hash>",
    callback: async ( inputs: Array<{  hash: typeof regex2  }> ) : Promise< Array<Object> | undefined> => {

        const entityABI : any = getABI("T2G_EntityFacet");

        var entityList : Object[] = [];
        
        for ( const input of inputs) {

            var value : `0x${string}` = "0x0";
        
            if ("T2G_EntityFacet" in encodeInterfaces) {
                try {                                
                    value = await globalState.clients.readContract({
                            address: diamondNames.Diamond.address,
                            abi: entityABI.abi,
                            functionName: "entity",
                            args: [ input.hash ]
                            });
                    }
                catch (error) {
                    return undefined;
                    }      
                
                // decodeOutput get the name of "TokenEntitySpecificABI"
                // 
                const decodeOutput = encodeInterfaces[<keyof typeof encodeInterfaces>"T2G_EntityFacet"].find(
                    (item) => item.function == "entity"
                    );
                
                // Get the ABI format to apply to the byte coded result in dataDecodeABI "TokenEntitySpecific"
                // abiItem { component: [ abiData ], name: string, type: string }
                // abiData { name, type, internalType }
                
                const obj = parseReadValues( 
                    (decodeOutput != undefined) ? dataDecodeABI[<keyof typeof dataDecodeABI>decodeOutput?.output] : [], 
                    value, 
                    (decodeOutput != undefined) 
                    );
        
                entityList.push(
                    Object.assign( { 
                        entity: obj
                        }, 
                        input
                        )
                    );        
                }
            }
        return entityList;
        }
    },
    {
    call: "entity",
    tag: "set", 
    help: "entity | set [ { person: <boolean>, inputs: <Object> }] -> Create a new entity (person or compagny) and returns the hash Id",
    callback: async ( inputs: Array<{  person: boolean, inputs: {
        name: string,
        uid?: string,
        email: string,
        postal: string,
        entity?: string,
        sector?: string,
        unitType?: string,
        unitSize?: string,
        country: string
        }  }> ) : Promise<Array<Object> | undefined> => {
        
        const [account] = await globalState.wallets.getAddresses()

        var entityList : Object[] = [];

        for ( const input of inputs) {

            var tx : typeof regex2 = NULL_HASH;

            var ins : {
                state: number,
                name: string,
                uid: string,
                email: string,
                postal: string,
                entity: number,
                sector: number,
                unitType: number,
                unitSize: number,
                country: number
                } = {
                    state: setIndex( Statusoftoken, 'None'),
                    name: input.inputs.name,
                    uid: (input.person) ? "NONE" : <string>input.inputs.uid,
                    email: input.inputs.email,
                    postal: input.inputs.postal,
                    entity: setIndex( TypeofEntityType, (input.person) ? "PERSON" : <string>input.inputs.entity),
                    sector: setIndex( TypeofSector, (input.person) ? "NONE" : <string>input.inputs.sector),
                    unitType: setIndex( TypeofUnitType, (input.person) ? "NONE" : <string>input.inputs.unitType),
                    unitSize: setIndex( TypeofUnitSize, (input.person) ? "NONE" : <string>input.inputs.unitSize),
                    country: setIndex( TypeCountries, input.inputs.country)
                    };
    
            tx = <typeof regex2>await encodeInputsAndSend( 
                "T2G_EntityFacet", 
                "setEntity", 
                [[...Object.values(ins) ]], 
                account 
                );  

            entityList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );        
            }
        return entityList;
        }
    },
    {
    call: "entity",
    tag: "all", 
    help: "entity | all [] -> Get the list of all entity hash ids that exists",
    callback: async ( inputs?: Array<any> ) : Promise<Array<string> | undefined> => {

        var entitiesIds : string[] = [];
    
        const entityABI : any = getABI("T2G_EntityFacet");
    
        try {                                
            return await globalState.clients.readContract({
                    address: diamondNames.Diamond.address,
                    abi: entityABI.abi,
                    functionName: "getEntities",
                    args: [ ]
                    });
            }
        catch (error) {
            return entitiesIds;
            }    
        }
    }
]