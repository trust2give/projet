import hre from "hardhat";
import { Address, decodeAbiParameters  } from 'viem'
import { dataDecodeABI } from "./interface/types";
import { diamondNames, contractSet, encodeInterfaces, smart } from "./T2G_Data";
import { parseAndDisplayInputAndOutputs, accountIndex } from "./libraries/utils";
import { colorOutput, displayAddress, displayContract } from "./libraries/format";
import { contractRecord, diamondCore, rwRecord, rwType, errorFrame, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "./libraries/types";
import { accountType, accountRefs, globalState, setState, addAccount, account, updateAccountBalance, assignAccounts } from "./logic/states";
import { sign } from "viem/_types/accounts/utils/sign";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithContracts.ts --network localhost

export const setRecord = (tag: string, name : string) : rwRecord => {
    const record = <menuRecord>smart.find((el: menuRecord ) => el.tag == tag);
    const fct = record.instance.abi.filter((item) => (item.type == "function" && item.name == name))[0];
    
    return <rwRecord>{ 
        rwType: (fct.stateMutability == "view" || fct.stateMutability == "pure") ? rwType.READ : rwType.WRITE,
        contract: record.contract,
        function: fct.name, 
        args: fct.inputs,
        values: [],
        outcome: fct.outputs };
        }             

    
export async function InteractWithContracts(rwItem : rwRecord, from: Account, facets: menuRecord, silent?: boolean ) {
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    var sender: number | undefined = await accountIndex(accountRefs, from, true);
    if (sender == undefined) sender = 0;

    if (!silent) console.log("Enter InteractWithContracts app", sender)

    // On transcrit les arguments s'ils existent : type Account
    const newArgs = rwItem.values;
    // On format les valeurs pour affichage en stdout 
    //console.log(rwItem.args, newArgs, "\n")                                       
    const dispArgs = parseAndDisplayInputAndOutputs( rwItem.args, newArgs, accountRefs, 10 );
    //console.log("sortie", dispArgs)
    type refKeys = keyof typeof accountRefs;

    const eur = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");

    //console.log( label, from, sender, accountRefs, dispArgs )

    var log : string  = displayAddress( facets.instance.address, "yellow", <number>globalState.pad );
    log = log.concat( ":", displayContract(rwItem.contract, "cyan", 15), "::" );
    log = log.concat( displayAddress( <Address>(accountRefs[<refKeys><string>from].address), "magenta", <number>globalState.pad ));
    log = log.concat( ":: ", ("label" in rwItem) ? <string>rwItem.label : rwItem.function );
    log = log.concat( "[ ", colorOutput(dispArgs, "blue", true)," ] >> " );

    try {
        if (rwItem.rwType == rwType.WRITE) {

            const gas = await publicClient.estimateContractGas({ address: facets.instance.address, abi: facets.instance.abi, functionName: rwItem.function, args: newArgs });

            colorOutput(`Estimated Gas :: ${gas}`, "blue");

            const method = await facets.instance.write[rwItem.function](newArgs, wallets[sender] );

            const eventFacetLogs = await publicClient.getContractEvents({ abi: facets.instance.abi, address: facets.instance.address, })
            const eventSCLogs = await publicClient.getContractEvents({ abi: eur.instance.abi, address: eur.instance.address, })

            log = log.concat( colorOutput( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : "[Tx:".concat( method.substring(0, 6), "..]"), "green", true ));

            for ( const event of eventFacetLogs) {
                if (event.transactionHash == method) {
                    const EvtInputs = facets.instance.abi.filter((item) => item.type == "event" && item.name == event.eventName)[0].inputs; //.map((item) => item.inputs);
                    const dispEvents = parseAndDisplayInputAndOutputs( EvtInputs, Object.values(event.args), accountRefs, <number>globalState.pad );
                    log = log.concat( colorOutput( "\n >> Event ".concat( event.eventName, dispEvents, " "), "yellow", true ));                
                    }
                }

            for ( const event of eventSCLogs) {
                const EvtInputs = eur.instance.abi.filter((item) => item.type == "event" && item.name == event.eventName)[0].inputs; //.map((item) => item.inputs);
                const dispEvents = parseAndDisplayInputAndOutputs( EvtInputs, Object.values(event.args), accountRefs, <number>globalState.pad );
                log = log.concat( colorOutput( "\n >> Event ".concat( event.eventName, dispEvents, " "), "yellow", true )); 
                }

                // We display the log
            if (!silent) colorOutput(log);
            return method;            
            } 
        else if (rwItem.rwType == rwType.READ) {
            const raw : any = await facets.instance.read[rwItem.function]( newArgs, wallets[sender] );
            var result = (rwItem.outcome.length > 1) ? raw : [ raw ];
            var decodeFlag = false;
            var beacon = undefined;
            var values : any = raw;

            //console.log(raw)

            // we check if the result returned by the function is expected to be abo.encoded or not
            // This is flagged in encodedInterface object where all concerned contract / functions are set
            if (rwItem.contract in encodeInterfaces) {
                type encKeys = keyof typeof encodeInterfaces;
                
                const decodeOutput = encodeInterfaces[<encKeys>rwItem.contract].find((item) => item.function == rwItem.function);

                // We check that the related function is concerned or not by the abi.encode
                if (decodeOutput != undefined) {
                    if ("output" in decodeOutput) {
                        // encode is applied to structs and outcomes
                        // We check that the abi definition of the struct or outcome is present.
                        if (decodeOutput.output in dataDecodeABI) {
                            // to avoid warning in typescript code
                            type decKeys = keyof typeof dataDecodeABI;
                            // We get the abi format of the outcome or struct
                            const ABIformat =  dataDecodeABI[<decKeys>decodeOutput.output];
                            // values is a an array of the outcomes
                            values = decodeAbiParameters( ABIformat, result[0] );
                            
                            beacon = values.map((val) => {
                                if (Array.isArray(val)) {
                                    return "\n".concat(parseAndDisplayInputAndOutputs( ABIformat, [val], accountRefs, <number>globalState.pad ));
                                }
                                else if (typeof val == "object") {
                                    return "\n[".concat( Object.entries(val).map((item) => {
                                        if ("components" in ABIformat[0]) {
                                            const abi = ABIformat[0].components.find((el) => el.name == item[0])
                                            if ("components" in abi) return "\n".concat(parseAndDisplayInputAndOutputs( abi.components, Object.values(item[1]), accountRefs, <number>globalState.pad ));
                                            else return "\n".concat(parseAndDisplayInputAndOutputs( [ abi ], [ item[1] ], accountRefs, <number>globalState.pad ));
                                        }
                                    }).join("|"), "\n]");
                                }
                            }).join("|"), "\n]";
                            decodeFlag = true;
                            }
                        }
                    }
                }

            // For the results not concerned by the encode function
            if (!decodeFlag) beacon = parseAndDisplayInputAndOutputs( rwItem.outcome, result, accountRefs, <number>globalState.pad );

            //console.log(values, beacon, silent, decodeFlag, rwItem.outcome, result)

            if (Array.isArray(beacon)) log = log.concat( "\n[ ", colorOutput( beacon.join("|\n"), "green", true )," ]" );
            else log = log.concat( colorOutput( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "|\n" ) : <string>beacon, "green", true) );
            // We display the log
            if (!silent || silent == undefined) colorOutput(log);
            return values;
            }
    } catch (error) {
        console.log(error)
        const errorLabel : Array<any> = Object.entries(<errorFrame>error);
        const errorDisplay : string = errorLabel.reduce( (last, item) => {
            switch (item[0]) {
                case "metaMessages": {
                    return last.concat( colorOutput(item[1][0], "red", true), " " );
                    }
                case "args": {
                    return last.concat( colorOutput( item[1].reduce( ( acc, cur) => {
                        if (typeof cur == "string") {
                            if (cur.match(regex)) return acc.concat( displayAddress( cur, "yellow", <number>globalState.pad ), " " );
                            if (cur.match(regex2)) return acc.concat( displayAddress( cur, "cyan", <number>globalState.pad ), " " );
                            }
                        else if (typeof cur == "bigint") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
                        else if (typeof cur == "boolean") return acc.concat( colorOutput( (cur) ? "True" : "False", "cyan", true ), " " );
                        else if (typeof cur == "number") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
                        return acc.concat( colorOutput( cur, "cyan", true ), " " );
                        }, "[ " ), "blue", true), " ]" );
                    }
                case "contractAddress": {
                    return last.concat( colorOutput( displayAddress( item[1], "yellow", <number>globalState.pad ), "yellow", true) );
                    }
                case "functionName": {
                    return last.concat( "[", colorOutput( item[1], "magenta", true), "] " );
                    }
                default:
                    return last;
                }
            }, colorOutput( ">> " , "red", true) );
        console.log(errorDisplay);
        return undefined;
        }    
    }

