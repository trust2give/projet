const hre = require("hardhat");
import { diamondNames, tokenCredential, contractSet, facetNames } from "./T2G_Data";
import { deployDiamond, getOrDeployContract, deployWithDiamondCut, deployFacets } from "./deploy";
import { Address } from "viem";
import { colorOutput, cutRecord, NULL_ADDRESS, regex, contractRecord, diamondCore } from "./T2G_utils";
import { FacetCutAction } from "./utils/diamond";
import fs from 'fs';
import { readLastDiamondJSONfile } from "./InteractWithContracts";

/******************************************************************************\
* Author: Franck Dervillez <franck.dervillez@trust2give.com>, Twitter/Github: @fdervillez
* EIP-2535 Diamonds - Deployment Script
/******************************************************************************/

/// C:\Users\franc\Documents\02_Blockchain\01_Trust2Give\00_Projet\projet\backend
/// netstat -a -o -n
/// taskkill /f /pid ####
/// npx hardhat node
/// npx hardhat run .\scripts\DeployContracts.ts --network localhost


export function writeLastDiamondJSONfile( ) {
  const jsonString = fs.readFileSync('./scripts/T2G_Root.json', 'utf-8');
  const DiamondCoreArray : diamondCore[] = JSON.parse(jsonString);
  DiamondCoreArray.push(diamondNames);

  let JsonFile = JSON.stringify(DiamondCoreArray);
  //colorOutput("Save last Diamond Core Record >> ".concat(JSON.stringify(diamondNames)), "cyan");
  fs.writeFile('./scripts/T2G_Root.json', JsonFile, (err) => {
      if (err) {
          console.log('Error writing file:', err);
      } else {
          console.log('Successfully wrote file');
          }
      });
}

/*
 *
 */

export async function DeployContracts(accountList: Address[], answer : string) : Promise<any> {
  colorOutput("Enter DeployContracts Application", "cyan")
  
  const trace : boolean = false;

  var cut : cutRecord[] = [];
  var choice: FacetCutAction;
  var smarts: contractRecord[] | diamondCore;
  var initFunc = NULL_ADDRESS;
  var initAddress = NULL_ADDRESS;
  var diamondAddress : Address = NULL_ADDRESS;

  
  var commands : string[] = answer.split(' ');
  if (trace) console.log( "commands::", commands, commands.length );
  
  // command[0] => "Facet", "Contract" or "Diamond"
  // command[1] => "Add", "Replace", "Remove"
  // command[2+] => space separated contract name list 
try {
  const instance = await getOrDeployContract( contractSet[0], <string>contractSet[0].name );
  
  if (commands.length > 2) {
    
    switch (commands[1]) {
      case "Add": {
        choice = FacetCutAction.Add;
        if (trace) console.log("Add Selected")
          break;
      }
      case "Replace": {
        choice = FacetCutAction.Replace;
        if (trace) console.log("Replace Selected")
          break;
      }
      case "Remove": {
        choice = FacetCutAction.Remove;
        if (trace) console.log("Remove Selected")
          break;
      }
      default:
        return [ NULL_ADDRESS, NULL_ADDRESS ];
      }

      
      switch (commands[0]) {
        case "Diamond": {
          if (choice != FacetCutAction.Add)
            throw("Bad action <Remove> for Diamond Smart Contract ERC 2535 - Only Add possible")
          
        smarts = diamondNames;
        [ diamondAddress, initFunc, initAddress, <cutRecord[]>cut ] = await deployDiamond( smarts, choice, tokenCredential, cut );
        }
      case "Facet": {
        if (trace) console.log("Facet Selected")
        smarts = facetNames;
        var diamName : string = (diamondNames.Diamond.name || "Diamond");

        // In this case, the changes to facet is directly keyed in by the user and is not the result of Diamond Changes
        if (commands[0] == "Facet") {
          // Checks that there is an existing Diamond otherwise revert
          if (!String(diamondNames.Diamond.address).match(regex)) 
            throw "Trying to manage facets without Diamond deployed yet :: no root address found!";
  
          // An instance of Root Diamond is fetched 
          const diamond = await hre.viem.getContractAt( diamName, (<Address>(await readLastDiamondJSONfile()).Diamond.address) );
          diamondAddress = diamond.address;

          // On récupère le beacon de T2G_Root
          let beacon = await diamond.read.beacon_T2G_Root();
          colorOutput(`Retrieve ${diamName} @: ${diamondAddress} : ${beacon}`, "green");  
  
          // No specific start over. 
          initFunc = NULL_ADDRESS;
          initAddress = NULL_ADDRESS;      
          }
        else { // In this case it comes from "Diamond" change and we need to create all new instances of facets
          // Choice is Add & we need to alter the command table to include all of the facets in the list
          commands = <string[]>[ "-", "Add"].concat( smarts.map((element) => <string>element.name));
          }

        if (trace) console.log("Facet prepared", cut)
          
          for (var i = 2; i < commands.length; i++) {
          const item = (smarts.find((element) => element.name == commands[i]));
          if (trace) console.log("Facet found", commands[i], item)
            if (item != undefined) {
              cut = await deployFacets(diamondAddress, <string>item.name, <FacetCutAction>choice, <boolean>item.argInit, cut);
            }
          }

        if (trace) console.log("Ready to deploy", cut, initFunc, initAddress)

        deployWithDiamondCut( diamondAddress, cut, initFunc, initAddress );      
        //getBeacons( smarts, diamondAddress );
        return [ diamondAddress, instance ];
        }
      case "Contract": {
        smarts = contractSet;
        if (trace) console.log("Contract found", smarts, choice);
        const res = await getOrDeployContract( smarts[0], <string>smarts[0].name, <FacetCutAction>choice );
        return [ diamondAddress, res ];
        }
      default:
        return [ NULL_ADDRESS, NULL_ADDRESS ];
      }    
    }
    return [ diamondAddress, instance ];
  } catch (error) {
    console.error(error);    
  }
  }