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

export async function DeployContracts(accountRefs: Object, answer : string, smart : menuRecord[]) {
  colorOutput("Enter DeployContracts Application", "cyan")

  const publicClient = await hre.viem.getPublicClient();
  const accountList = Object.values(accountRefs); 
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
        return;
      }

      const wallets = await hre.viem.getWalletClients();
      
      switch (commands[0]) {
      case "Diamond": {
          if (choice != FacetCutAction.Add) throw("Bad action <Remove> for Diamond Smart Contract ERC 2535 - Only Add possible")          

          const before = await publicClient.getBalance({ address: accountList[0].address,})    

          initFunc = await deployDiamond();

          const after = await publicClient.getBalance({ address: accountList[0].address,})    
          
          // We need to write down the new address in a json file

          colorOutput( "Diamond Root @[".concat(diamondNames.Diamond.address, "] CutFacet @[", diamondNames.DiamondCutFacet.address, "] Init @[", diamondNames.DiamondInit.address), "green");
          colorOutput( "Balance @[".concat(accountList[0].address, "] Before @[", before, "] After @[", after, `] gaz used = ${(before - after)} `), "green");
          
          await writeLastFacetJSONfile( {}, diamondNames.Diamond.address );

          // Here we update address registration for EUR if not exusting
          if (contractSet[0].address != NULL_ADDRESS) {
            const init = await hre.viem.getContractAt( diamondNames.Diamond.name, diamondNames.Diamond.address )
            const raw = await init.write.updateAddressAndKeys( 
              [ NULL_ADDRESS, contractSet[0].address, "0x0000000000000000000000000000000000000000000000000000000000000000" ], 
              { client: { wallet: wallets[0] } } );
  
            colorOutput(`Update EUR @ ${contractSet[0].name} Tx: ${raw}`, "magenta");            
            }

        }
      case "Loupe": {
          cut = await deployLoupeDiamond( <FacetCutAction>choice, cut);

          const before = await publicClient.getBalance({ address: accountList[0].address,})    

          await deployWithDiamondCut(cut, initFunc, diamondNames.DiamondInit.address);

          const after = await publicClient.getBalance({ address: accountList[0].address,})    

          diamondNames.DiamondLoupeFacet.address = cut[cut.length - 1].facetAddress;
          colorOutput( "Diamond Root @[".concat(diamondNames.DiamondLoupeFacet.address, "] Before @[", before, "] After @[", after, `] gaz used = ${(before - after)} `), "green");
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

        const init = await hre.viem.getContractAt( diamondNames.Diamond.name, diamondNames.Diamond.address )

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

          const before = await publicClient.getBalance({ address: accountList[0].address,})    

          cut = await deployFacets( <string>facet.contract, <FacetCutAction>choice, inputArray, cut);

          const after = await publicClient.getBalance({ address: accountList[0].address,})    

          colorOutput( "Facet @[".concat(<string>facet.contract, "] Before @[", before, "] After @[", after, `] gaz used = ${(before - after)} `), "green");

          writeList[facet.contract] = (<cutRecord>cut.slice().pop()).facetAddress;

          const isWallet = facetNames.find((el) => el.name == facet.contract)

          if (choice != FacetCutAction.Remove && isWallet?.wallet) {
            const instance = await hre.viem.getContractAt( <string>facet.contract, writeList[facet.contract] );        
            const walletAndKey = await instance.read[<string>isWallet.wallet]( [], 
              { client: { wallet: wallets[0] } } 
              );
            const raw = await init.write.updateAddressAndKeys( 
              [ writeList[facet.contract], walletAndKey[0], walletAndKey[1] ], 
              { client: { wallet: wallets[0] } } 
              );
    
            colorOutput(`Update Wallet @ ${writeList[facet.contract]} Tx: ${raw}`, "magenta");            
            }

          }

        await deployWithDiamondCut( cut, initFunc, initAddress );

        await writeLastFacetJSONfile( writeList, diamondNames.Diamond.address );
        break;
        }
      case "Contract": {
        if (trace) console.log("Contract found", contractSet, choice);
        //contractSet[0].address = await getOrDeployContract( contractSet[0], <string>contractSet[0].name, <FacetCutAction>choice );

        if (choice != FacetCutAction.Remove) {
            const instance = await hre.viem.deployContract( contractSet[0].name );
            colorOutput(`Add ${contractSet[0].name} @: ${instance.address}`, "magenta");        
            contractSet[0].address = instance.address;
            // We need to write down the new address in a json file
            writeLastContractJSONfile();

            // Here we update address registration for EUR
            const init = await hre.viem.getContractAt( diamondNames.Diamond.name, diamondNames.Diamond.address )
            const raw = await init.write.updateAddressAndKeys( 
              [ NULL_ADDRESS, instance.address, "0x0000000000000000000000000000000000000000000000000000000000000000" ], 
              { client: { wallet: wallets[0] } } );

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