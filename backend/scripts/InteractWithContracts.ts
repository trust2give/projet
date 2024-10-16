import hre from "hardhat";
import { diamondNames } from "./T2G_Data";
import { saveEvents } from "./evListener";
import { Address, InvalidSerializedTransactionTypeError } from "viem";
import decodeMethod  from "abi-decoder-typescript"
import { bigint } from "hardhat/internal/core/params/argumentTypes";

/// npx hardhat node
/// npx hardhat run .\scripts\InteractWithContracts.ts --network localhost

// Expression régulière pour détecter une adresse ETH 
const regex = '^(0x)?[0-9a-fA-F]{40}$';
const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

/// enum type qui permet de définir si une interaction est de type READ ou WRITE
enum rwType { READ, WRITE }

/// enum type qui permet de sélectionner les 6 premiers @Wallet du node hardhat
enum Account { A0 = "0_", A1 = "1_", A2 = "2_", A3 = "3_", A4 = "4_", A5 = "5_", A6 = "6_" }
/// enum type qui permet dans le tableau args de définir une liste de valeur plutôt qu'une valeur spécifique
enum Value { TokenId = "T__", Index = "I__", Account = "A__" }

const Typeoftoken : string[] = ["None", "Pollen", "Honey", "Nektar", "Cell"]

const Statusoftoken : string[] =  [ "None", "Draft", "Active", "Burnt", "Canceled"]

/// loopIndex: <null> | [index] | string -> [facultatif] Défini soit un ensemble de valeurs d'index dans le cas d'un appel multiple d'une fonction
///                                         qui a input des valeurs d'index, ou la référence à une valeur dans <storage> pour définir
///                                         un intervalle de valeur [0... Max] pour la liste des index. 
/// loopTokenId: <null> | [TokenId] | string -> [facultatif] Meme règle que loopIndex pour une liste de valeur de TokenId
/// Si l'un ou l'autre attibut est présent, alors dans la valeur args [], un des inputs est définit par Enum(Valeur | Account)
export type rwRecord = { 
    rwType: rwType,
    contract: string, 
    function: string, 
    args?: Array<any>,
    sender?: Account,
    fees?: number | bigint,
    loopTokenId? : number[] | string,   // Permet de gérer une liste d'inputs [...]de type index ou [0...Max] => Max : valeur dans storge
    loopIndex? : number[] | string,     // Permet de gérer une liste d'inputs [...]de type index ou [0...Max] => Max : valeur dans storge
    loopAccount? : Account[] | string,  // Permet de gérer une liste d'inputs [...]de type @Accounts ou valeur @Account stockée dans storge
    label?: string,                     // Affichage alternatif au nom de la fonction dans la console de log pour les résultats des appels
    decode?: string,                    // Flag pour décoder le résultat avec ABI.decode ou pas
    store?: boolean,                    // flag store pour définir si le résultat d'un READ doit être stocké pour être réutilisé par ailleurs
    outcome: string[]                   // flag qui type les résultats retournés par un READ [] : valeurs "array", "string", "bool", "bigint", "address" ou le nom d'une variable Typeoftoken ou StatusOfToken
  }


