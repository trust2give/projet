const hre = require("hardhat");
import { diamondNames, contractSet, facetNames, smart } from "../T2G_Data";
import { deployDiamond, 
         deployLoupeDiamond, 
         deployWithDiamondCut, 
         deployFacets,
         deployContractInstance } from "../libraries/deploy";
import { FacetCutAction } from "../utils/diamond";
import { wlist,
         writeLastContractJSONfile, 
         writeLastDiamondJSONfile, 
         writeLastFacetJSONfile } from "../libraries/files";
import { colorOutput } from "../libraries/format";
import { abiData } from "../interface/types";
import { rwRecord, cutRecord, rwType, Account, NULL_ADDRESS, regex, regex2, regex3, contractRecord, NULL_HASH } from "../libraries/types";
import { accountRefs, globalState, clientFormat } from "./states";
//import { setConstructorFromInstance } from "./instances";
import { Address } from "viem";
import fs from 'fs';

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Deployment Script
/******************************************************************************/
  
/*
 * This function carries out the actions related to Facets / Diamond or Contracts to manage
 * It returns a truple [ @diamond, @contract, cut object] depending on the FacetCutAction values
 * @diamond = new @ of T2G_Root or NULL_ADDRESS otherwise
 * @contract = new @ of EUR contract or NULL_ADDRESS otherwise
 * cut object = [{cutfacet}] or NULL_ADDRESS
 */

