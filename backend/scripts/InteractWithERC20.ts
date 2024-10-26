import hre from "hardhat";
import { Address } from "viem";
import { rwType, rwRecord } from "./InteractWithContracts";
import fs from 'fs';
import { contractSet } from "./T2G_Data";
import { colorOutput, 
    parseAndConvertInputArgs, 
    parseAndDisplayInputArgs, 
    displayAddress, displayContract, 
    parseOutcome, 
    parseRwRecordForSpecificItemWithDefaultValue, 
    storage, NULL_ADDRESS, Account, 
    showObject, contractRecord} from "./T2G_utils";

//import decodeMethod  from "abi-decoder-typescript"
//import { bigint } from "hardhat/internal/core/params/argumentTypes";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithERC20Contract.ts --network localhost


export function readLastContractSetJSONfile() : contractRecord[] {
    const jsonString = fs.readFileSync('./scripts/ContractSet.json', 'utf-8');
    const Items : contractRecord[] = JSON.parse(jsonString);
    const item : contractRecord = <contractRecord>Items.pop();
    if (item.name != "EUR") throw("Bad Record Name for EUR StableCoin Address recovery :: ".concat(item.name));
    //colorOutput("Recall Last EUR Smart Contract Record >> ".concat(JSON.stringify(item)), "cyan");
    contractSet[0] = <contractRecord>item;
    return contractSet;
    }

export async function InteractWithERC20Contract(rwItem : rwRecord, contractAddress: Address, accountList: Address[] ) {
    //const accounts = await hre.ethers.getSigners();
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    const trace : boolean = false;

    if (trace) console.log("[TRACE] Enter InteractWithERC20Contract app");

    const sender: number = parseRwRecordForSpecificItemWithDefaultValue( "sender", rwItem, 0);

    if (trace) console.log(`[TRACE] Sender : ${sender}`);

    const facet = await hre.viem.getContractAt(
        rwItem.contract,
        contractAddress,
        { client: { wallet: wallets[sender] } }
        );

    // On gère les liste de addresses
    const rangeAddress : Address[] = parseRwRecordForSpecificItemWithDefaultValue( "loopAddress", rwItem, [NULL_ADDRESS]);

    // On gère les liste de Accounts
    const rangeAccount : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopAccount", rwItem, [Account.A0]);

    // On gère les liste des Index si elle existe dans le record
    const rangeIndex : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopIndex", rwItem, [0]);

    // On récupère les liste de TokenId si elle existe dans le record
    const rangeToken : number[] = parseRwRecordForSpecificItemWithDefaultValue( "loopTokenId", rwItem, [0]);

    for ( const account of rangeAccount) {
        for ( const token of rangeToken) {
            for ( const index of rangeIndex) {                    
                for ( const addr of rangeAddress) {
                    // On transcrit les arguments s'ils existent : type Account
                    const newArgs = parseAndConvertInputArgs( rwItem, accountList, account, index, token, addr );
                    // On format les valeurs pour affichage en stdout                                        
                    const dispArgs = parseAndDisplayInputArgs( rwItem, newArgs )
                    
                    var log : string  = displayAddress( facet.address, "yellow", 10 );
                    log = log.concat( ":", displayContract(rwItem.contract, "cyan", 15), "::" );
                    log = log.concat( displayAddress( accountList[sender], "magenta", 10 ));
                    log = log.concat( ":: ", ("label" in rwItem) ? <string>rwItem.label : rwItem.function );
                    log = log.concat( "[ ", colorOutput(dispArgs, "blue", true)," ] >> " );

                    try {
                        if (rwItem.rwType == rwType.WRITE) {

                            if (trace) console.log(`[TRACE] Function : ${rwItem.function}`, facet.abi);
                            if (trace) console.log(`[TRACE] Args : ${showObject( newArgs, true )}`);
                            if (trace) console.log(`[TRACE] Fees : ${rwItem.fees ? { value: BigInt(rwItem.fees) }  : null}`);
                            if (trace) console.log(`[TRACE] Wallet : ${showObject( wallets[sender], true )}`);

                            const method = await facet.write[rwItem.function](newArgs, wallets[sender] );

                            if (trace) console.log(`[TRACE] Write return : ${method}`);

                            const eventLogs = await  publicClient.getContractEvents({
                                abi: facet.abi,
                                address: contractAddress,
                                })
                                
                            log = log.concat( colorOutput( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : "[Tx:".concat( method.substring(0, 6), "..]"), "green", true ));

                            if (trace) console.log(`[TRACE] Write return : ${showObject( eventLogs, true )}`);

                            for ( const event of eventLogs) {
                                if (event.transactionHash == method) {
                                    log = log.concat( colorOutput( "\n >> Event ".concat( event.eventName, "[ ", Object.values(event.args).join("| "), " ]"), "yellow", true ));                
                                    }
                                }
                            } 
                        else if (rwItem.rwType == rwType.READ) {
                            //console.log("Read")
                            var result : any = await facet.read[rwItem.function]( newArgs, wallets[sender] );

                            var beacon : any = Array.isArray(result) ? result : [ result ];

                            if (trace) console.log(`[TRACE] Read return : ${showObject( beacon, true )}`);

                            storage[rwItem.function] = parseRwRecordForSpecificItemWithDefaultValue( "store", rwItem, [],  beacon);

                            beacon = parseOutcome( rwItem.outcome, result, rwItem);

                            if (trace) console.log(`[TRACE] Parsed outcome : ${showObject( beacon, true )}`);

                            if (Array.isArray(beacon)) log = log.concat( "[ ", colorOutput( beacon.join("| "), "green", true )," ]" );
                            else log = log.concat( colorOutput( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "| " ) : <string>beacon, "green", true) );
                            }

                            colorOutput(log);
                        
                        } catch (error) {
                            console.log(Object.entries(error));
                            log = log.concat( "[@", error.contractAddress.substring(0, 12), "...]:", error.functionName, "::");
                            log = log.concat( "[", error.args.join("|"),"] >> " );
                            log = log.concat( <string>error.metaMessages, "\n");
                            console.error(log); 
                            }
                    }     
                }   
            }          
        }    
    }

