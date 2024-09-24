import  { deploy, metadata, gasAmount, contract, getContract, parseEventFromContract, parseResultFromGetter, getPath, sleep, showObject} from './web3-root'
import  {meth_counts, meth_beacon, meth_create, meth_read, meth_update}  from './web3-wrap'

import { Contract } from 'web3-eth-contract'

import Web3 from 'web3'

import deployTools from './deploy'

const  { getSelectors, FacetCutAction }  = deployTools;

var stamp: number = 0;

var DiamondLoupeFacet: Contract;
var DiamondCutFacet: Contract;

(async () => {
  var totalGas = 0;

  const web3 = new Web3(web3Provider)
  const accounts = await web3.eth.getAccounts();

  var deployedList = JSON.parse(await remix.call('fileManager', 'getFile', "./scripts/depList.json"));
  
  var facetCuts = [];
  var diamondArgs;
  var diamondInit: Contract;
  var action;

  console.info(`deploy... `)

  var dependList = {};
  for (const [key, value] of Object.entries(deployedList.contracts)) {

    if (!dependList[key]) dependList[key] = {};

    dependList[key] = Object.assign( dependList[key], { 
        Path: getPath( value.Path, key),
        Type: value.Type,
        Address: value.Address, 
        deploy: value.deploy,
        childs: [], 
        action: (value.action) ? value.action : false
        } );

    if (!dependList[key].parents) dependList[key].parents = [];

    var beacon = "None::None";

    if (value.Address !== "") { // create new contract if no recorded address
      if (value.Type === "diamond") {
        dependList[key].update = value.deploy;         
        }
      else {
        beacon = await meth_beacon( await getContract( dependList[key].Path, value.Address, web3, true ),  { from: accounts[0] }, key );
        dependList[key].update = (beacon.split('::')[1] !== value.deploy);         
        }
      }
    else dependList[key].update = true;         

    const mdata = JSON.parse(await remix.call('fileManager', 'getFile', getPath( value.Path, key));

    for (const [link, item] of Object.entries(mdata.deploy["Custom"].linkReferences)) {
      dependList[key].childs.push(Object.keys(item)[0]);
      if (!dependList[Object.keys(item)[0]]) dependList[Object.keys(item)[0]] = { Type:"None", update: false, Address: "", childs: [], Path: ""};
      if (!dependList[Object.keys(item)[0]].parents) dependList[Object.keys(item)[0]].parents = [];
      dependList[Object.keys(item)[0]].parents.push(key);
      dependList[key].update =  dependList[key].update || dependList[Object.keys(item)[0]].update; 
      }    
    dependList[key].parents.forEach((name) => { dependList[name].update = dependList[name].update || dependList[key].update; });

    if (!dependList[key].update) console.info( `${key} (${value.Address}) : current: ${beacon.split('::')[1]} deploy: ${value.deploy} No Update Childs: ${JSON.stringify(dependList[key].childs)}`)
    else console.log( `${key} (${value.Address}) : current: ${beacon.split('::')[1]} deploy: ${value.deploy} To Update Childs: ${JSON.stringify(dependList[key].childs)}`)
    
    }

  try {
    var restant : number = Object.values(dependList).reduce((acc: number, child: any) => { return acc + ((child.update) ? 1 : 0); }, 0);
    var ptr : number = 0;
    while (restant > 0) {
      const key = Object.keys(dependList)[ptr];
      const value = Object.values(dependList)[ptr];
    
      //console.log(`Deploying init ${key} ${ptr} ${value}`)
    
      if (!value.update) ptr = (ptr + 1) % Object.entries(dependList).length;
      else {
        const undeployed : number = value.childs.reduce((acc, child) => { return acc + ((dependList[child].update) ? 1 : 0); }, 0);
        if (undeployed == 0) {
            const lib = await deploy(key, dependList, "Custom", web3, [], accounts[0], 4500000, false );
            value.Address = lib.address;
            value.update = false;
            
            var beacon = null;
            if (value.Type !== "diamond") beacon = await meth_beacon( await getContract( dependList[key].Path, value.Address, web3, true ),  { from: accounts[0] }, key );

            if (value.Type === "facet" || value.Type === "diamond") {

              switch (value.action) {
                case "Add": action = FacetCutAction.Add; break;
                case "Replace": action = FacetCutAction.Replace; break;
                case "Remove": action = FacetCutAction.Remove; break;
                default: action = -1;
                }

              if (action >= 0) {
                facetCuts.push({
                  facetAddress: value.Address,
                  action: action,
                  functionSelectors: getSelectors(key, JSON.parse(await remix.call('fileManager', 'getFile', value.Path)))
                  })
                }
              }

            totalGas += gasAmount;
            ptr = (ptr + 1) % Object.entries(dependList).length;
            console.info(`Deployed... ${restant--} - ${key} ${value.Address} ${beacon} Facet operation ${value.action} facetCuts ${JSON.stringify(facetCuts)} Gas ${totalGas} Links ${JSON.stringify(value.childs)}`);
            }
        else ptr = (ptr + 1) % Object.entries(dependList).length;
        }
      }
    } catch (e) {console.error("Deploy Phase 1", e.message)}

  // Deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded or deployed to initialize state variables
  // Read about how the diamondCut function works in the EIP2535 Diamonds standard

  try {
      deployedList.diamonds.DiamondInit.Path = getPath( deployedList.diamonds.DiamondInit.Path, "DiamondInit");
      if (deployedList.diamonds.DiamondInit.deploy) {
        const cInit = await deploy("DiamondInit", deployedList.diamonds, "Custom", web3, [], accounts[0], 3500000, true );
        deployedList.diamonds.DiamondInit.Address = cInit.address;
        totalGas += gasAmount;
        console.info(`Deployed... ${stamp++} DiamondInit - ${deployedList.diamonds.DiamondInit.Path} - New ${deployedList.diamonds.DiamondInit.Address} - Gas ${gasAmount}`);
        }

      const DiamondInitmetadata = JSON.parse(await remix.call('fileManager', 'getFile', deployedList.diamonds.DiamondInit.Path))
      diamondInit = new web3.eth.Contract(DiamondInitmetadata.abi, deployedList.diamonds.DiamondInit.Address);

      diamondArgs = {
        owner: accounts[0],
        init: deployedList.diamonds.DiamondInit.Address,
        initCalldata: diamondInit.methods.init().encodeABI()
        }
    } catch (e) {console.error("Deploy Phase 2", e.message)}

  try {
    if (deployedList.diamonds.Hive.deploy) { // On doit redéployer le contrat main Hive

      var facetCuts: Array<any> = [];
      const facetVal: Array<any> = Object.entries(dependList).filter((item) => { return (item[1].action); } );
      for (const [key, value] of facetVal) {
        facetCuts.push({  facetAddress: value.Address,
                          action: FacetCutAction.Add,
                          functionSelectors: getSelectors( key, JSON.parse(await remix.call('fileManager', 'getFile', value.Path)))
                        });
        }

      deployedList.diamonds.Hive.Path = getPath( deployedList.diamonds.Hive.Path, "Hive");
      const cHive = await deploy("Hive", deployedList.diamonds, "Custom", web3, [facetCuts, diamondArgs], accounts[0], 3500000, true );
      deployedList.diamonds.Hive.Address = cHive.address;
      totalGas += gasAmount;
      }
    else {
      DiamondCutFacet = await getContract( dependList.DiamondCutFacet.Path, deployedList.diamonds.Hive.Address, web3, true );
      await DiamondCutFacet.methods.diamondCut( facetCuts, "0x0000000000000000000000000000000000000000", diamondArgs.initCalldata ).send({ from: accounts[0], gas:4500000 });
      // On garde le contrat Hive installé et il faut procéder aux ajustements de contrats
      }
    DiamondLoupeFacet = await getContract( dependList.DiamondLoupeFacet.Path, deployedList.diamonds.Hive.Address, web3, true );

    console.info(`Hive address ${stamp++}: New ${deployedList.diamonds.Hive.Address} - Gas ${gasAmount} - TotalGas ${totalGas}  diamondArgs:`, diamondArgs )  

    console.log( `Check DiamonLoupeFacet =>`, showObject( await meth_read( DiamondLoupeFacet, {from: accounts[0]}, "facets",  `DiamondLoupeFacet =>`)));
    console.log( "Facet Addresses ", showObject( await meth_read( DiamondLoupeFacet, {from: accounts[0]}, "facetAddresses",  `DiamondLoupeFacet =>`)));
    } catch (e) {console.error("Deploy Phase 4", e.message)}



})()