export async function DeployContracts( answer : string ) {
  colorOutput("Enter DeployContracts Application >> ".concat(answer), "cyan")

  var cut : cutRecord[] = [];
  var choice: FacetCutAction;
  var initFunc = NULL_ADDRESS;
  var initAddress = NULL_ADDRESS;

  var facetList = smart.filter((item) => (item.diamond == Account.AA && item.contract != diamondNames.Diamond.name));

  var commands : string[] = answer.split(' ');
  colorOutput( "commands:: ".concat(commands.join('|')), "yellow" );
  
  // command[0] => "Facet", "Contract" or "Diamond"
  // command[1] => "Add", "Replace", "Remove"
  // command[2+] => space separated contract name list 

  try {
  
  if (commands.length > 2) {
    
    switch (commands[1]) {
      case "Add": {
        choice = FacetCutAction.Add;
        break;
        }
      case "Replace": {
        choice = FacetCutAction.Replace;
        break;
        }
      case "Remove": {
        choice = FacetCutAction.Remove;
        break;
        }
      default:
        return;
      }

      switch (commands[0]) {
      case "Diamond": {
          if (choice != FacetCutAction.Add) throw("Bad action <Remove> for Diamond Smart Contract ERC 2535 - Only Add possible")          

          initFunc = await deployDiamond();
          
          // We need to write down the new address in a json file

          colorOutput( 
            "Diamond Root @[".concat(
              diamondNames.Diamond.address, 
              "] CutFacet @[", 
              diamondNames.DiamondCutFacet.address, 
              "] Init @[", 
              diamondNames.DiamondInit.address
              ), 
            "green"
            );
          // Here we update address registration for EUR if not exusting
          if (contractSet[0].address != NULL_ADDRESS) {

            const init = await hre.viem.getContractAt( 
              diamondNames.Diamond.name, 
              diamondNames.Diamond.address 
              );

            const raw = await init.write.updateAddressAndKeys( 
              [ NULL_ADDRESS, contractSet[0].address, "0x0000000000000000000000000000000000000000000000000000000000000000" ], 
              { client: { wallet: (<clientFormat[]>globalState.wallets)[0] } } 
              );
  
            colorOutput(
              `Update EUR @ ${contractSet[0].name} Tx: ${raw}`, 
              "magenta"
              );            
            }
        }
      case "Loupe": {
          cut = await deployLoupeDiamond( 
            <FacetCutAction>choice, 
            cut
            );

          await deployWithDiamondCut(
            cut, 
            initFunc, 
            diamondNames.DiamondInit.address
            );

          diamondNames.DiamondLoupeFacet.address = cut[cut.length - 1].facetAddress;

          await writeLastDiamondJSONfile();
          break;
          }
      case "Facet": {
        // In this case, the changes to facet is directly keyed in by the user and is not the result of Diamond Changes
        // Checks that there is an existing Diamond otherwise revert

        if (!String(diamondNames.Diamond.address).match(regex)) 
          throw "Trying to manage facets without Diamond deployed yet :: no root address found!";

        const facetsToChange : contractRecord[] = (commands[0] == "Facet") ? facetNames.filter((item : contractRecord) => commands.includes(item.name)) : [];
        
        var writeList : wlist = {};  
        
        console.log(facetsToChange)

        for (const facet of facetsToChange) {

          console.log(facet)

          const jsonFacet = fs.readFileSync( 
              facet.abi.path, 
              'utf-8'
              );
          
          facet.abi.file = JSON.parse(jsonFacet);
          
          var inputArray = [];

          const constructor = (facet.abi.file.abi.filter((item: abiData) => item.type == "constructor"))

          const record = { 
            rwType: rwType.CONSTRUCTOR,
            contract: facet.name,
            instance: facet.abi.file,
            function: "Constructor", 
            args: constructor.inputs,
            values: [],
            outcome: constructor.outputs,
            events: undefined 
            };      
              
          // the constructor of the smart contract requires inputs
          if (record.instance.abi.length > 0) {
            if ("inputs" in record.instance.abi[0]) {
              inputArray = record.instance.abi[0].inputs.map((item: abiData) => {
                // We fill in the input with the required address
                
                if (item.name == "_root" && item.type == "address") {
                  return diamondNames.Diamond.address;
                  }
                else if (item.name == "_stableCoin" && item.type == "address") {
                  return contractSet[0].address ;
                  }
                return;
                });
              }
            }

          cut = await deployFacets( 
            <string>facet.name, 
            <FacetCutAction>choice, 
            inputArray, 
            cut
            );

          writeList = Object.assign( 
            writeList, 
            Object.fromEntries(
              new Map( [ 
                  [ 
                  `@${facet.name}`,  
                  (<cutRecord>cut.slice().pop()).facetAddress
                  ] 
                ])
              )
            );
  
          const isWallet : boolean = ("wallet" in facet) && (typeof facet.wallet == "string");

          if (choice != FacetCutAction.Remove && isWallet) {

            const walletAndKey = await globalState.clients.readContract({
                address: writeList[<string>facet.name],
                abi: facet.abi.file.abi,
                functionName: <string>facet.wallet,
                args: []
            })
            
            colorOutput("Fectch Stable Coint Wallet@ >> ".concat( walletAndKey[0] ), "cyan")

            const [account] = await globalState.wallets.getAddresses()
            
            const { request } = await globalState.clients.simulateContract({
                address: diamondNames.Diamond.address,
                abi: diamondNames.Diamond.abi.file.abi,
                functionName: "updateAddressAndKeys",
                args: [ writeList[<string>facet.name], walletAndKey[0], walletAndKey[1] ],
                account
            })

            console.log( "updateAddressAndKeys >> ", request )
            
            const raw = await globalState.wallets.writeContract(request)
                
            colorOutput(
              `Update Wallet @ ${writeList[<string>facet.name]} Tx: ${raw}`, 
              "magenta"
              );            
            }
          }

        await deployWithDiamondCut( cut, initFunc, initAddress );

        await writeLastFacetJSONfile( 
          writeList, 
          diamondNames.Diamond.address
          );

        break;
        }
      case "Contract": {
        console.log("Contract found", contractSet, choice);

        if (choice != FacetCutAction.Remove) {

          await deployContractInstance( 
            contractSet[0], 
            [],  
            choice  
            );
              
          colorOutput(`Add ${contractSet[0].name} @: ${contractSet[0].address}`, "magenta");        

          // We need to write down the new address in a json file
          writeLastContractJSONfile();

          // Here we update address registration for EUR

          const [account] = await globalState.wallets.getAddresses()
            
          const { request } = await globalState.clients.simulateContract({
              address: contractSet[0].address,
              abi: contractSet[0].abi.file.abi,
              functionName: "updateAddressAndKeys",
              args: [ NULL_ADDRESS, contractSet[0].address, NULL_HASH ],
              account
          })

          console.log( "updateAddressAndKeys >> ", request )
          
          const raw = await globalState.wallets.writeContract(request)

          colorOutput(`Update EUR @ ${contractSet[0].name} Tx: ${raw}`, "magenta");            
          }
        else throw("Wrong action for EUR Contract ".concat(contractSet[0].address));      
        }
      default:
      }    
    }
    return;
  } catch (error) {
    console.error(error);    
    }
  }