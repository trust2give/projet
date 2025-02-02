import { Address, encodeFunctionData } from "viem";
import { FacetCutAction, getSelectors } from "../utils/diamond";
import { Account, regex, NULL_ADDRESS, cutRecord, contractRecord, diamondCore } from "../libraries/types";
import { diamondNames, tokenCredential, contractSet, facetNames } from "../T2G_Data";
import { colorOutput } from "../libraries/format";
import { accountRefs, globalState, clientFormat } from "../logic/states";
import fs from 'fs';

async function deployContractInstance( contract: contractRecord, args: Array<any>, action: FacetCutAction ) {

    const [account] = await globalState.wallets.getAddresses()

    console.log("Entering >> Account ", account);

    const before = await globalState.clients.getBalance({ 
        address: account,
        })    

    console.log("Entering >> Account ", account, before);
    
    const abi = contract.abi.file.abi;

    const hashCut = await globalState.wallets.deployContract(
        {
        abi,
        account,
        bytecode: contract.abi.file.bytecode,
        args: args
        }
        )
    
    console.log("Waiting Transaction ", hashCut )

    // Attendre la validation de la transaction
    const resCut = await globalState.clients.waitForTransactionReceipt({ hash: hashCut })

    console.log("resCut", resCut, account);

    const eventLogs = await  globalState.clients.getContractEvents({
        abi: contract.abi.file,
        address: resCut.address,
        })
            
    colorOutput(
        `${["Add", "Replace", "Remove"][action]} ${contract.name} @: ${resCut.contractAddress} Hash: ${hashCut}`, 
        "magenta"
    );

    colorOutput( "[".concat( eventLogs.map((event: any) => {
        return " >> Event ".concat( event.eventName, "[ ", Object.values(event.args).join("| "), " ]" );
        }).join("\n"), "]" ), "yellow");
        
    const after = await globalState.clients.getBalance({ 
        address: account,
        })   

    console.log("resCut", resCut);
    
    contract.address = resCut.contractAddress;
    
    colorOutput( 
        "Balance @[".concat(
            account, 
            "] Before @[", 
            before, 
            "] After @[", 
            after, 
            `] gaz used = ${(before - after)} `
            ), 
        "green"
        );
    }

/*export async function getOrDeployContract( 
    contract : contractRecord, 
    name: string, 
    action: FacetCutAction | undefined 
    ) : Promise<Address> {

    if (action == undefined) {
        if (String(contract.address).match(regex)) 
            return (await hre.viem.getContractAt( name, (<Address>contract.address) )).address;
        else throw("Wrong address format for EUR Contract ".concat(contract.address));
        }
    else if (action != <FacetCutAction>FacetCutAction.Remove) {
        const instance = (await hre.viem.deployContract( name ));
        colorOutput(`Add ${name} @: ${instance.address}`, "magenta");        
        return instance.address;
        }
    else throw("Wrong action for EUR Contract ".concat(contract.address));
    }*/

export async function deployLoupeDiamond( action: FacetCutAction, cut: cutRecord[] ) : Promise<Array<any>> { 

    switch (action) { 
        case (FacetCutAction.Add):
        case (FacetCutAction.Replace): {
            
            await deployContractInstance( 
                diamondNames.DiamondLoupeFacet, 
                [],  
                action  
                );
            break;
            } 
        default:
            throw("wrong action for DiamondLoupeFacet");
        }

    cut.push({
        facetAddress: diamondNames.DiamondLoupeFacet.address,
        action: action,
        functionSelectors: getSelectors(diamondNames.DiamondLoupeFacet.abi.file)
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

    console.log("Deploying Diamond Cut")

    await deployContractInstance( 
        diamondNames.DiamondCutFacet, 
        [],  
        FacetCutAction.Add  
        );

    console.log("Deploying Diamond Root")

    await deployContractInstance( diamondNames.Diamond, [
        (<clientFormat[]>globalState.wallets)[0].account.address,
        diamondNames.DiamondCutFacet.address
        ], 
        FacetCutAction.Add 
        );

    console.log("Deploying Diamond Init")

    await deployContractInstance( diamondNames.DiamondInit, [],  FacetCutAction.Add );

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

export async function deployFacets( 
    name: string, 
    action: FacetCutAction, 
    constructor: Array<any>, 
    cut: cutRecord[]  
    ) : Promise<cutRecord[]> {

    const facet = facetNames.find((item) => item.name == name);

    if (facet != undefined) {                
        switch (action) {
            case FacetCutAction.Remove: {
                cut.push({ 
                    facetAddress: NULL_ADDRESS, 
                    action: action, 
                    functionSelectors: getSelectors((<contractRecord>facet).abi.file) 
                    });

                break;
                }
            case FacetCutAction.Add:
            case FacetCutAction.Replace: {

                await deployContractInstance( facet, constructor, action );

                cut.push({ 
                    facetAddress: (<contractRecord>facet).address, 
                    action: action, 
                    functionSelectors: getSelectors((<contractRecord>facet).abi.file) 
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
         }

    return cut;
    }

export async function deployWithDiamondCut( cut : cutRecord[], initFunc: `0x${string}`, initAddress: Address ) : Promise<Address> {

    const before = await globalState.clients.getBalance({ 
        address: accountRefs[Account.A0].address,
        })    

    const jsonIDiamondCut = fs.readFileSync( 
        './artifacts/contracts/interfaces/IDiamondCut.sol/IDiamondCut.json', 
        'utf-8'
        );

    const iDiamondCutABI : any = JSON.parse(jsonIDiamondCut);

    /*const diamondCut = await hre.viem.getContractAt(
        "IDiamondCut", 
        diamondNames.Diamond.address
        );*/

    const { request } = await globalState.clients.simulateContract({
        address: diamondNames.Diamond.address,
        abi: iDiamondCutABI.abi,
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