const rwList : rwRecord[] = [
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "beacon_HoneyFacet", args: [], label: "Beacon", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "name", store: true, args: [ Value.Index ], loopIndex: [0,1,2, 3, 4], label: "Nom du Token", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "symbol", store: true, args: [ Value.Index ], loopIndex: [0,1,2, 3, 4], label: "Symbol du Token", outcome: [ "string"] },
    { rwType: rwType.READ, contract: "OwnershipFacet", function: "owner", args: [], label: "@owner of T2G Diamond", outcome: [ "address"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "ownerOf", args: [ Value.TokenId ], loopTokenId: [4,5,6,7], label: "@owner of Honey Token", outcome: [ "address"] },
    //{ rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "mintHoney", fees: 1234, args: [ Account.A2, Value.TokenId ], loopTokenId: [4,5,6,7], sender: Account.A0, outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Account.A2], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract pool", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "totalSupply", args: [], store: true, label: "Total tokens minted", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "tokenByIndex", args: [ Value.Index ], loopIndex: "totalSupply", label: "TokenId @ Index ", outcome: [ "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A0, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A2, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "bigint"] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "honey", sender: Account.A3, args: [ Value.Index ], loopIndex: [4,5,6, 7], label: "HONEY", outcome: [ "Typeoftoken", "Statusoftoken", "bigint"] },
    { rwType: rwType.WRITE, contract: "T2G_HoneyFacet", function: "setBlackOrWhiteList", sender: Account.A1, args: [ Value.Index, 5, false, false ], loopIndex: [4], label: "Set Whitelist", outcome: [] },
    { rwType: rwType.READ, contract: "T2G_HoneyFacet", function: "getBlackOrWhiteList", args: [ Value.Index, false ], loopIndex: [4], label: "Get Whitelist", outcome: [ "array"]  },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], label: "Token Nb per account ", outcome: [ "bigint"] },
    //{ rwType: rwType.WRITE, contract: "ERC721Facet", function: "approve", args: [ Account.A0, Value.Index ], loopIndex: [4,5,6, 7], sender: Account.A2, outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "getApproved", args: [Value.TokenId], loopTokenId: [4,5,6,7], sender: Account.A0, outcome: [ "address"] },
    //{ rwType: rwType.WRITE, contract: "ERC721Facet", function: "setApprovalForAll", args: [Value.Account, true], loopAccount: [Account.A0, Account.A1], sender: Account.A2, outcome: [] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "isApprovedForAll", args: [Account.A2, Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], sender: Account.A0, outcome: [ "bool"] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "contractURI", args: [1], decode: 'data:application/json;base64,', outcome: [ "string"] },
    //{ rwType: rwType.WRITE, contract: "ERC721Facet", function: "safeTransferFrom", args: [ Account.A0, Account.A2, 1 ], outcome: [] }
    ]

var storage : object = {};

