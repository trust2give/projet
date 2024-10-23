import hre from "hardhat";
import { diamondNames } from "./T2G_Data";
import { Address, InvalidSerializedTransactionTypeError } from "viem";
import { rwType, rwRecord, parseRwRecordForSpecificItemWithDefaultValue, parseOutcome, Account, Value } from "./InteractWithContracts";

//import decodeMethod  from "abi-decoder-typescript"
//import { bigint } from "hardhat/internal/core/params/argumentTypes";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithContracts.ts --network localhost

// Expression régulière pour détecter une adresse ETH 
const regex = '^(0x)?[0-9a-fA-F]{40}$';
const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

var storage : object = {};

export async function InteractWithERC20Contract(rwItem : rwRecord, contractAddress: Address, accountList: Address[] ) {
    //const accounts = await hre.ethers.getSigners();
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    console.log("Enter InteractWithERC20Contract app")

    const sender: number = parseRwRecordForSpecificItemWithDefaultValue( "sender", rwItem, 0);

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
                    //console.log(rwItem.args);

                    var newArgs = rwItem.args.map((x) => {
                        if (Object.values(Account).includes(x)) return accountList[x.split('_')[0]];
                        else if (x === Value.Account) return accountList[account.split('_')[0]];
                        else if (x === Value.Index) return index;
                        else if (x === Value.TokenId) return token;
                        else if (x === Value.Address) return addr;
                        return x;
                    });
                    
                    const dispArgs : string = newArgs.map((arg, i) => {
                        if (Object.values(Account).includes(rwItem.args[i]) || rwItem.args[i] === Value.Account) return "@".concat( arg.substring(0, 6), "..")
                        if (rwItem.args[i] === Value.Index) return "Index ".concat( arg )
                        if (rwItem.args[i] === Value.TokenId) return "Id ".concat( arg )
                        if (rwItem.args[i] === Value.Address) return "@".concat( arg.substring(0, 6), "..")
                        return arg;
                        }).join("| ");

                    var log : string  = "[R_@".concat( facet.address.substring(0, 6), "..]:", rwItem.contract.padEnd(15, ' '), "::");
                    log = log.concat( "[S_@", accountList[sender].substring(0, 6), "..]::");
                    log = log.concat( ("label" in rwItem) ? <string>rwItem.label : rwItem.function );
                    log = log.concat( "[ ", dispArgs," ] >> " );

                    try {
                        if (rwItem.rwType == rwType.WRITE) {
                            //console.log(newArgs);
                            const method = await facet.write[rwItem.function](newArgs, rwItem.fees ? { 
                                value: BigInt(rwItem.fees)
                                }  : null, wallets[sender] );

                            const eventLogs = await  publicClient.getContractEvents({
                                abi: facet.abi,
                                address: contractAddress,
                                })
                                
                            log = log.concat( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : "[Tx:".concat( method.substring(0, 6), "..]"));

                            for ( const event of eventLogs) {
                                if (event.transactionHash == method) {
                                    log = log.concat( " >> Event ", event.eventName, "[ ", Object.values(event.args).join("| "), " ]" );                
                                    }
                                }
                            //console.log(eventLogs)
                            } 
                        else if (rwItem.rwType == rwType.READ) {
                            //console.log("Read")
                            var result : any = await facet.read[rwItem.function]( newArgs, wallets[sender] );

                            var beacon : any = Array.isArray(result) ? result : [ result ];
                            //console.log(beacon)

                            storage[rwItem.function] = parseRwRecordForSpecificItemWithDefaultValue( "store", rwItem, [],  beacon);
                            //console.log(storage[rwItem.function])

                            beacon = parseOutcome( rwItem.outcome, result, rwItem);
                            
                            //console.log("Out", beacon)
                            if (Array.isArray(beacon)) log = log.concat( "[ ", beacon.join("| ")," ]" );
                            else log = log.concat( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "| " ) : <string>beacon)
                            }

                            console.info(log);
                        
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

