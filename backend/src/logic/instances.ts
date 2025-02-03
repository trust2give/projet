import { dataDecodeABI, abiData, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "../interface/types";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";

export const showInstance = async ( contract : contractRecord ) : Promise<Array<any>> => {
    return contract.abi.file.abi.map( 
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
    }