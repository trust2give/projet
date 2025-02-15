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
import { callbackType, cutRecord, rwType, Account, NULL_ADDRESS, regex, regex2, regex3, contractRecord, NULL_HASH } from "../libraries/types";
import { globalState } from "./states";
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

export const deployCallback : callbackType[] = [
  { 
  call: "deploy",
  tag: "diamond", 
  callback: async ( inputs: Array<{ command: FacetCutAction }> ) => {

    var cut : cutRecord[] = [];
    var initFunc = NULL_ADDRESS;

    const [account] = await globalState.wallets.getAddresses()

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

      const { request } = await globalState.clients.simulateContract({
          address: diamondNames.Diamond.address,
          abi: diamondNames.Diamond.abi.file.abi,
          functionName: "updateAddressAndKeys",
          args: [ NULL_ADDRESS, contractSet[0].address, NULL_HASH ],
          account
      })

      console.log( "updateAddressAndKeys >> ", request )
      
      const raw = await globalState.wallets.writeContract(request)

      colorOutput(
        `Update EUR @ ${contractSet[0].name} Tx: ${raw}`, 
        "magenta"
        );            
      }

    cut = await deployLoupeDiamond( 
      <FacetCutAction>FacetCutAction.Add , 
      cut
      );

    await deployWithDiamondCut(
      cut, 
      initFunc, 
      diamondNames.DiamondInit.address
      );

    diamondNames.DiamondLoupeFacet.address = cut[cut.length - 1].facetAddress;

    await writeLastDiamondJSONfile();
  }
  },
  { 
  call: "deploy",
  tag: "stable", 
  callback: async ( inputs: Array<{ command: FacetCutAction }> ) => {
    
    const [account] = await globalState.wallets.getAddresses()
      
    await deployContractInstance( 
      contractSet[0], 
      [],  
      FacetCutAction.Add 
      );
        
    colorOutput(`Add ${contractSet[0].name} @: ${contractSet[0].address}`, "magenta");        

    // We need to write down the new address in a json file
    writeLastContractJSONfile();

    // Here we update address registration for EUR

    const { request } = await globalState.clients.simulateContract({
        address: diamondNames.Diamond.address,
        abi: diamondNames.Diamond.abi.file.abi,
        functionName: "updateAddressAndKeys",
        args: [ NULL_ADDRESS, contractSet[0].address, NULL_HASH ],
        account
    })

    console.log( "updateAddressAndKeys >> ", request )
    
    const raw = await globalState.wallets.writeContract(request)

    colorOutput(`Update EUR @ ${contractSet[0].name} Tx: ${raw}`, "magenta");            
    }
  },
  { 
  call: "deploy",
  tag: "facet", 
  callback: async ( inputs: Array<{ command: string, facet: string }> ) => {
      
    var cut : cutRecord[] = [];

    type encKeys = keyof typeof FacetCutAction;
    
    if (inputs.length == 0) return undefined;
    if (!inputs[0].command.match("[012]")) return undefined;

    var cutAction : FacetCutAction = parseInt( inputs[0].command );

    console.log( cutAction, typeof cutAction )

    if (!String(diamondNames.Diamond.address).match(regex)) 
      throw "Trying to manage facets without Diamond deployed yet :: no root address found!";
    
    var writeList : wlist = {};  

    for (const input of inputs) {

      const facet : contractRecord | undefined = facetNames.find((item : contractRecord) => item.name == input.facet );
          
      const jsonFacet = fs.readFileSync( 
        (<contractRecord>facet).abi.path, 
          'utf-8'
          );
      
      (<contractRecord>facet).abi.file = JSON.parse(jsonFacet);
            
      var inputArray = [];
      var record : any;

      const constructor = ((<contractRecord>facet).abi.file.abi.filter((item: abiData) => item.type == "constructor"))
      
      console.log("constructor", constructor);
      if (constructor != undefined && constructor.length > 0) {
        record = { 
          rwType: rwType.CONSTRUCTOR,
          contract: (<contractRecord>facet).name,
          instance: (<contractRecord>facet).abi.file,
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
        }
                
      cut = await deployFacets( 
        <string>(<contractRecord>facet).name, 
        <FacetCutAction>cutAction, 
        inputArray, 
        cut
        );

      writeList = Object.assign( 
        writeList, 
        Object.fromEntries(
          new Map( [ 
              [ 
              `${(<contractRecord>facet).name}`,  
              (<cutRecord>cut.slice().pop()).facetAddress
              ] 
            ])
          )
        );
  
    const isWallet : boolean = ("wallet" in (<contractRecord>facet)) && (typeof (<contractRecord>facet).wallet == "string");

    if (cutAction != FacetCutAction.Remove && isWallet) {

      console.log( <string>(<contractRecord>facet).name, writeList, writeList[<string>(<contractRecord>facet).name], (<contractRecord>facet).wallet, cut);

      const beacon = await globalState.clients.readContract({
        address: writeList[<string>(<contractRecord>facet).name],
        abi: (<contractRecord>facet).abi.file.abi,
        functionName: <string>(<contractRecord>facet).beacon,
        args: []
        })

      console.log( "beacon", (<contractRecord>facet).beacon, beacon );

      const walletAndKey = await globalState.clients.readContract({
        address: writeList[<string>(<contractRecord>facet).name],
        abi: (<contractRecord>facet).abi.file.abi,
        functionName: <string>(<contractRecord>facet).wallet,
        args: []
        })
      
      colorOutput("Fectch Stable Coin Wallet@ >> ".concat( walletAndKey[0] ), "cyan")

      const [account] = await globalState.wallets.getAddresses()
      
      const { request } = await globalState.clients.simulateContract({
          address: diamondNames.Diamond.address,
          abi: diamondNames.Diamond.abi.file.abi,
          functionName: "updateAddressAndKeys",
          args: [ writeList[<string>(<contractRecord>facet).name], walletAndKey[0], walletAndKey[1] ],
          account
      })

      console.log( "updateAddressAndKeys >> ", request )
      
      const raw = await globalState.wallets.writeContract(request)
          
      colorOutput(
        `Update Wallet @ ${writeList[<string>(<contractRecord>facet).name]} Tx: ${raw}`, 
        "magenta"
        );            
      }

    await deployWithDiamondCut( cut, NULL_ADDRESS, NULL_ADDRESS );

    await writeLastFacetJSONfile( 
      writeList, 
      diamondNames.Diamond.address
      );
    }
  }
  },  
]