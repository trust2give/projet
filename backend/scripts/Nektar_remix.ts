import  { getContract, getPath, showObject } from './web3-root'
import  { Status, Scale, Currency, meth_pollenCounts, meth_beacon, meth_create, meth_readFromId, meth_update, meth_activate}  from './web3-wrap'
import { Contract } from 'web3-eth-contract'
import Web3 from 'web3'

var myUnit: Array<any> = [];

(async () => {
  const web3 = new Web3(web3Provider)
  const accounts = await web3.eth.getAccounts();

  const deployedList = JSON.parse(await remix.call('fileManager', 'getFile', "./scripts/depList.json"));
  const hiveAddress = deployedList.diamonds.Hive.Address;   
  const hiveAccountPath = getPath( deployedList.contracts.HiveAccount.Path, "HiveAccount");
  const hivePollenPath = getPath( deployedList.contracts.HivePollen.Path, "HivePollen");
  const hiveNektarPath = getPath( deployedList.contracts.HiveNektar.Path, "HiveNektar");
  const hiveDashboardPath = getPath( deployedList.contracts.HiveDashboard.Path, "HiveDashboard");
  
  const nektarData = JSON.parse(await remix.call('fileManager', 'getFile', `./test/Data/nektars.json`));
  console.log(`Managing Nektars User`)

  var HivePollen: Contract;
  var HiveNektar: Contract;
  var HiveDashboard: Contract;
  var HiveAccount: Contract;


  type NektarTemplate = {
    name : string;
    detail: string;
    logo: string;
    from: string;
    to: string;
    period: number;
    start: number;
    quantity: number;
    tco: number;
    currency: number;
    scale: number;
    source: number;
    parent: string;
    };

  type NektarInput = { data: NektarTemplate, status: string };
  type NektarOutput = { _data: NektarTemplate, _status: number, _valid: string };
  //
  //
  try {
    HiveAccount = await getContract( hiveAccountPath, hiveAddress, web3, false );
    HivePollen = await getContract( hivePollenPath, hiveAddress, web3, false );
    HiveNektar = await getContract( hiveNektarPath, hiveAddress, web3, false );
    HiveDashboard = await getContract( hiveDashboardPath, hiveAddress, web3, false );

    const beacon1 = await meth_beacon( HiveAccount, { from: accounts[0] }, "HiveAccount", false);
    const beacon2 = await meth_beacon( HivePollen,  { from: accounts[0] }, "HivePollen", false);
    const beacon3 = await meth_beacon( HiveNektar,  { from: accounts[0] }, "HiveNektar", false);
    const beacon4 = await meth_beacon( HiveDashboard,  { from: accounts[0] }, "HiveDashboard", false);
    //const count = await meth_pollenCounts( HiveDashboard, { from: accounts[0] }, "HiveDashboard Count =>", true);
    console.info(`deploy... ${hiveAddress} - HiveAccount ${beacon1} - HivePollen ${beacon2} - HiveNektar ${beacon3} - HiveDashboard ${beacon4}`)
    } catch (e) {console.error("get contract HiveAccount =>", e.message)}
  
  var cpt: number = 0;
  for ( account of accounts.values()) {
    if (cpt > 0) { 
      await meth_readFromId( HiveAccount, { from: account }, "ACCreadUserFromAddress", [account],  `User Read @${account} =>`);
      myUnit[cpt] = { account: account, parent: await meth_readFromId( HiveAccount, { from: account }, "getParents", [account],  `Parent Read @${account} =>`) };
      }
    cpt++;
    }

  console.log( `MyUnit =>`, showObject(myUnit));

  try {
    var user: string;
    var label: string;
    var nektarStock: any;
    var nData: NektarInput;

    for ( [user, nektarStock] of Object.entries(nektarData)) {
      var accAddr: string = accounts[0];
      var parent: string = null;
      if (user.startsWith("ADDR")) { 
        accAddr = myUnit[user.substring(4)].account;
        parent = myUnit[user.substring(4)].parent[0];
        }
      const optionsCall = { from: accAddr };
      const options = { from: accAddr, gas:4500000 };
      console.log(user, nektarStock)

      for ( [label, nData] of Object.entries(nektarStock)) {
        const nektar: NektarTemplate = nData.data;

        var nektarFromId : NektarOutput = { _data: null, _status: 0,  _valid: null };

        var existing: boolean = true;

        var nektarRecorded: any = null;
/*
        if (label.startsWith('0x')) {
          nektarFromId = await meth_readFromId( HiveNektar, optionsCall, "NKTread", [ label ], `User Read => ${label}`);
    
          if (nektarFromId._valid != "OK") throw new Error("Probleme Nektar Read label not an Id or New");

          var newStatus: any = null;
          var newScope: any = null;
          var updated: any = null;

          if (nData.status) {
            if (Object.keys(Status).some((item) => (item === nData.status))) {
              if (Status[nData.status][0] != nektarFromId._data.status) {
                newStatus = await meth_activate( HiveNektar, options, Status[nData.status][1], [ label ], "nektarUpdated", "nektarError", nData.name );          
                }
              }
            }

          //string memory _detail, string memory _logo, string memory _doc, uint256 _tco, string memory _tag
          if (nektar.detail || nektar.logo || nektar.document || nektar.tco) {
            const updatedDetail = nektar.detail ? nektar.detail  : nektarFromId._data[1];
            const updatedLogo = nektar.logo ? nektar.logo  : nektarFromId._data[2];
            const updatedDoc = nektar.document ? nektar.document  : nektarFromId._data[3];
            if ((updatedDetail != nektarFromId._data[1]) || 
                (updatedLogo != nektarFromId._data[2]) || 
                (updatedDoc != nektarFromId._data[3])) {
              updated = await meth_update( HiveNektar, options, "POLUpdate", 
                                          [ label, updatedDetail, updatedLogo, updatedDoc, updatedTCO, "Modifier" ] , 
                                          "nektarUpdated", "nektarError", "Entity" );
              }
            }
          }
*/
        if (label.startsWith('New')) {
          const nektarList = await meth_readFromId( HiveNektar, optionsCall, "NKTreadFromUnit", [ parent, 0 ], `Nektar Read => ${label}`);
          if (nektarList._valid === "OK") {
            var item : string;
            var found : boolean = false;
            for ( item of nektarList._nektars) {
              const nkt : NektarOutput = await meth_readFromId( HiveNektar, optionsCall, "NKTread", [ item ], `Nektar Read => ${item}`);
              found = ((nkt._valid === "OK") && (nkt._data.from == nektar.from) && (nkt._data.to == nektar.to));
              if (found) throw new Error(`Nektar already registered ${item} / ${nektar.name} / User ${accAddr}`);
              }
            }
            
          nektar.parent = parent;
          nektar.period = 0;
          nektar.start = 0;
          nektar.quantity = 0;
          nektar.tco = 0;
          nektar.currency = 0;
          nektar.scale = 0;

          console.log( `Check Nektar =>`, showObject( nektar ));

          nektarRecorded = await meth_create( HiveNektar, options, "NKTNew", [ nektar ] , "nektarRecorded", "nektarError", "Nektar" );

          console.log( `Check Nektar =>`, showObject( nektarRecorded ));

          existing = false;
          }
        
        nektarFromId = await meth_readFromId( HiveNektar, optionsCall, "NKTread", [ (existing) ? label : nektarRecorded._id ], `Nektar Read => ${label}`);
        const outStatus: Array<any> = Object.entries(Status).filter((item) => { return (item[1][0] == nektarFromId._status); } );
        const outScale: Array<any> = Object.entries(Scale).filter((item) => { return (item[1][0] == nektarFromId._data.scale); } );
        const outCurrency: Array<any> = Object.entries(Currency).filter((item) => { return (item[1][0] == nektarFromId._data.currency); } );

        if ((nektarFromId._valid === "OK")) 
          console.info(`Nektar[ ${(existing) ? label : nektarRecorded._id} / ${accAddr} / ${outStatus[0][0]}] ${nektarRecorded ? "C" : "-"} ${newStatus ? "S" : "-"} ${updated ? "M" : "-"} ${newScope ? "G" : "-"} [${nektarFromId._data[0]}|${nektarFromId._data[1]}|${nektarFromId._data[2]}|${nektarFromId._data[3]}|${nektarFromId._data[4]}|${nektarFromId._data[5]}|${nektarFromId._data[6]}|${nektarFromId._total} ${outScale[0][0]}|${nektarFromId._tco} ${outCurrency[0][0]}]`)
        else console.error(`User[${accAddr}] - [${nektarFromId._valid}]`)
        }
      }
    } catch (e) {console.error("Step Create Nektar Contract", e.message)}
    
  return;
  try {
    var index: string;
    var nktData: { action: string, user: number, unit: number, nektar: NektarTemplate };

    for ( [index, nktData] of Object.entries(nektarData)) {
      var nektarStruct: NektarTemplate = Object.assign({}, nktData.nektar);
      console.log("=============================================================================", nektarStruct)
      
      options = { from: accounts[nktData.user], gas:4500000 };
      optionsCall = { from: accounts[nktData.user] };

      myUnit = await HiveAccount.methods.getParents(accounts[nktData.user]).call(optionsCall);
      //nektarStruct.parent = web3.utils.asciiToHex(myUnit[nktData.unit]);
      nektarStruct.parent = myUnit[nktData.unit];

      // Fetch the list of existing NEKTAR and check if nektar in list already exists
      var myNektars: { id: string, data: NektarTemplate };
      const nektars = await HiveNektar.methods.NKTreadFromUnit(nektarStruct.parent, 0).call(optionsCall);
      if (nektars._valid === "OK") {
        for (var j = 0; j < nektars._nektars.length; j++) {
          const nektar = await HiveNektar.methods.NKTread(nektars._nektars[j]).call(optionsCall);
          myNektars = ((nektar._valid === "OK") && (nektar._data.name === nktData.nektar.name)) ? { id: nektars._nektars[j], data: nektar._data} : { id: null, data: null };
          }
        console.info( `User ${nktData.nektar.name} action ${nktData.action} Nektar ${JSON.stringify(myNektars)}` );
        }

      // Fetch the list of existing POLLENS and check if pollens in list already exists
      const pollens = await HivePollen.methods.POLreadFromUnit(nektarStruct.parent, 0).call(optionsCall);
      if (pollens._valid === "OK") {
        for (var j = 0; j < pollens._pollens.length; j++) {
          const pollen = await HivePollen.methods.POLread(pollens._pollens[j]).call(optionsCall);          
          console.info(`${pollen.name}, from ${nktData.nektar.from}, to ${nktData.nektar.to} Id ${pollens._pollens[j]}}`);
          if (pollen.name === nktData.nektar.from) nektarStruct.from = pollens._pollens[j];
          if (pollen.name === nktData.nektar.to) nektarStruct.to = pollens._pollens[j];
          }
        console.info( `User ${nktData.nektar.name} action ${nktData.action} Nektar ${JSON.stringify(nektarStruct)}` );
        }

      switch (nktData.action) {
        case "create":
          parseResultFromGetter( await HivePollen.methods.POLreadScopes( nektarStruct.from ).call(optionsCall), "POLreadScopes From =>" );
          parseResultFromGetter( await HivePollen.methods.POLreadScopes( nektarStruct.to ).call(optionsCall), "POLreadScopes To =>" );

          const newNektar = await HiveNektar.methods.NKTNew( nektarStruct ).send(options);
          const nektarRecorded = parseEventFromContract(newNektar, nektarStruct.name, "nektarRecorded", "nektarError" );
          if (nektarRecorded) {
            parseResultFromGetter( await HiveNektar.methods.NKTread( nektarRecorded.returnValues._id ).call(optionsCall), "NKTreadNektar =>" );
            }
          break;
        case "modify":
          const modifyNektar = await HiveNektar.methods.NKTUpdate( myNektars.id, nektarStruct.detail, nektarStruct.logo, nektarStruct.source, "Modification" ).send(options)
          const nektarModified = parseEventFromContract(modifyNektar, nektarStruct.name, "nektarUpdated", "nektarError" );
          if (nektarModified) { parseResultFromGetter( await HiveNektar.methods.NKTread( myNektars.id ).call(optionsCall), "NKTreadNektar =>" ); }
          break;
        case "certify":
          const activeNektar = await HiveNektar.methods.NKTCertify( myNektars.id, 'Activate' ).send(options)
          const nektarActivated = parseEventFromContract(activeNektar, nektarStruct.name, "nektarUpdated", "nektarError" );    
          if (nektarActivated) { parseResultFromGetter( await HiveNektar.methods.NKTread( nektarActivated.returnValues._id ).call(optionsCall), "NKTreadNektar =>" ); }
          break;
        case "cancel":
          const cancelNektar = await HiveNektar.methods.NKTCancel( myNektars.id, 'Activate' ).send(options)
          const nektarCanceled = parseEventFromContract(cancelNektar, nektarStruct.name, "nektarUpdated", "nektarError" );    
          if (nektarCanceled) { parseResultFromGetter( await HiveNektar.methods.NKTread( nektarCanceled.returnValues._id ).call(optionsCall), "NKTreadNektar =>" ); }
          break;
        default:
        }
      }
      console.log("test")
      parseResultFromGetter( await HiveNektar.methods.NKTreadFromUnit( myUnit[nktData.unit], 0).call(optionsCall), "NKTreadNektarsFromUnit =>");
      parseResultFromGetter( await HiveDashboard.methods.NKTCounts().call(optionsCall), "NKTCounts =>" );

    } catch (e) {console.error("Step Create Nektar Contract", e.message)}

})()
