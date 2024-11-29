const hre = require("hardhat");
import { readLastContractSetJSONfile, writeLastContractJSONfile, InteractWithContracts, writeLastDiamondJSONfile, readLastDiamondJSONfile, readLastFacetJSONfile, writeLastFacetJSONfile } from "./InteractWithContracts";
import { createWalletClient, AbiFunction, Address, getAbiItem, http } from "viem";
import { generatePrivateKey } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { contractRecord, colorOutput, regex, regex2, regex3, Account, NULL_ADDRESS, displayAccountTable, rwRecord, rwType, menuRecord, accountIndex, convertType, enumOrValue } from "./T2G_utils";
import { DeployContracts,  } from "./DeployContracts";
import * as readline from 'readline';
import { contractSet, diamondNames, facetNames, smart, encodeInterfaces } from "./T2G_Data";
import { dataDecodeABI, abiData, typeRouteArgs, honeyFeatures, pollenFeatures, Typeoftoken, Statusoftoken } from "./T2G_Types";
import { encodeAbiParameters, decodeAbiParameters } from 'viem'
import { bigint } from "hardhat/internal/core/params/argumentTypes";

import { 
    signMessage, 
    signTransaction, 
    signTypedData, 
    privateKeyToAddress,
    toAccount 
  } from 'viem/accounts'

/*******************************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Interaction Menu with T2G & ERC20 Contracts
* Version 2.0 - Date : 31/10/2024
* 
* This is the main script for running an interactive session with the T2G smart contracts
* Either to manage and deploy the smart contracts under an ERC 2535 architecture
* Or to run any function of the deployed facets of the T2G application
* 
* The data structure of the T2G application is borne by both T2G_Data.ts file, to be updated
* mainly when a new smart contract is to be deployed, prior to running the script
* 
* When creating and appending a new smart contract, please also update the smart variable below 
* with the relevant  features for the smart contract to interact with.
* * 
* The applicable commands when running the script:
* - Help : gives an outlook of the available commands to apply
* - Account : gives the list of the first 10 accounts / wallets alive on Testnet
* - Deploy : enter the management mode of the ERC2535 architecture, where you can
* add/replace/remove facets or rebuild a complete T2G Diamond or StableCoin contract
* 
* When in Deploy mode, three JSON files are updated : FacetJson, ContractSet.Json & T2G_root.Json
* These two files are to be kept as is and not altered by the user otherwise the reference
* and addresses of T2G_Root & StableCOint contracts will be lost. Theses files are used
* to get the addresses back when interacting with facets.
* 
/*******************************************************************************************/

/// Commands to run the script:
/// netstat -a -o -n        - check PID for any already running instance
/// taskkill /f /pid ####   - kill the PID if necessary
/// npx hardhat node        - Run the hardhat node prior to script if required
/// npx hardhat run .\scripts\Menu.ts --network localhost | test - Run the script (test for NAS version)

type  menuState = {
    inputs?: "None" | "Function" | "Sender" | "Args" | "OK" = "None",
    deploy?: boolean,
    object?: boolean,
    index?: number,
    subIndex?: number,
    tag?: string,
    help?: string,
    level?: string,
    promptText?: string,
    preset?: string,
    sender?: Account,
    item?: rwRecord,
    subItem?: Array<any>,
    pad?: number
    }

/// Function that fetch the new instances of each smart contract
/// given the sender wallet
export async function updateInstances() {
    const wallets = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();
    const level : string | undefined = globalState.level;

    for( const item of smart ) {
        if (level == undefined || level == "" || level == item.tag) {
            if ((item.contract != undefined) || (item.diamond != undefined)) {
                    const accounts = Object.values(accountRefs);

                    var root = (item.diamond == Account.AA) ? accounts[10].address : (item.diamond == Account.AB) ? accounts[11].address : undefined;
                    var index = await accountIndex(accountRefs, <Account>globalState.sender, true);
                    if (index == undefined) index = 0;
                    item.instance = await hre.viem.getContractAt( 
                        item.contract, 
                        (root != undefined) ? root : accounts[10].address, 
                        { client: { wallet: wallets[<number>index] } } 
                        );
                    
                    item.events = await publicClient.getContractEvents({ abi: item.instance.abi, address: (root != undefined) ? root : accounts[10].address, })
                    }
            }
        }
    }

