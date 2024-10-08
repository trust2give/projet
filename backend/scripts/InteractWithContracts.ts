import hre from "hardhat";
import { diamondNames } from "./T2G_Data";
import { saveEvents } from "./evListener";
import { Address, InvalidSerializedTransactionTypeError } from "viem";

/// npx hardhat node
/// npx hardhat run .\scripts\WriteContract.ts --network localhost

// Expression régulière pour détecter une adresse ETH 
const regex = '^(0x)?[0-9a-fA-F]{40}$';
const NULL_ADDRESS = <Address>"0x0000000000000000000000000000000000000000"

/// enum type qui permet de définir si une interaction est de type READ ou WRITE
enum rwType { READ, WRITE }

/// enum type qui permet de sélectionner les 6 premiers @Wallet du node hardhat
enum Account { A0 = "0_", A1 = "1_", A2 = "2_", A3 = "3_", A4 = "4_", A5 = "5_", A6 = "6_" }
/// enum type qui permet dans le tableau args de définir une liste de valeur plutôt qu'une valeur spécifique
enum Value { TokenId = "T__", Index = "I__", Account = "A__" }

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
    loopTokenId? : number[] | string, // Permet de gérer une liste d'inputs [...]de type index ou [0...Max] => Max : valeur dans storge
    loopIndex? : number[] | string, // Permet de gérer une liste d'inputs [...]de type index ou [0...Max] => Max : valeur dans storge
    loopAccount? : Account[] | string, // Permet de gérer une liste d'inputs [...]de type @Accounts ou valeur @Account stockée dans storge
    label?: string, // Affichage alternatif au nom de la fonction dans la console de log pour les résultats des appels
    store?: boolean // flag store pour définir si le résultat d'un READ doit être stocké pour être réutilisé par ailleurs
  }


const rwList : rwRecord[] = [
    { rwType: rwType.READ, contract: "ERC721Facet", function: "name", store: true, args: [], label: "Nom du Token ERC721" },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "symbol", store: true, args: [], label: "Symbol du Token ERC721" },
    { rwType: rwType.READ, contract: "OwnershipFacet", function: "owner", args: [], label: "@owner of T2G Diamond" },
    { rwType: rwType.READ, contract: "MintFacet", function: "balanceOf", args: [], label: "POL/ETH of T2G Contract pool" },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "totalSupply", args: [], store: true, label: "Total tokens minted" },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "tokenByIndex", args: [ Value.Index ], loopIndex: "totalSupply", label: "TokenId @ Index " },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "balanceOf", args: [Value.Account], loopAccount: [Account.A0, Account.A1, Account.A2], label: "Token Nb per account " },
    { rwType: rwType.WRITE, contract: "ERC721Facet", function: "approve", args: [ Account.A2, 1 ], sender: Account.A2 },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "isApprovedForAll", args: [Account.A0, Account.A1] },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "getApproved", args: [Value.TokenId], loopTokenId: [1], sender: Account.A2 },
    { rwType: rwType.READ, contract: "ERC721Facet", function: "contractURI", args: [] },
    { rwType: rwType.WRITE, contract: "MintFacet", function: "mint", args: [ Account.A0, 1 ] },
    { rwType: rwType.WRITE, contract: "ERC721Facet", function: "safeTransferFrom", args: [ Account.A0, Account.A2, 1 ] }
    ]

var storage : object = {};

async function main() {
    const accounts = await hre.ethers.getSigners();
    const wallets = await hre.viem.getWalletClients();
    console.log("Enter InteractContract app")

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
                    
                    //console.log("newArgs", newArgs);            

                    var log : string = "";
                    try {
                        if (rwItem.rwType == rwType.WRITE) {
                            const method = await facet.write[rwItem.function](newArgs);
                            log = log.concat( "[@", facet.address.substring(0, 12), "...]:", rwItem.contract, "::");
                            log = log.concat( ("label" in rwItem) ? <string>rwItem.label : rwItem.function)
                            log = log.concat( "[", newArgs.join("|"),"] >> " );
                            log = log.concat( (typeof method === "object") ? method.reduce( (acc, cur) => { return cur.concat(acc, "|")} ) : <string>method)
                            console.info(log);
                            //saveEvents(method);
                            } 
                        else if (rwItem.rwType == rwType.READ) {
                            const beacon = await facet.read[rwItem.function]( newArgs );
                            if ("store" in rwItem && rwItem.store) {
                                storage[rwItem.function] = beacon;
                                }
                            log = log.concat( "[@", facet.address.substring(0, 12), "...]:", rwItem.contract, "::");
                            log = log.concat( ("label" in rwItem) ? <string>rwItem.label : rwItem.function)
                            log = log.concat( "[", newArgs.join("|"),"] >> " );
                            log = log.concat( (typeof beacon === "object") ? beacon.reduce( (acc, cur) => { return cur.concat(acc)}, "|" ) : <string>beacon)
                            console.info(log);
                            }
                        } catch (error) {
                            log = log.concat( "[@", error.contractAddress.substring(0, 12), "...]:", error.functionName, "::");
                            log = log.concat( "[", error.args.join("|"),"] >> " );
                            log = log.concat( <string>error.metaMessages, "\n");
                            console.error(log); //Object.entries(error));
                        }  
                    }
                }          
            }    
        }
    }
  
  main();
  
  /* .catch((error) => {
    console.error(`Error ${error.functionName}[@${error.contractAddress}] => ${error.metaMessages[0]} - Args ${error.args}`);
    LastRankInList = LastRankInList + 1;
    process.exitCode = 1;
  });*/