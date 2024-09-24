import  {deploy, metadata, gasAmount, contract, beacon, getContract, parseEventFromContract, parseResultFromGetter, getPath, sleep, showObject} from './web3-root'
import  {meth_counts, meth_beacon, meth_create, meth_readFromId, meth_activate, meth_update} from './web3-wrap'
import { Contract } from 'web3-eth-contract'

import Web3 from 'web3'

import deployTools from './deploy'

const  { getSelectors, FacetCutAction }  = deployTools;

// get from deployment deploy_remix.ts
// Address to update with that of deployed Hive Contract before executing the script

type entityTemplate = { name: string, detail: string, logo: string, country: number, nature: number, uType: number };
type unitTemplate = { name: string, siren: string, siret: string, detail: string, logo: string, contact: string, country: number, nature: number, uType: number, size: number, sector: number };
type userTemplate = { last: string, first: string, avatar: string, email: string, role: number };
type entityInput = { data: entityTemplate, status: string };
type unitInput = { data: unitTemplate, parent: string, status: string };
type userInput = { data: userTemplate, parent: string, status: string };
type outputTemplate = { _status: number, _data: any, _error: string };

const Status = {
  DRAFT:  [1], 
	ACTIVE: [2, "activateEntity", "activateUnit", "activateUser"],
	FROZEN: [3, "freezeEntity", "freezeUnit", "freezeUser"],
  CLOSED: [4, "closeEntity", "closeUnit", "closeUser"]
  };

const Role = {
  ROLE_NONE: 0,
  ROLE_ADMIN: 1,
  ROLE_BUSINESS: 2,
  ROLE_CERTIFIER: 4,
  ROLE_FINANCE: 8,
  ROLE_FUNDER: 16,
  ROLE_DELEGATE: 32,
  ROLE_PROMOTE: 64,
  ROLE_DECISION: 128,
  ROLE_READER: 256,
  ROLE_REPORT: 512,
  };