async function main() {
    const accounts = await hre.ethers.getSigners();
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    //const args = process.argv.slice(2);
    //var saisie = prompt('Saisir quelque chose');

    console.log("Enter InteractContract app", wallets)

    var facet;
    for (const rwItem of rwList) {

        var sender: number = 0;
        if ("sender" in rwItem) {
            if (Object.values(Account).includes(rwItem.sender)) {       
                sender = Number((<string>rwItem.sender).split('_')[0]);
                }
            }
        facet = await hre.viem.getContractAt(
            rwItem.contract,
            (<Address>diamondNames.Diamond.address),
            { client: { wallet: wallets[sender] } }
            );


            // On gère les liste de Accounts
            var rangeAccount : Account[] | string[] = [Account.A0];
            if ("loopAccount" in rwItem) {
                if (typeof rwItem.loopAccount === "string") {
                    if (<string>rwItem.loopAccount in storage) {
                        if (String(storage[<string>rwItem.loopAccount]).match(regex)) {
                            rangeAccount = [storage[<string>rwItem.loopAccount]];
                        }
                    }
                }
                else if (Array.isArray(rwItem.loopAccount)) {
                    rangeAccount = rwItem.loopAccount;
                    }                       
                }

            // On gère les liste de Index
            var rangeIndex : number[] = [0];
            if ("loopIndex" in rwItem) {
                if (typeof rwItem.loopIndex === "string") {
                    if (<string>rwItem.loopIndex in storage) {
                        if (typeof storage[<string>rwItem.loopIndex] === "bigint") {
                            rangeIndex = [...Array(Number(storage[<string>rwItem.loopIndex])).keys()];
                        }
                    }
                }
                else if (Array.isArray(rwItem.loopIndex)) {
                    rangeIndex = rwItem.loopIndex;
                    }                       
                }

            // On gère les liste de TokenId
            var rangeToken : number[] = [0];
            if ("loopTokenId" in rwItem) {
                if (typeof rwItem.loopTokenId === "string") {
                    if (<string>rwItem.loopTokenId in storage) {
                        if (typeof storage[<string>rwItem.loopTokenId] === "bigint") {
                            rangeToken = [...Array(Number(storage[<string>rwItem.loopTokenId])).keys()];
                        }
                    }
                }
                else if (Array.isArray(rwItem.loopTokenId)) {
                    rangeToken = rwItem.loopTokenId;
                    }                       
                }


            for ( const account of rangeAccount) {
                for ( const token of rangeToken) {
                    for ( const index of rangeIndex) {
                    
                    // On transcrit les arguments s'ils existent : type Account

                    var newArgs = rwItem.args.map((x) => {
                        if (Object.values(Account).includes(x)) {       
                            return accounts[x.split('_')[0]].address;
                        }
                        else if (x === Value.Account) {
                            return accounts[account.split('_')[0]].address;
                        } 
                        else if (x === Value.Index) {
                            return index;
                        } 
                        else if (x === Value.TokenId) {
                            return token;
                        } 
                        return x;
                    });
                    
                    var log : string  = "[R_@".concat( facet.address.substring(0, 6), "..]:", rwItem.contract.padEnd(15, ' '), "::");
                    log = log.concat( "[S_@", accounts[sender].address.substring(0, 6), "..]::");
                    log = log.concat( ("label" in rwItem) ? <string>rwItem.label : rwItem.function );
                    log = log.concat( "[ ", newArgs.map((arg, i) => {
                        if (Object.values(Account).includes(rwItem.args[i]) || rwItem.args[i] === Value.Account) return "@".concat( arg.substring(0, 6), "..")
                        if (rwItem.args[i] === Value.Index) return "Index ".concat( arg )
                        if (rwItem.args[i] === Value.TokenId) return "Id ".concat( arg )
                        return arg;
                        }).join("| ")," ] >> " );

                    try {
                        if (rwItem.rwType == rwType.WRITE) {

                            const method = await facet.write[rwItem.function](newArgs, rwItem.fees ? { 
                                value: BigInt(rwItem.fees)
                                }  : null, wallets[sender] );

                            const eventLogs = await  publicClient.getContractEvents({
                                abi: facet.abi,
                                address: (<Address>diamondNames.Diamond.address),
                                })
                            //console.log(eventLogs)
                                
                            log = log.concat( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : "[Tx:".concat( method.substring(0, 6), "..]"));

                            for ( const event of eventLogs) {
                                if (event.transactionHash == method) {
                                    log = log.concat( " >> Event ", event.eventName, "[ ", Object.values(event.args).join("| "), " ]" );                
                                    }
                                }
                            } 
                        else if (rwItem.rwType == rwType.READ) {
                            const result = await facet.read[rwItem.function]( newArgs, wallets[sender] );

                            const eventLogs = await  publicClient.getContractEvents({
                                abi: facet.abi,
                                address: (<Address>diamondNames.Diamond.address),
                                })

                            var beacon : any = Array.isArray(result) ? result : [ result ];
                            if ("store" in rwItem && rwItem.store) {
                                storage[rwItem.function] = beacon;
                                }   
                            if (rwItem.outcome.length == beacon.length || rwItem.outcome[0] == "array") {
                                beacon = beacon.map((res : any, i : number) => {
                                    const choice = (rwItem.outcome[0] == "array") ? "" : rwItem.outcome[i];
                                    switch (choice) {
                                        case "Typeoftoken": {
                                            return Typeoftoken[res];
                                            }
                                        case "Statusoftoken": {
                                            return Statusoftoken[res];
                                            }
                                        case "string": {
                                            if ("decode" in rwItem && typeof rwItem.decode == "string") {
                                                const codedstring = res.split(rwItem.decode);
                                                return atob(codedstring[1]);
                                                }
                                            return res;
                                            }
                                        case "address": {
                                            return "@".concat( res.substring(0, 12), "...");
                                            }
                                        case "bigint": {
                                            return res;
                                            }
                                        case "bool": {
                                            return res ? "True" : "False";
                                            }
                                        default: {
                                            return res;
                                            }
                                        }   
                                    });
                                }

                            if (Array.isArray(beacon)) log = log.concat( "[ ", beacon.join("| ")," ]" );
                            else log = log.concat( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "| " ) : <string>beacon)
                            }
                            console.info(log);
                        } catch (error) {
                            //console.log(Object.entries(error));
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
  
  main();

