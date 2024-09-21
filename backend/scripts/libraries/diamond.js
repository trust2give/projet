/* global ethers */

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }
const fs = require('fs');

const web3Abi = require('web3-eth-abi')

// get function selectors from ABI
/*
function getSelectors (contract, root) {
  var signatures = [];//= Object.keys(contract.interface.functions)

  const cont = JSON.parse(fs.readFileSync(root + contract + ".json", 'utf8'));
  //console.log(cont.abi); //JSON.stringify(cont.abi));
  //const signatures = Object.keys(cont.abi);
  //console.log(signatures); //JSON.stringify(cont.abi));

  //var mycars = [{name:'Susita'}, {name:'BMW'}];

  //cont.forEach(obj => {
  cont.abi.forEach(function(obj) {
    if (obj.type == 'function') {
      var signame = obj.name + "(";
      var len = obj.inputs.length;
      obj.inputs.forEach( function(obj2) {
          if (obj2.type == 'tuple[]') {
            signame += "(";
            var len2 = obj2.components.length;
            obj2.components.forEach(function(obj3) {
              signame += obj3.type;
              if (--len2 > 0) {
                signame += ",";
                }
            });
            signame += ")";
            if (--len > 0) {
              signame += ",";
              }
            }
          else {
            signame += obj2.type;
            if (--len > 0) {
              signame += ",";
              }
          }
          });
      signame += ")";
      signatures.push(signame);
      }
    });
  //});
  console.log("Signatures " + contract, signatures);

  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)') {
      acc.push(web3Abi.encodeFunctionSignature(val))
      //acc.push(contract.interface.getSighash(val))
    }
    return acc
  }, [])
  selectors.contract = contract
  selectors.remove = remove
  selectors.get = get
  console.log("Selecteurs " + contract, selectors);
  return selectors
}
*/

// get function selectors from ABI
function getSelectors (contract, root) {
  var selectors = [];//= Object.keys(contract.interface.functions)

  const cont = JSON.parse(fs.readFileSync(root + contract + ".json", 'utf8'));
  //const signatures = Object.keys(cont.abi);
  //console.log(signatures); //JSON.stringify(cont.abi));

  //var mycars = [{name:'Susita'}, {name:'BMW'}];
  //cont.forEach(obj => {
  cont.abi.forEach(function(obj) {
    //console.log("objet : " , obj.type, obj.name); //JSON.stringify(cont.abi));
    if (obj.type == 'function') {
        //if (val !== 'init(bytes)') {
      selectors.push(web3Abi.encodeFunctionSignature(obj))
        //}
    }
  //});
  selectors.contract = contract
  selectors.remove = remove
  selectors.get = get
  });
  //console.log("Output : Selecteurs " + contract, selectors);
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
  //console.log('Input selectors:', this);
  const selectors = this.filter((v) => {
    for (const functionName of functionNames) {
      if (v === web3Abi.encodeFunctionSignature(functionName)) { //this.contract.interface.getSighash(functionName)) {
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
      if (v === web3Abi.encodeFunctionSignature(functionName)) {
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

/*
// remove selectors using an array of signatures
function removeSelectors (selectors, signatures) {
  const iface = new ethers.utils.Interface(signatures.map(v => 'function ' + v))
  const removeSelectors = signatures.map(v => iface.getSighash(v))
  selectors = selectors.filter(v => !removeSelectors.includes(v))
  return selectors
}
*/

// find a particular address position in the return value of diamondLoupeFacet.facets()
function findAddressPositionInFacets (facetAddress, facets) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i
    }
  }
}

function getCutList(list, name, instance, params, path) {
  var element = {};

  if (params.action !== false) {
    element.facetAddress = instance.address,
    element.functionSelectors = getSelectors(name, path)
    switch (params.action) {
      case "Add":
        element.action = FacetCutAction.Add,
        list.push(element);
        break;
      case "Replace":
        element.action = FacetCutAction.Replace,
        list.push(element);
        break;
      case "Remove":
        element.facetAddress = zero_address,
        element.action = FacetCutAction.Remove,
        list.push(element);
        break;
      default:
        console.log("[ACTION] - ", name, " - No action = " + params.action )
      }
    }
  return list;
}

function writeFile( content, pathname ) {
  fs.writeFile(pathname, JSON.stringify(content, null, '\t'), (err) => {
      if (err)
        console.log(err);
      else {
        console.log(pathname, " File written successfully\n");
      }
    });
  }

exports.getSelectors = getSelectors
exports.getSelector = getSelector
exports.FacetCutAction = FacetCutAction
exports.remove = remove
//exports.removeSelectors = removeSelectors
exports.findAddressPositionInFacets = findAddressPositionInFacets
exports.getCutList = getCutList
exports.writeFile = writeFile
