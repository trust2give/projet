const hre = require("hardhat");
import fs from 'fs';
import { Address, encodeFunctionData } from "viem";
import { FacetCutAction, getSelectors } from "../utils/diamond";
import { Account, regex, NULL_ADDRESS, cutRecord, contractRecord, diamondCore } from "../libraries/types";
import { diamondNames, tokenCredential, contractSet, facetNames } from "../T2G_Data";
import { colorOutput } from "../libraries/format";
import { accountRefs, globalState, clientFormat } from "../logic/states";


export async function getOrDeployContract( contract : contractRecord, name: string, action: FacetCutAction | undefined ) : Promise<Address> {
    if (action == undefined) {
        if (String(contract.address).match(regex)) return (await hre.viem.getContractAt( name, (<Address>contract.address) )).address;
        else throw("Wrong address format for EUR Contract ".concat(contract.address));
        }
    else if (action != <FacetCutAction>FacetCutAction.Remove) {
        const instance = (await hre.viem.deployContract( name ));
        colorOutput(`Add ${name} @: ${instance.address}`, "magenta");        
        return instance.address;
        }
    else throw("Wrong action for EUR Contract ".concat(contract.address));
    }

export async function deployLoupeDiamond( action: FacetCutAction, cut: cutRecord[] ) : Promise<Array<any>> { 
    var diamondLoupe; // on récupère l'instance DiamonLoupeFacet
    var loupeName : string = (diamondNames.DiamondLoupeFacet.name || "DiamondLoupeFacet");

    switch (action) {
        case (FacetCutAction.Replace): {
            colorOutput(`Replace ${loupeName} @: ${diamondNames.DiamondLoupeFacet.address}`, "magenta");    
            } 
        case (FacetCutAction.Add): {
            colorOutput(`Add ${loupeName} @: ${diamondNames.DiamondLoupeFacet.address}`, "magenta");    

            diamondLoupe = await hre.viem.deployContract( loupeName );                
            break;
            } 
        default:
            throw("wrong action for DiamondLoupeFacet");
        }

    cut.push({
        facetAddress: diamondLoupe.address,
        action: action,
        functionSelectors: getSelectors(diamondLoupe)
        });

    return cut;    
    }


export async function deployDiamond() : Promise<any> {
  
    colorOutput(
        `Deploying Diamond Root Smart Contract`, 
        "cyan"
        );

    colorOutput(
        `Root Name: ${diamondNames.Diamond.name} CutFacet Name: ${diamondNames.DiamondCutFacet.name} Owner@: ${accountRefs[Account.A0].address}`, 
        "yellow"
        );

        // On est dans le cas où on créé un nouveau T2G_Root

    const before = await globalState.clients.getBalance({ 
        address: accountRefs[Account.A0].address,
        })    

    const [account] = await globalState.wallets.getAddresses()

    const cutAbi = diamondNames.DiamondCutFacet.abi.file.abi;

    const hashCut = await globalState.wallets.deployContract({
        cutAbi,
        account,
        bytecode: diamondNames.DiamondCutFacet.abi.file.bytecode
        })

    console.log( hashCut );

    colorOutput(
        `Add ${diamondNames.DiamondCutFacet.name} @: ${hashCut.address}`, 
        "magenta"
        );

    const diamondAbi = diamondNames.Diamond.abi.file.abi;

    const hashDiamond = await globalState.wallets.deployContract({
        diamondAbi,
        account,
        bytecode: diamondNames.Diamond.abi.file.bytecode,
        args: [
            (<clientFormat[]>globalState.wallets)[0].account.address,
            hashCut.address
            ]
            })
    
    console.log( hashDiamond );

    colorOutput(
        `Add ${diamondNames.Diamond.name} @: ${hashDiamond.address}`, 
        "magenta"
        );    

    const initAbi = diamondNames.DiamondInit.abi.file.abi;

    const hashInit = await globalState.wallets.deployContract({
        initAbi,
        account,
        bytecode: diamondNames.DiamondInit.abi.file.bytecode,
        })

    //diamondInit = await hre.viem.deployContract("DiamondInit");
    console.log( hashInit );

    colorOutput(
        `Add DiamondInit @: ${hashInit.address}`, 
        "magenta"
        );    

    diamondNames.Diamond.address = hashDiamond.address;
    diamondNames.DiamondCutFacet.address = hashCut.address;
    diamondNames.DiamondInit.address = hashInit.address;

    const after = await globalState.clients.getBalance({ 
        address: accountRefs[Account.A0].address,
        })    

    colorOutput( 
        "Balance @[".concat(
            accountRefs[Account.A0].address, 
            "] Before @[", 
            before, 
            "] After @[", 
            after, 
            `] gaz used = ${(before - after)} `
            ), 
        "green"
        );

    return encodeFunctionData({
        abi: diamondNames.DiamondInit.abi.file.abi,
        functionName: "init",
        args: [ tokenCredential.name, tokenCredential.symbol, diamondNames.Diamond.address ]
        });
    }