function setState( newState: menuState, item?: rwRecord) {
    globalState = Object.assign( globalState, newState );
    if (item != undefined) globalState.item = item; 
    }

export async function updateAccountBalance() : Promise<Object> {
    const publicClient = await hre.viem.getPublicClient();
    var rank = 0;
    type refKeys = keyof typeof accountRefs;
    for (const wallet of Object.entries(accountRefs)) {
        accountRefs[<refKeys>wallet[0]].balance = await publicClient.getBalance({ address: wallet[1].address,});
        }
    }

const addAccount = async (rank: number, name: string, addr: Address, wallet: Array<any> ) : Promise<Object> => {
    //console.log(name, addr, rank, wallet)
    const publicClient = await hre.viem.getPublicClient();
    const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const balance = await publicClient.getBalance({ address: addr,})    
    return Object.assign( accountRefs, Object.fromEntries(new Map(
        [ [ `@${indice.substring(rank,rank + 1)}`, 
            { name: name, wallet: (wallet.length > 0) ? wallet[0] : NULL_ADDRESS, address: addr, private: wallet[1], balance: balance } ] ])));
    }

const account = async ( rank: number, wallet: boolean ) : Promise<Address> => {
    const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    type refKeys = keyof typeof accountRefs;
    if (rank != undefined && rank > -1 && rank < 36) {
        const index = <refKeys>`@${indice.substring(rank,rank + 1)}`;   
        return (wallet) ? accountRefs[index].wallet : accountRefs[index].address;
        }
    return NULL_ADDRESS;
    }


export var globalState : menuState = {};

// accountReds represents the set of wallets EOA or Smwart Accounts
// { "@X": { name: string, address: Address, balance: bigint }}
// @0 to @9 => Wallet accounts from hardhat node
// @A : {name: T2G_root, address: <address of wallet bound to SC, not @SC itself if present, otherwise yes, balance: <balance of address in EUR contract> }
export var accountRefs: Object = {};

