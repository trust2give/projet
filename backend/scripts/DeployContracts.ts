const hre = require("hardhat");
import { diamondNames, tokenCredential, contractSet, facetNames } from "./T2G_Data";
import { deployDiamond, getOrDeployContract, deployLoupeDiamond, deployWithDiamondCut, deployFacets } from "./deploy";
import { Address } from "viem";
import { colorOutput, cutRecord, NULL_ADDRESS, regex, menuRecord, Account } from "./T2G_utils";
import { FacetCutAction } from "./utils/diamond";
import { writeLastFacetJSONfile, writeLastDiamondJSONfile, writeLastContractJSONfile } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Deployment Script
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\DeployContracts.ts --network localhost
  
/*
 * This function carries out the actions related to Facets / Diamond or Contracts to manage
 * It returns a truple [ @diamond, @contract, cut object] depending on the FacetCutAction values
 * @diamond = new @ of T2G_Root or NULL_ADDRESS otherwise
 * @contract = new @ of EUR contract or NULL_ADDRESS otherwise
 * cut object = [{cutfacet}] or NULL_ADDRESS
 */

export async function DeployContracts(accountList: Address[], answer : string, smart : menuRecord[]) {
  colorOutput("Enter DeployContracts Application", "cyan")
  
  const trace : boolean = false;

  var cut : cutRecord[] = [];
  var choice: FacetCutAction;
  var initFunc = NULL_ADDRESS;
  var initAddress = NULL_ADDRESS;
  var facetList = smart.filter((item) => (item.diamond == Account.AA && item.contract != diamondNames.Diamond.name));

  var commands : string[] = answer.split(' ');
  if (trace) console.log( "commands::", commands, commands.length );
  
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
        return [ NULL_ADDRESS, NULL_ADDRESS ];
      }

      
      switch (commands[0]) {
      case "Diamond": {
          if (choice != FacetCutAction.Add) throw("Bad action <Remove> for Diamond Smart Contract ERC 2535 - Only Add possible")          
          // [ diamondAddress, diamondCutAddress, initFunc, initAddress ] 
          const deployed = await deployDiamond( diamondNames, tokenCredential );
          diamondNames.Diamond.address = deployed[0];
          diamondNames.DiamondCutFacet.address = deployed[1];
          diamondNames.DiamondInit.address = deployed[3];
          initFunc = deployed[2];
          // We need to write down the new address in a json file
          colorOutput( "Diamond Root @[".concat(deployed[0], "] CutFacet @[", deployed[1], "] Init @[", deployed[3]), "green");
          await writeLastFacetJSONfile( {}, diamondNames.Diamond.address );
        }
      case "Loupe": {
          cut = await deployLoupeDiamond( diamondNames, <FacetCutAction>choice, cut);

          await deployWithDiamondCut(diamondNames.Diamond.address, cut, initFunc, diamondNames.DiamondInit.address);

          diamondNames.DiamondLoupeFacet.address = cut[cut.length - 1].facetAddress;
          colorOutput( "Diamond Root @[".concat(diamondNames.DiamondLoupeFacet.address, "]"), "green");
          await writeLastDiamondJSONfile();
          break;
          }
      case "Facet": {
        // In this case, the changes to facet is directly keyed in by the user and is not the result of Diamond Changes
        // Checks that there is an existing Diamond otherwise revert
        if (!String(diamondNames.Diamond.address).match(regex)) 
          throw "Trying to manage facets without Diamond deployed yet :: no root address found!";

        const facetsToChange : menuRecord[] = (commands[0] == "Facet") ? facetList.filter((item) => commands.includes(<string>item.contract)) : [];
        //console.log(facetsToChange, facetList, smart)

        var writeList : Object = {};

        for (const facet : menuRecord of facetsToChange) {
          //console.log("Facet found", facet.contract)

          var inputArray = [];
          const constructor = (facet.instance.abi.filter((item) => item.type == "constructor"))
          if (constructor.length > 0)
            // the constructor of the smart contract requires inputs
            inputArray = ("inputs" in constructor[0]) ? constructor[0].inputs.map((item: Object) => {
                // We fill in the input with the required address
                if (item.name == "_root" && item.type == "address") {
                  return diamondNames.Diamond.address;
                  }
                else if (item.name == "_stableCoin" && item.type == "address") {
                  return contractSet[0].address ;
                  }
                return;
                }) : [];

          cut = await deployFacets( diamondNames.Diamond.address, <string>facet.contract, <FacetCutAction>choice, inputArray, cut);
          writeList[facet.contract] = (<cutRecord>cut.slice().pop()).facetAddress;
          }
        await deployWithDiamondCut( diamondNames.Diamond.address, cut, initFunc, initAddress );      

        await writeLastFacetJSONfile( writeList, diamondNames.Diamond.address );

        break;
        }
      case "Contract": {
        if (trace) console.log("Contract found", contractSet, choice);
        contractSet[0].address = await getOrDeployContract( contractSet[0], <string>contractSet[0].name, <FacetCutAction>choice );
        // We need to write down the new address in a json file
        writeLastContractJSONfile();
        }
      default:
      }    
    }
    return;
  } catch (error) {
    console.error(error);    
    }
  }