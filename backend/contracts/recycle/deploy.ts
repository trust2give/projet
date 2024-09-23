/* global ethers */
import Web3 from 'web3'
const web3 = new Web3(web3Provider)
const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

// get function selectors from ABI

function getSelectors (contract, cont) {
  var selectors = [];
  cont.abi.forEach(function(obj) {
    if (obj.type == 'function') {
      selectors.push(web3.eth.abi.encodeFunctionSignature(obj))
    }
  selectors.contract = contract
  selectors.remove = remove
  selectors.get = "get"
  });
  //console.log(`Output : Selecteurs ${contract} => `, selectors);
  return selectors
}


// get function selector from function signature
function getSelector (func) {
  const abiInterface = new ethers.utils.Interface([func])
  return abiInterface.getSighash(ethers.utils.Fragment.from(func))
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures

function remove (functionNames) {
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === web3.eth.abi.encodeFunctionSignature(functionName)) { //this.contract.interface.getSighash(functionName)) {
        return false
      }
    }
    return true
  })
  selectors.contract = this.contract
  selectors.remove = this.remove
  selectors.get = this.get
  return selectors
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures

function get (functionNames) {
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === web3.eth.abi.encodeFunctionSignature(functionName)) {
        return true
      }
    }
    return false
  })
  selectors.contract = this.contract
  selectors.remove = this.remove
  selectors.get = this.get
  return selectors
}

// remove selectors using an array of signatures
function removeSelectors (selectors, signatures) {
  const iface = new ethers.utils.Interface(signatures.map(v => 'function ' + v))
  const removeSelectors = signatures.map(v => iface.getSighash(v))
  selectors = selectors.filter(v => !removeSelectors.includes(v))
  return selectors
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
function findAddressPositionInFacets (facetAddress, facets) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i
    }
  }
}
const deployTools = {
  getSelectors: getSelectors,
  getSelector: getSelector,
  FacetCutAction: FacetCutAction,
  remove: remove,
  removeSelectors: removeSelectors,
  findAddressPositionInFacets: findAddressPositionInFacets
  }

export default deployTools;