async function main() {

    const width = 70;
    var ABIformat = [];

    colorOutput( "*".padEnd(width, "*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(5, " "), "Welcome to the Trust2Give dApp Interaction Menu" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(7, " "), "This application allow to interact and test" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( ("*".concat(" ".padStart(10, " "), "Author: franck.dervillez@trust2give.fr" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    colorOutput( "*".padEnd(width, "*"), "cyan");
        
    const showInstance = ( level : string ) : Array<any> => {
        const record = <menuRecord>smart.find((el: menuRecord ) => el.tag == level);
        //console.log(record.instance.abi)
        return record.instance.abi.map( 
            (item : { inputs: abiData[], name: string, outputs?: abiData[], stateMutability?: string, type: string, anonymous?: boolean }) => {
                const stateMutability = () => {
                    if ("stateMutability" in item) {
                        if (item.stateMutability === "view") return colorOutput( "R", "yellow", true )
                        else if (item.stateMutability === "payable") return colorOutput( "$", "green", true )
                        else if (item.stateMutability === "nonpayable") return colorOutput( "W", "blue", true )
                        else if (item.stateMutability === "pure") return colorOutput( "P", "cyan", true )
                        else return colorOutput( "?", "red", true );
                        }
                    else return colorOutput( " ", "blue", true );
                    }
                const itemType = () => {
                    if (item.type === "function") return colorOutput( "Fn", "yellow", true )
                    else if (item.type === "constructor") return colorOutput( "Cr", "green", true )
                    else if (item.type === "error") return colorOutput( "Er", "red", true )
                    else if (item.type === "event") return colorOutput( "Ev", "cyan", true )
                    else return colorOutput( "??", "red", true )
                    }
                    colorOutput( "> ".concat( itemType(), stateMutability(), item.name,                     
                    colorOutput( "[".concat( item.inputs.map( ( el: abiData ) => el.name).join("| "), "]"), "green", true), " => ",
                    ("outputs" in item) ? colorOutput( "[".concat( item.outputs.map( ( el: abiData ) => {
                        return ((el.name != "") ? el.name : "").concat( "(", <string>(("internalType" in el) ? el.internalType : el.type), ")") 
                        }).join("| "), "]"), "cyan", true) : "_",
                    ), "yellow");
                });
        }

    const showBeacons = async ( records: contractRecord[]) => {
        const wallets = await hre.viem.getWalletClients();
        const loupe = <menuRecord>smart.find((el: menuRecord ) => el.contract == diamondNames.DiamondLoupeFacet.name);
        const facets = await loupe.instance.read["facetAddresses"]( [], wallets[0] );

        for ( const item of records) {
            try {
                const record = <menuRecord>smart.find((el: menuRecord ) => el.contract == item.name);

                // Read the beacon_<SC Name> function for each Smart Contract Facet of the Diamond
                const raw1 : any = (item.beacon) ? await record.instance.read[<string>item.beacon]( [], wallets[0] ) : undefined;
                const beacon = colorOutput( "[".concat( (raw1 != undefined) ? raw1 : "None", "]"), "green", true);
                // Read the get_<SC Name> function for each Smart Contract Facet of the Diamond
                const raw2 : any = (item.get) ? await record.instance.read[<string>item.get]( [], wallets[0] ) : undefined;
                const present : boolean = facets.includes(raw2);
                const realAddress = colorOutput( "[".concat( (raw2 != undefined) ? raw2 : `${NULL_ADDRESS}`, "]"), (present) ? "green" : "red", true);
                // Read the wallet_<SC Name> function for each Smart Contract Facet of the Diamond
                const raw3 : any = (item.wallet) ? await record.instance.read[<string>item.wallet]( [], wallets[0] ) : undefined;
                const wallet = colorOutput( "[".concat( (raw3 != undefined) ? raw3[0] : `${NULL_ADDRESS}`, "]"), (raw3 != undefined) ? "white" : "blue", true);

                colorOutput( "> ".concat( item.name.padEnd(16, " "), " => ", beacon.padEnd(36, " "), realAddress.padEnd(42, " "), wallet ), "yellow");
                }
            catch {
                colorOutput( "> ".concat( item.name.padEnd(16, " "), " => Error " ), "red");
                }
            }
        }

    const showERC721 = async () => {
        const wallets = await hre.viem.getWalletClients();
        const record1 = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Erc721");
        const record2 = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Honey");
        const record3 = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Pollen");
        const supply : bigint = await record1.instance.read["totalSupply"]( [], wallets[0] );
        colorOutput( "Total ERC721 Tokens [".concat( `${supply}`.padStart(32,"0"), "]"), "cyan");

        for ( var i = 0; i < supply; i++) {
            try {                
                const tokenId : bigint = await record1.instance.read["tokenByIndex"]( [ i ], wallets[0] );
                const owner : Address = await record1.instance.read["ownerOf"]( [ tokenId ], wallets[0] );
                const wallet = Object.values(accountRefs).find((el) => el.address == owner);
                const balanceOf : bigint = await record1.instance.read["balanceOf"]( [ owner ], wallets[0] );
                
                const isHoney = await record2.instance.read["isHoneyType"]( [ tokenId ], wallets[0] );
                const isPollen : boolean = await record3.instance.read["isPollenType"]( [ tokenId ], wallets[0] );
                var token;
                var display;
                if (isHoney) {
                    const raw = await record2.instance.read["honey"]( [ tokenId ], wallets[0] );
                    token = decodeAbiParameters( [ honeyFeatures ], raw );
                    display = "[".concat( Typeoftoken[token[0].TokenStruct.token], "] [", Statusoftoken[token[0].TokenStruct.state], "] [", token[0].TokenFundSpecific.hash0, "]");
                    }
                else if (isPollen) {
                    const raw : `0x{string}` = await record3.instance.read["pollen"]( [ tokenId ], wallets[0] );
                    token = decodeAbiParameters( [ pollenFeatures ], raw );
                    display = "[".concat( "]");
                    }
                else throw("unrecognized");
                //console.log(token)
                colorOutput( "> Token ".concat( `${tokenId}`.padEnd( 8, " "), "| ", 
                            `${balanceOf}`, " => ", (wallet != undefined) ? wallet.name : owner,  display  ), "yellow"); //  , 
                }
            catch (error) {
                colorOutput( "> Token ".concat( `XXX`.padEnd( 8, " "), " => Problem " ), "red");
                console.log(error)
                }
            }
        }

    const showBalances = async () => {
        const wallets = await hre.viem.getWalletClients();
        const stable = <menuRecord>smart.find((el: menuRecord ) => el.tag == "EUR");
        const syndic = <menuRecord>smart.find((el: menuRecord ) => el.tag == "Syndication");

        const rights = {
            VIEW: 1,
            GIVE: 2,
            OWN: 4,
            FARM: 8,
            GRANT: 16,
            COLLECT: 32,
            ADMIN: 64
            }

        for ( const item of Object.entries(accountRefs)) {
            try {
                var AddressAndkeys : Array<any> = [ NULL_ADDRESS, "0x0000000000000000000000000000000000000000000000000000000000000000"];
                
                const facet : menuRecord = <menuRecord>smart.find((el: menuRecord ) => el.contract == item[1].name);
                if (facet != undefined) {
                    const facets : contractRecord = <contractRecord>facetNames.find((el: contractRecord ) => el.name == item[1].name);
                    if (facets != undefined) {
                        if (facets.wallet) {
                            AddressAndkeys = await facet.instance.read[<string>facets.wallet]( [], wallets[0] );
                        }
                    }
                    else {
                        if (diamondNames.Diamond.name == item[1].name) {
                            AddressAndkeys = await facet.instance.read[<string>diamondNames.Diamond.wallet]( [], wallets[0] );
                            }   
                        }   
                    }   
                
                var balance : bigint = BigInt(0);
                var net1 : string = "";
                balance = await stable.instance.read.balanceOf( [ item[1].address ], wallets[0] );                    
                net1 = (balance != undefined) ? colorOutput( "[".concat( `${balance}`.padStart(32,"0"), "]"), (balance > 0) ? "yellow" : "blue", true) : "_";
                
                if (item[1].name.match("Wallet [0-9]")) {
                    const isReg : string = (Number(await syndic.instance.read.isWalletRegistered( [ item[1].address ], wallets[0] )) == 1) ? "green" : "blue";
                    const isBan = (Number(await syndic.instance.read.isWalletBanned( [ item[1].address ], wallets[0] )) == 1) ? "red" : isReg;
                    const wRights : number = await syndic.instance.read.getWalletRights( [ item[1].address ], wallets[0] );
                    
                    // We format the display of rights for a wallet
                    const flags = Object.entries(rights).reduce( ( acc, cur) => {
                        return acc.concat( colorOutput( cur[0], (cur[1] & wRights) ? isBan : "blue", true), ` `);
                        }, "[" );
                    const net4 = (wRights != undefined) ? colorOutput( "[".concat( flags, "]"), "blue", true) : "_";
                    
                    colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => ", net1, net4 ), "yellow"); //  , 
                    }
                else {
                    var raw0 : bigint = BigInt(0);
                    var net0 : string = "";

                    if (AddressAndkeys[0] != NULL_ADDRESS) {
                        raw0 = await stable.instance.read.balanceOf( [ AddressAndkeys[0] ], wallets[0] );
                        net0 = (raw0 != undefined) ? colorOutput( "[".concat( `${raw0}`.padStart(32,"0"), "]"), (raw0 > 0) ? "cyan" : "blue", true) : "_";
                        }
                    
                    //console.log(wallets[0])
                    // Should a wallet@ exist, we display the approved @ related to it
                    var titleList : string[] = [];
                    //colorOutput( "[".concat( accountRefs[index].name, ":", `${approve}`, "]" ), "yellow", true)
                    var approveList : string[] = [];
                    if (item[1].wallet != undefined && item[1].wallet != NULL_ADDRESS) {
                        type AccountKeys = keyof typeof accountRefs;

                        // Wallet 0
                        // T2G_Root (Address) & (Wallet)
                        // Honey (Address) & (Wallet)
                        // Pool (Address) & (Wallet)
                        // Pollen (Address) & (Wallet)
                        const accountList : { label: AccountKeys, wallet: 'wallet' | 'address' }[] = [ 
                            { label: <AccountKeys>'@0', wallet: 'address' }, 
                            { label: <AccountKeys>'@A', wallet: 'wallet'  }, 
                            { label: <AccountKeys>'@E', wallet: 'wallet'  }, 
                            { label: <AccountKeys>'@F', wallet: 'wallet'  }, 
                            { label: <AccountKeys>'@G', wallet: 'wallet'  } 
                            ]
                        
                        approveList = [];
                        for ( const index of accountList) {
                            //console.log(item[1].wallet, (accountRefs[index.label])[index.wallet])
                            const approve : bigint = await stable.instance.read.allowance( 
                                [ item[1].wallet, (accountRefs[index.label])[index.wallet] ], 
                                wallets[0] 
                                );
                            //console.log(approve)
                            approveList.push(
                                colorOutput( "[".concat( ["NOK", "OK "][Number(approve > 0)], "]" ), ["red", "green"][Number(approve > 0)], true)
                                );
                            }
                        }

                    colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => ", net1, net0, approveList.join(" ") ), "yellow"); //  , 

                    }
                }
            catch (error) {
                //console.log(error)
                //colorOutput( "> ".concat( item[1].name.padEnd( 16, " "), " => Not Registered " ), "red");
                }
            }
        }

    setState( { inputs: "None", 
        deploy: false, 
        object: false, 
        index: 0, 
        subIndex: 0,
        tag: "", 
        help: "", 
        level: "", 
        promptText: "Smart Contract (<Help>, <Accounts> or <Contact Name>) >> ", 
        preset: "", 
        pad: 10,
        subItem: [] }, 
        <rwRecord>{});

    // We get the list of available accounts from hardhat testnet
    const accounts = await hre.ethers.getSigners();
    const publicClient = await hre.viem.getPublicClient();

    var rank = 0;
    for (const wallet of accounts.toSpliced(10)) {
        const balance = await publicClient.getBalance({ address: wallet.address,})    
        accountRefs = Object.assign( accountRefs, Object.fromEntries(new Map([ [`@${rank}`, { name: `Wallet ${rank}`, address: wallet.address, balance: balance} ] ])));
        rank++;
        }

    // We complete the list with possible two other address: T2G_Root & EUR contracts
    // since they can be selected as Account.AA & Account.AE options

    await readLastDiamondJSONfile();    
    
    const getRoot = await hre.viem.getContractAt( 
        diamondNames.Diamond.name, 
        diamondNames.Diamond.address
        );
    
    const wallets = await hre.viem.getWalletClients();
    const root : Array<any> = await getRoot.read.wallet_T2G_root( [], wallets[0] );
    accountRefs = await addAccount( 10, diamondNames.Diamond.name, diamondNames.Diamond.address, root );
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AA"]}: `.concat(await account(10, false)), " T2G Root" ).padEnd(width - 1, " ")).concat("*"), "cyan");
    
    await readLastContractSetJSONfile();
    accountRefs = await addAccount( 11, contractSet[0].name, contractSet[0].address, [] );
    colorOutput( ("*".concat(" ".padStart(2, " "), `${Account["AB"]}: `.concat(await account(11, false)), " EUR SC" ).padEnd(width - 1, " ")).concat("*"), "cyan");

    rank = 12;
    type AccountKeys = keyof typeof Account;
    const indice = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const facet of facetNames) {
        if (smart.findIndex((item) => item.contract == facet.name) > -1) {
            try {
                const newAddress = await readLastFacetJSONfile( facet.name, await account(10, false)); 
                
                const getAddr = await hre.viem.getContractAt( 
                    facet.name, 
                    diamondNames.Diamond.address
                    );

                const raw : Array<any> = (facet.wallet) ? await getAddr.read[<string>facet.wallet]( [], wallets[0] ) : [];
                accountRefs = await addAccount( rank, facet.name, newAddress, raw );
                colorOutput( ("*".concat(" ".padStart(2, " "), `${Account[<AccountKeys>`A${indice.substring(rank,rank + 1)}`]}: `.concat(await account(rank, false)), " ", facet.name ).padEnd(width - 1, " ")).concat("*"), "cyan");
                rank++;
                }
            catch (error) {
                //console.log(error);
                }
            }
        }
    //console.log(accountRefs)
    await updateInstances();    
    
    const rl : readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "> ",
        });
    
        const trace : boolean = false
                
        var record : menuRecord;
        //var item : rwRecord | null;
        var Choices : string[] = [];
        
        rl.setPrompt(<string>globalState.promptText);
        rl.prompt();
        
        rl.on('line', async (line) => {
        var answer : string = line.trim();
        
        if ((globalState.inputs == "None") && (answer == "Deploy")) setState( { deploy: true, object: false, index: 0, subIndex: 0, level: "", inputs: "None", tag: "", subItem: [] }, <rwRecord>{});
        else if ((globalState.inputs == "None") && (smart.some((el: menuRecord) => el.tag == answer))) {            
            setState( { deploy: false, object: false, level: answer, inputs: "Function" });            
            record = <menuRecord>smart.find((el: menuRecord ) => el.tag == globalState.level);
            Choices = record.instance.abi.filter( (item) => (item.type == "function")).map((item) => item.name);
            }
        else if ((globalState.inputs == "Function") && (Choices.some((el : string) => el == answer))) {      
            const rwRec = (name : string) : rwRecord => {
                const fct = record.instance.abi.filter((item) => (item.type == "function" && item.name == answer))[0];
                
                return <rwRecord>{ 
                    rwType: (fct.stateMutability == "view" || fct.stateMutability == "pure") ? rwType.READ : rwType.WRITE,
                    contract: record.contract,
                    function: fct.name, 
                    args: fct.inputs,
                    values: [],
                    outcome: fct.outputs };
                    }             
            setState( { inputs: "Sender", object: false, tag: answer, index: 0, subIndex: 0 }, rwRec(answer));
            }
        else if (answer == "Accounts")  {
            //const balance = await publicClient.getBalance({ address: addr,})     
            await updateAccountBalance();       
            displayAccountTable(accountRefs, width);
            }
        else if (answer == "State")  console.log(globalState);
        else if (answer == "back") setState( { inputs: "None", object: false, tag: "", level: "" }, <rwRecord>{});
        else if (answer == "beacon") {
            await showBeacons( [diamondNames.Diamond] );
            await showBeacons( facetNames );
            await showBeacons( contractSet );
            }
        else if (answer == "token") {
            await showERC721();            
            }
        else if (answer == "balance") { await showBalances(); }
        else if (answer == "Help") {
            if (globalState.level == "") setState( { help: "Keywords: help, balance, beacon, back, state, accounts + [".concat( smart.map( (el) => el.tag ).join("| "), "]\n") });
            else  setState( { help: showInstance( <string>globalState.level ) });
            colorOutput(<string>globalState.help, "yellow");
            }
        
        // In the case when Deploy is selected
        if (globalState.deploy) {
            if (answer == "back") setState( { inputs: "None", deploy: false, object: false, tag: "", level: "" }, <rwRecord>{});
            else if (answer == "Help") {
                setState( { help: "Command template : <Contract> <Action> <List of Smart Contract> \n where Contract = {Facet/Contract/Diamond} action = {Add/Replace/Remove} {[contractName ContractName...]} ]\n" });
                colorOutput(<string>globalState.help, "yellow");
                }
            else {
                await DeployContracts( accountRefs, answer, smart );

                accountRefs = await addAccount( 10, diamondNames.Diamond.name, diamondNames.Diamond.address, [] );
                accountRefs = await addAccount( 11, contractSet[0].name, contractSet[0].address, [] );
                }
            }
        // In the case when contract are selected. 
        // Checks if contract and function are set up. If so, key in the values for sender and inputs
        else {
            type refKeys = keyof typeof accountRefs;

            switch (globalState.inputs) {
                case "Sender": {
                    if (!Object.keys(accountRefs).includes(answer)) break;
                    else {
                        if (globalState.sender != <Account>answer) {
                            globalState.sender = <Account>answer;
                            await updateInstances();  
                            }

                        setState( { inputs: (globalState.item.args.length > 0) ? "Args" : "OK", object: false, index: 0, subIndex: 0, subItem: [] });
                        answer = "";
                        }
                    break;
                    }
                case "Args": {
                    try {
                        var index: number = <number>globalState.index;
                        var item: rwRecord = <rwRecord>globalState.item;
                        if (item.args[index].type == "bytes") {
                            // we are in the case when an encoded complex struct is to be passed
                            // It may require additionnal sub-inputs to get
                            if (globalState.object) {
                                var subValue = convertType( ABIformat[0].components, <number>globalState.subIndex, answer, typeRouteArgs, accountRefs, "", false);
                                
                                if (subValue != undefined) {
                                    globalState.subItem?.push(subValue);
                                    setState( { subIndex: <number>globalState.subIndex + 1 });
                                    }
                                }
                            if (globalState.subIndex >= ABIformat[0].components.length) {
                                const encodedData = encodeAbiParameters( ABIformat, [globalState.subItem] );
                                item.values[index++] = encodedData; 
                                setState( { object: false, subIndex: 0, subItem: [] });
                                }
                            }
                        else {
                            item.values[index] = convertType( item.args, <number>index, answer, typeRouteArgs, accountRefs, "", false);
                            if (item.values[index] != undefined) index++;
                            }
                        setState( { inputs: (index < globalState.item.args.length) ? "Args" : "OK", index: index, item: item });
                        }
                    catch (error) {
                        console.log("erreur", Object.entries(error));                        
                        }
                    break;
                    }
                default:            
                    if (trace) console.log("Execute Input Default", globalState.inputs, globalState.level, globalState.tag, globalState.item)
                }

            // Checks whether input conditions are met or not. If so then call up smart contract function
            if (globalState.inputs == "OK") {
                await InteractWithContracts( <rwRecord>globalState.item, <Account>globalState.sender, accountRefs, [ record, smart[1] ], <number>globalState.pad );
                setState( { inputs: "Function", tag: "" }, <rwRecord>{});
                }
            }

        //var preset: string = "";
        // We update the prompt text with the new status, waiting for new command
        switch (globalState.inputs) {
        case "None": {
            setState({ promptText: (globalState.deploy) ? "Deploy Smart Contract (<Help>, <Accounts> or Contract Name) " : 
                                    "Which Smart Contract (<Help>, <Accounts> or Contract Name) ? " , preset: "" });
            break;
            }
        case "Function": {
            setState({ promptText: `Which Function (<Help>, <Accounts>, <back> or Function Name ) ? `, preset: "" });
            break;
            }
        case "Sender": {
            setState({ promptText: "Which Sender's Account (msg.sender) [@0 ... @9] ? ", preset: "@" });
            break;                
            }
        case "Args": {
            const index = <number>globalState.index;
            const subIndex = <number>globalState.subIndex;
            if (index < (<rwRecord>globalState.item).args.length) {
                var argPointer = (<rwRecord>globalState.item).args[index];
                //console.log((<rwRecord>globalState.item).args)
                // Check if we are requesting simple type inputs or (bytes memory _data) -like input
                if (argPointer.type == "bytes" && argPointer.name == "_data") {
                    if (subIndex == 0) {
                        if ((<rwRecord>globalState.item).contract in encodeInterfaces) {
                            type encKeys = keyof typeof encodeInterfaces;
                            const encodeInput = encodeInterfaces[<encKeys>(<rwRecord>globalState.item).contract].find((item) => item.function == (<rwRecord>globalState.item).function);
                            // We check that the related function is concerned or not by the abi.encode
                            if (encodeInput != undefined) {
                                if ("_data" in encodeInput) {
                                    if (encodeInput._data in dataDecodeABI) {
                                        type decKeys = keyof typeof dataDecodeABI;
                                        ABIformat =  dataDecodeABI[<decKeys>encodeInput._data];
                                        setState( { object: true, subItem: [] });
                                        }
                                    }
                                }
                            }
                        }
                    setState({ promptText: "Arg".concat( ` [${index} / ${subIndex}] - ${argPointer.name} [${ABIformat[0].name} ${ABIformat[0].components[subIndex].name}]`), preset: "@" });
                    } 
                else setState({ promptText: "Arg".concat( ` [${index}] - ${argPointer.name} [${argPointer.type}] `), preset: "@" });
               }
            break;                
            }
        default:
        }

        setState({ promptText: "".concat( 
            colorOutput( `[ ${(globalState.level != "") ? globalState.level : "None"}|${(globalState.tag != "") ? globalState.tag : "None"}|${globalState.inputs}] `, "cyan", true ), 
                            <string>globalState.promptText ), 
                            preset: "" });
            
        rl.setPrompt(<string>(globalState.promptText).concat(` >> `));
        if (globalState.preset != "") {
            rl.write(globalState.preset); 
            rl.write(null, { ctrl: true, name: 'f' });
            }
        // we wait for the next input from user
        rl.prompt();

        }).on('close', () => {
            console.log('Have a great day!');
            process.exit(0);
        }).on('SIGTSTP', () => {
            // This will override SIGTSTP and prevent the program from going to the
            // background.
            console.log('Caught SIGTSTP.');
          }).on('pause', () => {
            console.log('Pause.');
          }); 
    }

main().catch((error) => {
  console.error("Erreur", error);
  process.exitCode = 1;
});