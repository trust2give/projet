import fs from 'fs';
import { BaseError, http, createWalletClient, ContractFunctionRevertedError, Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { mainnet, hardhat } from 'viem/chains'
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, NULL_HASH } from "../libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, updateAccountBalance, assignAccounts } from "./states";
import { colorOutput, parseReadValues } from "../libraries/format";
import { dataDecodeABI, TypeCountries, 
    TypeofUnitType,
    TypeofUnitSize, 
    TypeofSector, 
    TypeofEntityType, 
    Statusoftoken } from "../interface/types";

export const getEntity = async ( hash: typeof regex2 ) : Promise<{
    name: string,
    uid?: string,
    email: string,
    postal: string,
    entity?: string,
    sector?: string,
    unitType?: string,
    unitSize?: string,
    country: string
    } | undefined> => {

    console.log("Read Entity %s", hash )

    const jsonEntity = fs.readFileSync( 
        (<contractRecord>facetNames.find( (item) => item.name == "T2G_EntityFacet")).abi.path, 
        'utf-8' 
        );
    
    const entityABI : any = JSON.parse(jsonEntity);
    
    var value : `0x${string}` = "0x0";
    
    if ("T2G_EntityFacet" in encodeInterfaces) {
        try {                                
            value = await globalState.clients.readContract({
                    address: diamondNames.Diamond.address,
                    abi: entityABI.abi,
                    functionName: "entity",
                    args: [ hash ]
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

        console.log(obj);
        }
    }


export const createEntity = async ( person: boolean, inputs: {
    name: string,
    uid?: string,
    email: string,
    postal: string,
    entity?: string,
    sector?: string,
    unitType?: string,
    unitSize?: string,
    country: string
    } ) : Promise<typeof regex2 | undefined> => {

    console.log("Create %s", (person) ? "person" : "entity", inputs)

    const jsonEntity = fs.readFileSync( 
        (<contractRecord>facetNames.find( (item) => item.name == "T2G_EntityFacet")).abi.path, 
        'utf-8' 
        );
    
    const entityABI : any = JSON.parse(jsonEntity);

    if ("T2G_EntityFacet" in encodeInterfaces) {

        const encodeInput = encodeInterfaces.T2G_EntityFacet.find((item) => item.function == "setEntity");
        
        if (encodeInput != undefined) {
            if ("_data" in encodeInput) {

                    const setIndex = ( list: string[], value: string) : number => {
                        const maxIndex = list.length;
                        if (maxIndex == 0) return 0;
                        const found : number = list.findIndex( (item) => item == value.toUpperCase() );
                        return (found < 0) ? 0 : found;
                        }

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
                            name: inputs.name,
                            uid: (person) ? "NONE" : <string>inputs.uid,
                            email: inputs.email,
                            postal: inputs.postal,
                            entity: setIndex( TypeofEntityType, (person) ? "PERSON" : <string>inputs.entity),
                            sector: setIndex( TypeofSector, (person) ? "NONE" : <string>inputs.sector),
                            unitType: setIndex( TypeofUnitType, (person) ? "NONE" : <string>inputs.unitType),
                            unitSize: setIndex( TypeofUnitSize, (person) ? "NONE" : <string>inputs.unitSize),
                            country: setIndex( TypeCountries, inputs.country)
                            };

                    const encodedData = encodeAbiParameters( 
                        dataDecodeABI[<keyof typeof dataDecodeABI>encodeInput?._data], [[
                        ...Object.values(ins)
                        ]] );

                    try {              
                        const walletClient = createWalletClient({
                            chain: hardhat,
                            transport: http('http://localhost:8545'), 
                            })
                        
                        const [account] = await walletClient.getAddresses()

                        console.log(account)
                        
                        const { request } = await globalState.clients.simulateContract({
                            address: diamondNames.Diamond.address,
                            abi: entityABI.abi,
                            functionName: "setEntity",
                            args: [ encodedData ],
                            account
                        })

                        console.log( request )
                        
                        return <typeof regex2>await walletClient.writeContract(request)

                        }
                    catch (err) {
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


export const getAllEntities = async () : Promise<string[] | undefined> => {

    console.log("Get All Entities");

    var entitiesIds : string[] = [];

    const jsonEntity = fs.readFileSync( 
        (<contractRecord>facetNames.find( (item) => item.name == "T2G_EntityFacet")).abi.path, 
        'utf-8' 
        );
    
    const entityABI : any = JSON.parse(jsonEntity);

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