// Function used to deploy a specific smart contract facets "name"
// Behavior depends on action value : Add, Replace or Remove from the diamond smart contract
// Constructor represents the possible inputs array to pass to the constructor, mainly addresses of either Diamond Root (_root) or StableCoin Smart Contract (_stableCoin)
// Adds up the eventual changes to apply to the diamond architecture through the cut[] array
// Return the cut[] to pass to DiamondCutFacet smart contract

export async function deployFacets( name: string, action: FacetCutAction, constructor: Array<any>,  cut: cutRecord[]  ) : Promise<cutRecord[]> {

    const before = await globalState.clients.getBalance(
        { address: accountRefs[Account.A0].address,}
        )    

    var facet;
    switch (action) {
        case FacetCutAction.Remove: {

            facet = await hre.viem.getContractAt( 
                <string>name, 
                diamondNames.Diamond.address 
                );        

            cut.push({ 
                facetAddress: NULL_ADDRESS, 
                action: action, 
                functionSelectors: getSelectors(facet) 
                });

            break;
            }
        case FacetCutAction.Add:
        case FacetCutAction.Replace: {

            if (constructor.length > 0) {

                facet = await hre.viem.deployContract( 
                    <string>name, 
                    constructor, 
                    { client: { wallet: (<clientFormat[]>globalState.wallets)[0] }, }
                    );
                }
            else {
                facet = await hre.viem.deployContract(
                    <string>name
                    );
                }

            cut.push({ 
                facetAddress: facet.address, 
                action: action, 
                functionSelectors: getSelectors(facet) 
                });

            break;
            }
        case undefined: {
            return cut;
            }
        default: {
            throw new Error(`Incompatible Action ${action} for ${name} & address recorded`);
            }
        }

    colorOutput(`${name} - Action ${action} @: ${diamondNames.Diamond.address}`, "green");    

    const eventLogs = await  globalState.clients.getContractEvents({
        abi: facet.abi,
        address: (<Address>facet.address),
        })
                    
    colorOutput( "[".concat( eventLogs.map((event: any) => {
        return " >> Event ".concat( event.eventName, "[ ", Object.values(event.args).join("| "), " ]" );
        }).join("\n"), "]" ), "yellow");

    const after = await globalState.clients.getBalance(
        { address: accountRefs[Account.A0].address,}
        )    

        colorOutput( 
        "Facet @[".concat(name, "] Before @[", before, "] After @[", after, `] gaz used = ${(before - after)} `), 
        "green"
        );
    
    return cut;
    }

export async function deployWithDiamondCut( cut : cutRecord[], initFunc: `0x${string}`, initAddress: Address ) : Promise<Address> {

    const before = await globalState.clients.getBalance({ 
        address: accountRefs[Account.A0].address,
        })    

    const diamondCut = await hre.viem.getContractAt(
        "IDiamondCut", 
        diamondNames.Diamond.address
        );

    const { request } = await globalState.clients.simulateContract({
        address: diamondNames.Diamond.address,
        abi: diamondCut.abi,
        functionName: "diamondCut",
        args: [
            cut,
            initAddress,
            initFunc
            ]
        });

    const tx = await (<clientFormat[]>globalState.wallets)[0].writeContract(request);
    await globalState.clients.waitForTransactionReceipt({ hash: tx });

    colorOutput(
        `Transaction Hash : ${tx}`, 
        "green"
        );

    const after = await globalState.clients.getBalance({ 
        address: accountRefs[Account.A0].address,
        })    

    colorOutput( 
        "Diamond Root @[".concat(
            diamondNames.DiamondLoupeFacet.address, "] Before @[", 
            before, 
            "] After @[", 
            after, 
            `] gaz used = ${(before - after)} `
            ), 
        "green"
        );

    return diamondNames.Diamond.address;
    }
