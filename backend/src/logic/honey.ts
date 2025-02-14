import { BaseError, Address, ContractFunctionRevertedError, encodeAbiParameters, decodeAbiParameters } from 'viem'
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "../T2G_Data";
import { getGWEI, getABI, writeStableContract, encodeInputsAndSend, writeFacetContract } from "../logic/instances";
import { Statusoftoken, dataDecodeABI, setIndex, honeyFeatures, pollenFeatures, TypeofUnit } from "../interface/types";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, NULL_HASH, regex, regex2, regex3 } from "../libraries/types";
import { accountType, accountRefs, globalState, setState } from "./states";

export const honeyCallback : callbackType[] = [
    { 
    call: "honey",
    tag: "mint", 
    help: "honey | mint [ { fund: <regex2>, entity: <regex2> }] -> Mint a new honey with entity Id <entity> & fund Id <fund>",
    callback: async ( inputs: Array<{ from: Account, fund: string, entity: string }> ) => {

        if (inputs.length == 0) return undefined;

        var mintList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        for ( const input of inputs) {
            var tx : typeof regex2 = NULL_HASH;

            if (Object.keys(accountRefs).includes(input.from)) {
                const fromAccount = (<accountType>accountRefs[input.from]);        

                tx = <typeof regex2>await writeFacetContract( 
                    "T2G_HoneyFacet", 
                    "mintHoney", 
                    [ 
                    fromAccount.address,
                    input.entity,
                    input.fund
                    ], 
                    account 
                    )
                }
            
            mintList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );
            }
        
        return mintList;
        }
    },
    { 
    call: "honey",
    tag: "approve", 
    help: "honey | approve [ { hash: <regex2> }] -> Get the details of the entity with Id <hash>",
    callback: async ( inputs: Array<{ from: Account, fund: string }> ) => {

        if (inputs.length == 0) return undefined;

        var approveList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        for ( const input of inputs) {
            var tx : typeof regex2 = NULL_HASH;

            if (Object.keys(accountRefs).includes(input.from)) {
                const fromAccount = (<accountType>accountRefs[input.from]);        

                tx = <typeof regex2>await writeFacetContract( 
                    "T2G_HoneyFacet", 
                    "mintHoney", 
                    [ 
                    input.fund,
                    fromAccount.address
                    ], 
                    account 
                    )
                }

            approveList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );
            }
        
        return approveList;
        }
    },
    { 
    call: "honey",
    tag: "transfer", 
    help: "honey | transfer [ { from: <Account>, fund: <regex2> }] -> Transfer the fund id ",
    callback: async ( inputs: Array<{ from: Account, fund: string }> ) => {

        if (inputs.length == 0) return undefined;

        var transferList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        for ( const input of inputs) {
            var tx : typeof regex2 = NULL_HASH;

            if (Object.keys(accountRefs).includes(input.from)) {
                const fromAccount = (<accountType>accountRefs[input.from]);        

                tx = <typeof regex2>await writeFacetContract( 
                    "T2G_HoneyFacet", 
                    "mintHoney", 
                    [ 
                    input.fund,
                    fromAccount.address
                    ], 
                    account 
                    )
                }

            transferList.push(
                Object.assign( { 
                    tx: tx
                    }, 
                    input
                    )
                );
            }
        
        return transferList;
        }
    }
]

export const fundCallback : callbackType[] = [
    { 
    call: "fund",
    tag: "set",
    help: "fund | set [ { from: <Account>, value: <number>, rate: <number> }] -> Create a new fund and return the Id <hash>",
    callback: async ( inputs: Array<{ from?: Account, value?: number, rate?: number }> ) : Promise<Object[] | undefined> => {

        if (inputs.length == 0) return undefined;

        var setList : Object[] = [];
                
        const [account] = await globalState.wallets.getAddresses()

        const gwei : Number | undefined = await getGWEI();
        if (gwei == undefined) return undefined;
        
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
                    BigInt(<number>input.value * (10 ** <number>gwei)),
                    ],
                    account 
                    )
    
                tx2 = <typeof regex2>await writeStableContract( 
                    "transfer", 
                    [ 
                    toAccount.address,
                    BigInt(<number>input.value * (10 ** <number>gwei)),
                    ],
                    fromAccount.address 
                    )
    
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
    tag: "all",
    help: "fund | all [ ] -> Get the list of fund Ids that exists",
    callback: async ( inputs?: Array<any> ) : Promise<Object[] | undefined> => {
        
        const honeyABI : any = getABI("T2G_HoneyFacet");
        
        const gwei : Number | undefined = await getGWEI();
        if (gwei == undefined) return undefined;
        console.log("GWEI decimals %d", gwei);
            
        var fundIds : string[] = [];

        try {                                
            fundIds = await globalState.clients.readContract({
                    address: diamondNames.Diamond.address,
                    abi: honeyABI.abi.file.abi,
                    functionName: "getFunds",
                    args: [ ]
                    });
            }
        catch (error) {
            return undefined;
            }      
                    
        try {                                        
            var funds : Object[] = [];
            for (const id of fundIds) {

                const fundValue : {
                    state: number,
                    value: bigint,
                    unit: number,
                    hash0: string,
                    rate: number
                    }[] = await globalState.clients.readContract({
                    address: diamondNames.Diamond.address,
                    abi: honeyABI.abi.file.abi,
                    functionName: "fund",
                    args: [ id ]
                    });
                
                funds.push(Object.assign({ id: id }, fundValue ));
                }
            return funds;
            }
        catch (error) {
            console.log(error)
            return undefined;
            }
        }
    }
    ]