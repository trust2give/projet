const hre = require("hardhat");
import { keccak256, toHex, Address, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces, getWalletAddressFromSmartContract } from "../T2G_Data";
import { TypeCountries, 
        TypeofUnitType,
        TypeofUnitSize, 
        TypeofSector, 
        TypeofEntityType, 
        Statusoftoken, 
        dataDecodeABI } from "../interface/types";
import { colorOutput, displayAccountTable } from "../libraries/format";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "./states";
import { getStableCoinBalance } from "./balances";
import { InteractWithContracts } from "../InteractWithContracts";
import { setrwRecordFromSmart } from "../logic/instances";

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
    } ) => {

    console.log("Create %s", (person) ? "person" : "entity")
    
    const setEntity :rwRecord = await setrwRecordFromSmart( "setEntity", "Entity");
    const entity :rwRecord = await setrwRecordFromSmart( "entity", "Entity");

    try {                        
        type refKeys = keyof typeof accountRefs;
        
        if ("T2G_EntityFacet" in encodeInterfaces) {
            const encodeInput = encodeInterfaces.T2G_EntityFacet.find((item) => item.function == "setEntity");
            console.log('dsdsdsd')
            type decKeys = keyof typeof dataDecodeABI;

            if (encodeInput != undefined) {
                if ("_data" in encodeInput) {
                    if (encodeInput._data in dataDecodeABI) {

                        const setIndex = ( list: string[], value: string) : number => {
                            const maxIndex = list.length;
                            if (maxIndex == 0) return 0;
                            const found : number = list.findIndex( (item) => item == value.toUpperCase() );
                            return (found < 0) ? 0 : found;
                            }

                        console.log('dsdsdsd')

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
                            dataDecodeABI[<decKeys>encodeInput._data], [[
                            ...Object.values(ins)
                            ]] );

                        setEntity.values = [ 
                            encodedData 
                            ];
            
                        await InteractWithContracts( 
                            <rwRecord>setEntity, 
                            Account.A0, 
                            false 
                            );   

                        const tx2 = keccak256( toHex(ins.name.concat( ins.uid, ins.email, `${BigInt(ins.country)}`)) );
//
                        console.log(tx2)
                        entity.values = [ 
                            tx2 
                            ];

                        const value : {
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
                            }[] = await InteractWithContracts( <rwRecord>entity, Account.A0, true );   

                        colorOutput( "> ".concat(
                            "[".concat(tx2,"] "), 
                            " => ", 
                            `${value[0].name} `,
                            `${value[0].uid} `,
                            `${value[0].email} `,
                            `${value[0].postal} `,
                            TypeofEntityType[value[0].entity], " ", 
                            TypeofSector[value[0].sector], " ",
                            TypeofUnitType[value[0].unitType], " ",
                            TypeofUnitSize[value[0].unitSize], " ",
                            TypeCountries[value[0].country]
                                ), "cyan");
                        }
                    }
                }
            }

        }
    catch (error) {
        console.log(error)
        //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
        }
    }

export const getAllEntities = async ( silent?: boolean ) : Promise<string[] | undefined> => {
    console.log("Get All Entities");

    const getEntities :rwRecord = await setrwRecordFromSmart( "getEntities", "Entity");
    const entity :rwRecord = await setrwRecordFromSmart( "entity", "Entity");

    try {                        
        getEntities.values = [];

        const entitiesIds : string[] = await InteractWithContracts( <rwRecord>getEntities, Account.A0, true );   
        
        if (!silent || silent == undefined) {
            var rank = 0;
            for (const id of entitiesIds) {
                entity.values = [
                    id
                    ];

                const value : {
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
                    }[] = await InteractWithContracts( <rwRecord>entity, Account.A0, true );   
                    
                const color : string = ["blue", "yellow", "cyan", "green", "white", "red", "red"][value[0].state];

                colorOutput( `> ${rank++} => `.concat(
                    "[".concat(id,"] "), 
                    " => ", 
                    `${value[0].name} `,
                    `${value[0].uid} `,
                    `${value[0].email} `,
                    `${value[0].postal} `,
                    TypeofEntityType[value[0].entity], " ", 
                    TypeofSector[value[0].sector], " ",
                    TypeofUnitType[value[0].unitType], " ",
                    TypeofUnitSize[value[0].unitSize], " ",
                    TypeCountries[value[0].country]
                    ), color);
                }
            }
        return entitiesIds;
        }
    catch (error) {
        console.log(error)
        //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
        }
    }