(async () => {

  const web3 = new Web3(web3Provider)
  const accounts = await web3.eth.getAccounts();

  var options = { from: accounts[0], gas:4500000 };
  var optionsCall = { from: accounts[0] };

  var deployedList = JSON.parse(await remix.call('fileManager', 'getFile', "./scripts/depList.json"));
  var hiveAddress = deployedList.diamonds.Hive.Address; 
  var hiveAccountPath = getPath( deployedList.contracts.HiveAccount.Path, "HiveAccount");
  
  var accountData = JSON.parse(await remix.call('fileManager', 'getFile', `./test/Data/entities.json`));

  var HiveAccount: Contract;


  try {
    HiveAccount = await getContract( hiveAccountPath, hiveAddress, web3, false );
    const beacon = await meth_beacon( HiveAccount, optionsCall, "HiveAccount", false);
    const count = await meth_counts( HiveAccount, optionsCall, "HiveAccount Count =>", true);
    console.info(`deploy... HiveAccount ${hiveAddress} -  ${hiveAccountPath} - ${beacon} - Entities ${count._entities} Units ${count._units} Users ${count._users}`)
    } catch (e) {console.error("get contract HiveAccount =>", e.message)}

  var label: string;

  console.log(`Managing Entity Accounts`)

  try {
    var entityData: entityInput;
    var label: string;
    // On initialise les comptes admin de la ruche s'ils ne sont pas déjà présents
    for ( [label, entityData] of Object.entries(accountData.entity)) {
      const eData: entityInput = entityData.data;
      var entityFromId : outputTemplate = { _status: null, _data: null, _error: null };
      var entityFromName = { _entity: null, _error: null };
      if (label.startsWith('0x')) entityFromId = await meth_readFromId( HiveAccount, optionsCall, "ACCreadEntityFromId", [ label ], `Entity Read => ${label}`);
      if (label.startsWith('New')) entityFromName = await meth_readFromId( HiveAccount, optionsCall, "ACCreadentityIdFromName", [ eData.name ], "Entity Read From Id =>");

      // Check if data are coherent
      if (entityFromId._error == null && entityFromName._error == null) throw new Error("Probleme label not an Id or New");
      if (entityFromId._error != null && entityFromName._error != null) throw new Error("Probleme contradictory results");
      if (entityFromId._error !== "OK" && entityFromName._error === "OK") throw new Error(`Probleme erreurs Incoherent ${entityFromId._error} ${entityFromName._error} ${entityFromName._entity}`);

      var entityRecorded: any = null;
      var newStatus: any = null;
      var updated: any = null;

      if (entityFromId._error === "OK") {         
        if (entityFromId._data.name !== eData.name) throw new Error(`Probleme Name ${entityFromId._data.name} ${eData.name}`);
        if (entityFromId._data.country != eData.country) throw new Error(`Probleme Country ${entityFromId._data.country} ${eData.country}`);
        if (entityFromId._data.nature != eData.nature) throw new Error("Probleme Nature");
        if (entityFromId._data.uType != eData.uType) throw new Error("Probleme uType");

        if (entityData.status) {
          if (Object.keys(Status).some((item) => (item === entityData.status))) {
            if (Status[entityData.status][0] != entityFromId._status) {
              newStatus = await meth_activate( HiveAccount, options, Status[entityData.status][1], [ label ], "accountModified", "accountError", eData.name );          
              }
            }
          }
        if (eData.detail || eData.logo) {
          const updatedDetail = eData.detail ? eData.detail  : entityFromId._data.detail;
          const updatedLogo = eData.logo ? eData.logo  : entityFromId._data.logo;
          if ((updatedDetail !== entityFromId._data.detail) || (updatedLogo !== entityFromId._data.logo)) {
            updated = await meth_update( HiveAccount, options, "ACCupdateEntity", [ label, updatedDetail, updatedLogo, "Modifier" ] , "accountModified", "accountError", "Entity" );
            }
          }
        }
      if (entityFromName._error != null && entityFromName._error !== "OK") {
        entityRecorded = await meth_create( HiveAccount, options, "ACCcreateEntity", [ eData ] , "entityCreated", "accountError", "Entity" );
        }

      entityFromId = await meth_readFromId( HiveAccount, optionsCall, "ACCreadEntityFromId", [ (entityFromId._error === "OK") ? label : entityRecorded._id ], `Unit Read => ${label}`);
      const outStatus: Array<any> = Object.entries(Status).filter((item) => { return (item[1][0] == entityFromId._status); } );
      if (entityFromId._error === "OK") 
        console.info(`Entity[${(entityFromId._error === "OK") ? label : entityRecorded._id} / ${outStatus[0][0]}] ${entityRecorded ? "C" : "-"} ${newStatus ? "S" : "-"} ${updated ? "M" : "-"} ${entityFromId._data[0]} ${entityFromId._data[1]} - ${entityFromId._data[2]} ${entityFromId._data[3]}`)
      else console.error(`Entity[${(entityFromId._error === "OK") ? label : entityRecorded._id}] - [${entityFromId._error}]`)
      }
    } catch (e) {console.error("get Entities =>", e.message)}

  console.log(`Managing Unit Accounts`)

  try {
    var unitData: unitInput;

    for ([label, unitData] of Object.entries(accountData.unit)) {
      const uData: unitTemplate = unitData.data;
      const parent: Array<any> = Object.entries(accountData.entity).filter((item) => { return (item[1].data.name === unitData.parent); } );

      var unitFromId : outputTemplate = { _status: null, _data: null, _error: null };
      var unitFromName = { _unit: null, _error: null };
      if (label.startsWith('0x')) unitFromId = await meth_readFromId( HiveAccount, optionsCall, "ACCreadUnitFromId", [ label ], `Unit Read => ${label}`);
      if (label.startsWith('New')) unitFromName = await meth_readFromId( HiveAccount, optionsCall, "ACCreadUnitIdFromName", [uData.siren, uData.siret], "Unit Read From Id =>");

      // Check if data are coherent
      if (unitFromId._error == null && unitFromName._error == null) throw new Error("Probleme label not an Id or New");
      if (unitFromId._error != null && unitFromName._error != null) throw new Error("Probleme contradictory results");
      if (unitFromId._error !== "OK" && unitFromName._error === "OK") throw new Error(`Probleme erreurs Incoherent ${unitFromId._error} ${unitFromName._error} ${unitFromName._unit}`);

      var unitRecorded: any = null;
      var newStatus: any = null;
      var updated: any = null;


      if (unitFromId._error === "OK") {         
        if (unitFromId._data.name !== uData.name) throw new Error(`Probleme Name ${unitFromId._data.name} ${uData.name}`);
        if (unitFromId._data.country != uData.country) throw new Error(`Probleme Country ${unitFromId._data.country} ${uData.country}`);
        if (unitFromId._data.nature != uData.nature) throw new Error("Probleme Nature");
        if (unitFromId._data.uType != uData.uType) throw new Error("Probleme uType");

        if (unitData.status) {
          if (Object.keys(Status).some((item) => (item === unitData.status))) {
            if (Status[unitData.status][0] != unitFromId._status) {
              newStatus = await meth_activate( HiveAccount, options, Status[unitData.status][2], [ label ], "accountModified", "accountError", uData.name );          
              }
            }
          }
        if (uData.detail || uData.logo) {
          const updatedDetail = uData.detail ? uData.detail  : unitFromId._data.detail;
          const updatedLogo = uData.logo ? uData.logo  : unitFromId._data.logo;
          if ((updatedDetail !== unitFromId._data.detail) || (updatedLogo !== unitFromId._data.logo)) {
            updated = await meth_update( HiveAccount, options, "ACCupdateEntity", [ label, updatedDetail, updatedLogo, "Modifier" ] , "accountModified", "accountError", "Entity" );
            }
          }
        }

      var unitRecorded: any;
      if (unitFromName._error != null && unitFromName._error !== "OK") {
        unitRecorded = await meth_create( HiveAccount, options, "ACCcreateUnit", [ uData, parent[0] ] , "unitCreated", "accountError", "Unit" );
        if (unitRecorded) accountData.unit[label] = unitRecorded._id;
        }

      unitFromId = await meth_readFromId( HiveAccount, optionsCall, "ACCreadUnitFromId", [ (unitFromId._error === "OK") ? label : unitRecorded._id ], `Unit Read => ${label}`);
      const outStatus: Array<any> = Object.entries(Status).filter((item) => { return (item[1][0] == unitFromId._status); } );
      if (unitFromId._error === "OK") 
        console.info(`Unit[${(unitFromId._error === "OK") ? label : unitRecorded._id} / ${outStatus[0][0]}] - [${parent[0][1].data.name}]- ${unitRecorded ? "C" : "-"} ${newStatus ? "S" : "-"} ${updated ? "M" : "-"} ${unitFromId._data[0]} ${unitFromId._data[1]} - ${unitFromId._data[2]} ${unitFromId._data[3]}`)
      else console.error(`Unit[${(unitFromId._error === "OK") ? label : unitRecorded._id}] - [${unitFromId._error}]`)
    }
  } catch (e) {console.error("get Units =>", e.message)}

  console.log(`Managing User Accounts`)

  try {
    var userData: userInput;
    var parent: Array<any>;

    for ([label, userData] of Object.entries(accountData.user)) {
      var accAddr: string = accounts[0];
      if (label.startsWith("ADDR")) accAddr = accounts[label.substring(4)];
      if (label.startsWith("0x")) accAddr = label;

      const uData: userTemplate = userData.data;
      parent = Object.entries(accountData.unit).filter((item) => { return (item[1].data.name === userData.parent); } );

      var userFromAdd : outputTemplate = { _status: null, _data: null, _error: null };
      
      userFromAdd = await meth_readFromId( HiveAccount, optionsCall, "ACCreadUserFromAddress", [ accAddr ], `User Read => ${accAddr}`);

      // Check if data are coherent
      if (userFromAdd._error == null) throw new Error("Probleme label not an Id or New");

      var userRecorded: any = null;
      var newStatus: any = null;
      var updated: any = null;

      if (userFromAdd._error === "OK") {        
        if (userData.status) {
          if (Object.keys(Status).some((item) => (item === userData.status))) {
            if (Status[userData.status][0] != userFromAdd._status) {
              newStatus = await meth_activate( HiveAccount, options, Status[userData.status][3], [ accAddr ], "userModified", "accountError", uData.last );          
              }
            }
          }
        if (uData.first || uData.last || uData.email || uData.avatar) {
          const updatedFirst = uData.first ? uData.first  : userFromAdd._data.first;
          const updatedLast = uData.last ? uData.last  : userFromAdd._data.last;
          const updatedEmail = uData.email ? uData.email  : userFromAdd._data.email;
          const updatedAvatar = uData.avatar ? uData.avatar  : userFromAdd._data.avatar;
          if ((updatedFirst != userFromAdd._data.first) || 
              (updatedLast != userFromAdd._data.last) || 
              (updatedEmail != userFromAdd._data.email) || 
              (updatedAvatar != userFromAdd._data.avatar)) {
            updated = await meth_update( HiveAccount, options, "ACCupdateUser", 
                                        [ accAddr, updatedLast, updatedFirst, updatedEmail, updatedAvatar, "Modifier" ] , 
                                        "userModified", "accountError", "Entity" );
            }
          }
        }
      else userRecorded = await meth_create( HiveAccount, options, "ACCcreateUser", [ { ...uData, id: accAddr }, parent[0] ] , "userCreated", "accountError", "User" );
      
      userFromAdd = await meth_readFromId( HiveAccount, optionsCall, "ACCreadUserFromAddress", [ accAddr ], `Unit Read => ${accAddr}`);
      parent = await meth_readFromId( HiveAccount, optionsCall, "getParents", [ accAddr ], `Unit Read => ${accAddr}`);
      
      const outStatus: Array<any> = Object.entries(Status).filter((item) => { return (item[1][0] == userFromAdd._status); } );
      const outParent = Object.entries(accountData.unit).filter((item) => { return (item[0] === parent[0]); } );
      const outRole = Object.entries(Role).filter((item) => { return (item[1] & userFromAdd._data.role); } ).map((item) => { 
        return item[0];
        });

      if (userFromAdd._error === "OK") 
        console.info(`User[${accAddr} / ${JSON.stringify(outRole)} / ${outStatus[0][0]}] - [${outParent[0][1].data.name}] - ${userRecorded ? "C" : "-"} ${newStatus ? "S" : "-"} ${updated ? "M" : "-"} ${userFromAdd._data[0]} ${userFromAdd._data[1]} - ${userFromAdd._data[2]} ${userFromAdd._data[3]}`)
      else console.error(`User[${accAddr}] - [${userFromAdd._error}]`)
    }
  } catch (e) {console.error("get Users =>", e.message)}

})()

