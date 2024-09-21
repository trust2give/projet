import  { getContract, getPath } from './web3-root'
import  { GainScope, Status, Scale, Currency, meth_pollenCounts, meth_beacon, meth_create, meth_readFromId, meth_update, meth_activate}  from './web3-wrap'
import { Contract } from 'web3-eth-contract'
import Web3 from 'web3'

var account: number = 1;

// get from deployment deploy_remix.ts
// Address to update with that of deployed Hive Contract before executing the script


var myUnit: Array<any> = [];

(async () => {
  const web3 = new Web3(web3Provider)
  const accounts = await web3.eth.getAccounts();

  const deployedList = JSON.parse(await remix.call('fileManager', 'getFile', "./scripts/depList.json"));

  const hiveAddress = deployedList.diamonds.Hive.Address;   
  const hiveAccountPath = getPath( deployedList.contracts.HiveAccount.Path, "HiveAccount");
  const hiveDashboardPath = getPath( deployedList.contracts.HiveDashboard.Path, "HiveDashboard");

  var HiveDashboard: Contract;
  var HiveAccount: Contract;

  console.log(`Managing Dashboard`)

  try {
    HiveAccount = await getContract( hiveAccountPath, hiveAddress, web3, false );
    HiveDashboard = await getContract( hiveDashboardPath, hiveAddress, web3, false );

    const beacon1 = await meth_beacon( HiveAccount, { from: accounts[0] }, "HiveAccount", false);
    const beacon2 = await meth_beacon( HiveDashboard,  { from: accounts[0] }, "HiveDashboard", false);
    const count = await meth_pollenCounts( HiveDashboard, { from: accounts[0] }, "HiveDashboard Count =>", true);
    console.info(`deploy... ${hiveAddress} - HiveAccount ${beacon1} - HiveDashboard ${beacon2} - Pollens ${count}`)
    const overall = await meth_readFromId( HiveDashboard, optionsCall, "POLOverallStock", [], `Overall stock`);

    var tco : string = "None";
    var stock : string = "None";

    if (overall._valid ==="OK") {
      tco = overall._tco.reduce( (acc, cur, index) => {
        if (index > 0) {
          const outCurrency: Array<any> = Object.entries(Currency).filter((item) => { return (item[1][0] == index); } );
          return (acc + `| TCO ${cur} ${outCurrency[0][0]} \n`);
          } 
        return acc;
        }, "\n");

      stock = overall._scope.reduce( (acc, cur, index) => {
        if (index > 0) {
          const outScope: Array<any> = Object.entries(GainScope).filter((item) => { return (item[1][0] == index); } );
          return (acc + `| SCOPE ${outScope[0][0]} : ${cur} \n`);
          } 
        return acc;
        }, "\n");
      }
    else console.error(overall._valid);

    console.info( `OVERALL[ Pollens ${overall._pollens} - Total ${overall._total} G CO2eq ] => ${tco} - ${stock}` );
    } catch (e) {console.error("get contract HiveDashboard =>", e.message)}

  try {
    for ( var i = 1; i < accounts.length; i++) {
      await meth_readFromId( HiveAccount, { from: accounts[i] }, "ACCreadUserFromAddress", [accounts[i]],  `User Read @${accounts[i]} =>`);
      var optionsCall = { from: accounts[i] };
      const parentId = await meth_readFromId( HiveAccount, optionsCall, "getParents", [accounts[i]],  `Parent Read @${accounts[i]} =>`);
      const parentName = await meth_readFromId( HiveAccount, optionsCall, "ACCreadUnitFromId", [ parentId[0] ], `Unit Read => ${accounts[i]}`)
      const myUnit : any = { account: accounts[i], 
                             parent: parentId[0], 
                             name: parentName._data.name };

      const tcoFromId = await meth_readFromId( HiveDashboard, optionsCall, "POLTcoFromUnit", [ myUnit.parent, 0 ], `Unit Read => ${myUnit.parent}`);
      const stockFromId = await meth_readFromId( HiveDashboard, optionsCall, "POLStockFromUnit", [ myUnit.parent, 0 ], `Unit Read => ${myUnit.parent}`);

      var tco : string = "None";
      if (tcoFromId._valid ==="OK") {
        tco = tcoFromId._tco.reduce( (acc, cur, index) => {
          if (index > 0) {
            const outCurrency: Array<any> = Object.entries(Currency).filter((item) => { return (item[1][0] == index); } );
            return (acc + `| TCO ${cur} ${outCurrency[0][0]} \n`);
            } 
          return acc;
          }, "\n");
        }
      else console.error(tcoFromId._valid);

      var stock : string = "None";
      if (stockFromId._valid ==="OK") {
        stock = stockFromId._scope.reduce( (acc, cur, index) => {
          if (index > 0) {
            const outScope: Array<any> = Object.entries(GainScope).filter((item) => { return (item[1][0] == index); } );
            return (acc + `| SCOPE ${outScope[0][0]} : ${cur} \n`);
            } 
          return acc;
          }, "\n");
        }
      else console.error(stockFromId._valid);

      console.info( `BOARD[${myUnit.name} / Pollens ${tcoFromId._pollens} - Total ${stockFromId._total} G CO2eq ] => ${tco} - ${stock}` );
      
      }

    } catch (e) {console.error("Deployed Dashboard", e.message)}
})()

