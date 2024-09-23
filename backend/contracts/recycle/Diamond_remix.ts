import  { deploy, metadata, gasAmount, contract, getContract, parseEventFromContract, parseResultFromGetter, getPath, sleep, showObject} from './web3-root'
import  {meth_counts, meth_beacon, meth_create, meth_read, meth_update}  from './web3-wrap'

import { Contract } from 'web3-eth-contract'

import Web3 from 'web3'

var hiveAddress = "0xFd33eca8D6411f405637877c9C7002D321182937"; 

var DiamondLoupeFacet: Contract;
var abi;
var abiItem;
var beacon;
    //     struct Facet {
    //     address facetAddress;
    //     bytes4[] functionSelectors;
    // }
(async () => {
  const web3 = new Web3(web3Provider)
  const accounts = await web3.eth.getAccounts();

  var deployedList = JSON.parse(await remix.call('fileManager', 'getFile', "./scripts/depList.json"));
  var listOfContracts = {};
  try {
    DiamondLoupeFacet = await getContract( getPath( deployedList.DiamondLoupeFacet.Path, "DiamondLoupeFacet"), hiveAddress, web3, false );
    const facets = await meth_read( DiamondLoupeFacet, {from: accounts[0]}, "facets",  `DiamondLoupeFacet =>`);
    const facetAddress = await meth_read( DiamondLoupeFacet, {from: accounts[0]}, "facetAddresses",  `DiamondLoupeFacet =>`);

    for ( const [FacetName, item] of Object.entries(deployedList)) {
      if (item.action) {
        switch (FacetName) {
          case "DiamondCutFacet":
            abi = JSON.parse(await remix.call('fileManager', 'getFile', getPath( deployedList.DiamondCutFacet.Path, "DiamondCutFacet"))).abi;
            abiItem = abi.find((element) => (element.type == 'function' && element.name == "diamondCut"));
            beacon = web3.eth.abi.encodeFunctionSignature(abiItem);
            break;
          case "DiamondLoupeFacet":
            abi = JSON.parse(await remix.call('fileManager', 'getFile', getPath( deployedList.DiamondLoupeFacet.Path, "DiamondLoupeFacet"))).abi;
            abiItem = abi.find((element) => (element.type == 'function' && element.name == "supportsInterface"));
            beacon = web3.eth.abi.encodeFunctionSignature(abiItem);
            break;
          case "OwnershipFacet":
            abi = JSON.parse(await remix.call('fileManager', 'getFile', getPath( deployedList.OwnershipFacet.Path, "OwnershipFacet"))).abi;
            abiItem = abi.find((element) => (element.type == 'function' && element.name == "owner"));
            beacon = web3.eth.abi.encodeFunctionSignature(abiItem);
            break;
          case "DiamondInit":
            abi = JSON.parse(await remix.call('fileManager', 'getFile', getPath( deployedList.DiamondInit.Path, "DiamondInit"))).abi;
            abiItem = abi.find((element) => (element.type == 'function' && element.name == "init"));
            beacon = web3.eth.abi.encodeFunctionSignature(abiItem);
            break;
          default:
            if (item.beacon) beacon = web3.eth.abi.encodeFunctionSignature({ "inputs": [], "name": `beacon_${FacetName}`, "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "pure", "type": "function" })
          }
        var found : boolean = false;
        for ( const facet of facets) {
          if (found) break;
          for ( const selector of facet.functionSelectors) {
            if (selector == beacon) {
              listOfContracts[FacetName] = facet.facetAddress;
              found = true;
              break;              
              }
            }
          }
        }
      }
    
    showObject( `Check DiamonLoupeFacet`, 0, listOfContracts);
    //showObject( "Facet Addresses ", 0, );
    } catch (e) {console.error("Deploy Phase 4", e.message)}

  console.info(`Hive address: ${hiveAddress}` )    
  

})()

