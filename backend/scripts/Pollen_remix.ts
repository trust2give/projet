import  { getContract, getPath } from './web3-root'
import  { Status, Scale, Currency, meth_pollenCounts, meth_beacon, meth_create, meth_readFromId, meth_update, meth_activate}  from './web3-wrap'
import { Contract } from 'web3-eth-contract'
import Web3 from 'web3'

// get from deployment deploy_remix.ts
// Address to update with that of deployed Hive Contract before executing the script

var myUnit: Array<any> = [];

(async () => {
  const web3 = new Web3(web3Provider)
  const accounts = await web3.eth.getAccounts();

  const deployedList = JSON.parse(await remix.call('fileManager', 'getFile', "./scripts/depList.json"));
  const hiveAddress = deployedList.diamonds.Hive.Address;   
  const hiveAccountPath = getPath( deployedList.contracts.HiveAccount.Path, "HiveAccount");
  const hivePollenPath = getPath( deployedList.contracts.HivePollen.Path, "HivePollen");
  const hiveDashboardPath = getPath( deployedList.contracts.HiveDashboard.Path, "HiveDashboard");
  
  var accountData = JSON.parse(await remix.call('fileManager', 'getFile', `./test/Data/entities.json`));

  var HivePollen: Contract;
  var HiveDashboard: Contract;
  var HiveAccount: Contract;
  
  const pollenData = JSON.parse(await remix.call('fileManager', 'getFile', `./test/Data/pollens.json`));

  type PollenTemplate = {name : string; detail: string; logo: string; document: string; period: number; start: number; index: number; status: number; currency: number; scale: number; };
  type PollenInput = { data: PollenTemplate, tco: number, status: string, scope: Array<number> };
  type PollenOutput = { _data: PollenTemplate, _valid: string };
  type ScopeOutput = {_scope: Array<number>, _total: number, _tco: number, _scale: number, _currency: number, _valid: string};

  try {
    HiveAccount = await getContract( hiveAccountPath, hiveAddress, web3, false );
    HivePollen = await getContract( hivePollenPath, hiveAddress, web3, false );
    HiveDashboard = await getContract( hiveDashboardPath, hiveAddress, web3, false );

    const beacon1 = await meth_beacon( HiveAccount, { from: accounts[0] }, "HiveAccount", false);
    const beacon2 = await meth_beacon( HivePollen,  { from: accounts[0] }, "HivePollen", false);
    const beacon3 = await meth_beacon( HiveDashboard,  { from: accounts[0] }, "HiveDashboard", false);
    const count = await meth_pollenCounts( HiveDashboard, { from: accounts[0] }, "HiveDashboard Count =>", true);
    console.info(`deploy... ${hiveAddress} - HiveAccount ${beacon1} - HiveAccount ${beacon2} - HiveAccount ${beacon3} - Pollens ${count}`)
    } catch (e) {console.error("get contract HiveAccount =>", e.message)}

  var cpt: number = 0;
  for ( account of accounts.values()) {
    if (cpt > 0) { 
      await meth_readFromId( HiveAccount, { from: account }, "ACCreadUserFromAddress", [account],  `User Read @${account} =>`);
      myUnit[cpt] = { account: account, parent: await meth_readFromId( HiveAccount, { from: account }, "getParents", [account],  `Parent Read @${account} =>`) };
      }
    cpt++;
    }

  try {
    var user: string;
    var label: string;
    var pollenStock: any;
    var pData: PollenInput;

    for ( [user, pollenStock] of Object.entries(pollenData)) {
      var accAddr: string = accounts[0];
      var parent: string = null;
      if (user.startsWith("ADDR")) { 
        accAddr = myUnit[user.substring(4)].account;
        parent = myUnit[user.substring(4)].parent[0];
        }
      const optionsCall = { from: accAddr };
      const options = { from: accAddr, gas:4500000 };
      //console.log(user, pollenStock)
      for ( [label, pData] of Object.entries(pollenStock)) {
        const pollen: PollenTemplate = pData.data;
        var pollenFromId : PollenOutput = { _data: null, _valid: null };
        var scopeFromId : ScopeOutput = { _scope: null, _total: null, _tco: null, _scale: null, _currency: null, _valid: null };
        var existing: boolean = true;
        if (label.startsWith('0x')) {
          pollenFromId = await meth_readFromId( HivePollen, optionsCall, "POLread", [ label ], `User Read => ${label}`);
          scopeFromId = await meth_readFromId( HivePollen, optionsCall, "POLreadScopes", [ label ], `User Read => ${label}`);
    
          if (pollenFromId._valid != "OK") throw new Error("Probleme Pollen Read label not an Id or New");
          if (scopeFromId._valid != "OK") throw new Error("Probleme Scope Read label not an Id or New");

          var pollenRecorded: any = null;
          var scopeRecorded: any = null;
          var newStatus: any = null;
          var newScope: any = null;
          var updated: any = null;

          if (pData.status) {
            if (Object.keys(Status).some((item) => (item === pData.status))) {
              if (Status[pData.status][0] != pollenFromId._data.status) {
                newStatus = await meth_activate( HivePollen, options, Status[pData.status][1], [ label ], "pollenUpdated", "pollenError", pData.name );          
                }
              }
            }

          if (pData.scope) {
            if (scopeFromId._scale != pollen.scale) throw new Error("Probleme Pollen scope scale incompatible");

            const delta = pData.scope.reduce((accumulator, currentValue, index) => { return (scopeFromId._scope[index] != currentValue) || accumulator; }, false)
            if (delta) {
              newScope = await meth_update( HivePollen, options, "POLUpdateScopes", [ label, pData.scope, pollen.scale, "M" ], "pollenUpdated", "pollenError", pData.name );          
              }
            }

          //string memory _detail, string memory _logo, string memory _doc, uint256 _tco, string memory _tag
          if (pollen.detail || pollen.logo || pollen.document || pollen.tco) {
            const updatedDetail = pollen.detail ? pollen.detail  : pollenFromId._data[1];
            const updatedLogo = pollen.logo ? pollen.logo  : pollenFromId._data[2];
            const updatedDoc = pollen.document ? pollen.document  : pollenFromId._data[3];
            const updatedTCO = (pData.tco > 0) ? pData.tco  : scopeFromId._tco;
            if (scopeFromId._currency != pollen.currency) throw new Error("Probleme Pollen currency incompatible");
            if ((updatedDetail != pollenFromId._data[1]) || 
                (updatedLogo != pollenFromId._data[2]) || 
                (updatedDoc != pollenFromId._data[3]) || 
                (updatedTCO != scopeFromId._tco)) {
              updated = await meth_update( HivePollen, options, "POLUpdate", 
                                          [ label, updatedDetail, updatedLogo, updatedDoc, updatedTCO, "Modifier" ] , 
                                          "pollenUpdated", "pollenError", "Entity" );
              }
            }
          }

        if (label.startsWith('New')) {
          const pollenList = await meth_readFromId( HivePollen, optionsCall, "POLreadFromUnit", [ parent, 0 ], `Pollen Read => ${label}`);
          if (pollenList._valid === "OK") {
            var item : string;
            var found : boolean = false;
            for ( item of pollenList._pollens) {
              const pol = await meth_readFromId( HivePollen, optionsCall, "POLread", [ item ], `Pollen Read => ${item}`);
              found = ((pol._valid === "OK") && (pol._data.start == pollen.start) && (pol._data.period == pollen.period) && (pol._data.index == pollen.index));
              if (found) throw new Error(`Pollen already registered ${item} / ${pollen.name} / User ${accAddr}`);
              }
            }
          pollen.status = 0;
          pollenRecorded = await meth_create( HivePollen, options, "POLNew", [ parent, pollen ] , "pollenRecorded", "pollenError", "Pollen" );
          scopeRecorded = await meth_update( HivePollen, options, "POLUpdateScopes", [ pollenRecorded._id, pData.scope, pollen.scale, "Creation" ] , "pollenUpdated", "pollenError", pData.name );
          existing = false;
          }
        
        pollenFromId = await meth_readFromId( HivePollen, optionsCall, "POLread", [ (existing) ? label : pollenRecorded._id ], `Pollen Read => ${label}`);
        scopeFromId = await meth_readFromId( HivePollen, optionsCall, "POLreadScopes", [ (existing) ? label : pollenRecorded._id ], `Scope Read => ${label}`);
        const outStatus: Array<any> = Object.entries(Status).filter((item) => { return (item[1][0] == pollenFromId._data.status); } );
        const outScale: Array<any> = Object.entries(Scale).filter((item) => { return (item[1][0] == scopeFromId._scale); } );
        const outCurrency: Array<any> = Object.entries(Currency).filter((item) => { return (item[1][0] == scopeFromId._currency); } );

        if ((pollenFromId._valid === "OK") && (scopeFromId._valid === "OK")) 
          console.info(`Pollen[ ${(existing) ? label : pollenRecorded._id} / ${accAddr} / ${outStatus[0][0]}] ${pollenRecorded && scopeRecorded ? "C" : "-"} ${newStatus ? "S" : "-"} ${updated ? "M" : "-"} ${newScope ? "G" : "-"} [${pollenFromId._data[0]}|${pollenFromId._data[1]}|${pollenFromId._data[2]}|${pollenFromId._data[3]}|${pollenFromId._data[4]}|${pollenFromId._data[5]}|${pollenFromId._data[6]}|${scopeFromId._total} ${outScale[0][0]}|${scopeFromId._tco} ${outCurrency[0][0]}]`)
        else console.error(`User[${accAddr}] - [${pollenFromId._valid}] - [${scopeFromId._valid}]`)
        }
      }
    } catch (e) {console.error("Step Create Pollen Contract", e.message)}

})()
















