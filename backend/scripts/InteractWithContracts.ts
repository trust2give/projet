import hre from "hardhat";
import { Address, decodeAbiParameters  } from 'viem'
import { dataDecodeABI } from "./interface/types";
import { diamondNames, contractSet, encodeInterfaces } from "./T2G_Data";
import { parseAndDisplayInputAndOutputs, accountIndex } from "./libraries/utils";
import { colorOutput, displayAddress, displayContract } from "./libraries/format";
import { contractRecord, diamondCore, rwRecord, rwType, errorFrame, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "./libraries/types";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithContracts.ts --network localhost

    
export async function InteractWithContracts(rwItem : rwRecord, from: Account, accountRefs : Object, facets: menuRecord[], pad: number ) {
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    var sender: number | undefined = await accountIndex(accountRefs, from, true);
    if (sender == undefined) sender = 0;

    console.log("Enter InteractWithContracts app", sender)

    // On transcrit les arguments s'ils existent : type Account
    const newArgs = rwItem.values;
    // On format les valeurs pour affichage en stdout 
    //console.log(rwItem, accountRefs, facets, "\n")                                       
    const dispArgs = parseAndDisplayInputAndOutputs( rwItem.args, newArgs, accountRefs, 10 );
    //console.log("sortie", dispArgs)
    type refKeys = keyof typeof accountRefs;

    //console.log( label, from, sender, accountRefs, dispArgs )

    var log : string  = displayAddress( facets[0].instance.address, "yellow", accountRefs, pad );
    log = log.concat( ":", displayContract(rwItem.contract, "cyan", 15), "::" );
    log = log.concat( displayAddress( <Address>(accountRefs[<refKeys><string>from].address), "magenta", accountRefs, pad ));
    log = log.concat( ":: ", ("label" in rwItem) ? <string>rwItem.label : rwItem.function );
    log = log.concat( "[ ", colorOutput(dispArgs, "blue", true)," ] >> " );

    try {
        if (rwItem.rwType == rwType.WRITE) {

            //console.log("Estimate")
            
            const gas = await publicClient.estimateContractGas({ address: facets[0].instance.address, abi: facets[0].instance.abi, functionName: rwItem.function, args: newArgs });

            colorOutput(`Estimated Gas :: ${gas}`, "blue");

            //console.log("entrée", rwItem.function, newArgs, wallets[sender])

            const method = await facets[0].instance.write[rwItem.function](newArgs, wallets[sender] );

            //console.log("sortie", method)

            const eventFacetLogs = await publicClient.getContractEvents({ abi: facets[0].instance.abi, address: facets[0].instance.address, })
            const eventSCLogs = await publicClient.getContractEvents({ abi: facets[1].instance.abi, address: facets[1].instance.address, })

            //console.log("event", eventFacetLogs, eventSCLogs)

            log = log.concat( colorOutput( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : "[Tx:".concat( method.substring(0, 6), "..]"), "green", true ));

            for ( const event of eventFacetLogs) {
                if (event.transactionHash == method) {
                    const EvtInputs = facets[0].instance.abi.filter((item) => item.type == "event" && item.name == event.eventName)[0].inputs; //.map((item) => item.inputs);
                    const dispEvents = parseAndDisplayInputAndOutputs( EvtInputs, Object.values(event.args), accountRefs, pad );
                    log = log.concat( colorOutput( "\n >> Event ".concat( event.eventName, dispEvents, " "), "yellow", true ));                
                    //console.log(event.args)               
                }
                }

            for ( const event of eventSCLogs) {
                const EvtInputs = facets[1].instance.abi.filter((item) => item.type == "event" && item.name == event.eventName)[0].inputs; //.map((item) => item.inputs);
                const dispEvents = parseAndDisplayInputAndOutputs( EvtInputs, Object.values(event.args), accountRefs, pad );
                log = log.concat( colorOutput( "\n >> Event ".concat( event.eventName, dispEvents, " "), "yellow", true )); 
                //console.log(event.args)               
                }
            } 
        else if (rwItem.rwType == rwType.READ) {
            const raw : any = await facets[0].instance.read[rwItem.function]( newArgs, wallets[sender] );
            
            var result = (rwItem.outcome.length > 1) ? raw : [ raw ];
            var decodeFlag = false;
            var beacon;
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
                            const values : Array<any> = decodeAbiParameters( ABIformat, result[0] );
                            // values is a an array of the outcomes
                            
                            beacon = values.map((val) => {
                                if (Array.isArray(val)) {
                                    return "\n".concat(parseAndDisplayInputAndOutputs( ABIformat, [val], accountRefs, pad ));
                                }
                                else if (typeof val == "object") {
                                    return "\n[".concat( Object.entries(val).map((item) => {
                                        if ("components" in ABIformat[0]) {
                                            const abi = ABIformat[0].components.find((el) => el.name == item[0])
                                            if ("components" in abi) return "\n".concat(parseAndDisplayInputAndOutputs( abi.components, Object.values(item[1]), accountRefs, pad ));
                                            else return "\n".concat(parseAndDisplayInputAndOutputs( [ abi ], [ item[1] ], accountRefs, pad ));
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
            if (!decodeFlag) beacon = parseAndDisplayInputAndOutputs( rwItem.outcome, result, accountRefs, pad );

            if (Array.isArray(beacon)) log = log.concat( "\n[ ", colorOutput( beacon.join("|\n"), "green", true )," ]" );
            else log = log.concat( colorOutput( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "|\n" ) : <string>beacon, "green", true) );
            }

        // We display the log
        colorOutput(log);

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
                            if (cur.match(regex)) return acc.concat( displayAddress( cur, "yellow", accountRefs, pad ), " " );
                            if (cur.match(regex2)) return acc.concat( displayAddress( cur, "cyan", accountRefs, pad ), " " );
                            }
                        else if (typeof cur == "bigint") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
                        else if (typeof cur == "boolean") return acc.concat( colorOutput( (cur) ? "True" : "False", "cyan", true ), " " );
                        else if (typeof cur == "number") return acc.concat( colorOutput( `${cur}`, "cyan", true ), " " );
                        return acc.concat( colorOutput( cur, "cyan", true ), " " );
                        }, "[ " ), "blue", true), " ]" );
                    }
                case "contractAddress": {
                    return last.concat( colorOutput( displayAddress( item[1], "yellow", accountRefs, pad ), "yellow", true) );
                    }
                case "functionName": {
                    return last.concat( "[", colorOutput( item[1], "magenta", true), "] " );
                    }
                default:
                    return last;
                }
            }, colorOutput( ">> " , "red", true) );
        console.log(errorDisplay);
        }    
    }

