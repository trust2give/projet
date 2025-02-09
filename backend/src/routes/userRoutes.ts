import { Router, Request, Response } from 'express';
import { getUserById, addUser } from '../services/userService';
import { globalState } from '../logic/states';
import { instanceCallback } from "../logic/instances";
import { stateCallback } from "../logic/beacons";
import { approveCallback } from "../logic/approvals";
import { rightCallback } from "../logic/rights";
import { entityCallback } from "../logic/entity";
import { honeyCallback, fundCallback } from "../logic/honey";
import { deployCallback } from "../logic/DeployContracts";
import { contractRecord, callbackType, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";

const router = Router();

const callbacks : callbackType[] = [ 
  ...honeyCallback, 
  ...entityCallback, 
  ...approveCallback, 
  ...deployCallback, 
  ...stateCallback,
  ...instanceCallback,
  ...rightCallback
  ]; 

// Route GET pour récupérer un utilisateur par ID

router.get('/', async (req : any, res : any) => {
  
  // call + inputs ( call , inputs )

  const { call, inputs } = req.query;
  var jsonData : any;

  console.log("GET processed", call, inputs);
  
  if (inputs)
      jsonData = JSON.parse(decodeURIComponent(inputs as string)); // Décoder et analyser l'objet JSON

  const callback : callbackType | undefined = callbacks.find( (item) => (item.call == call && item.tag == jsonData.call));

  if (callback == undefined) {
    res.status(404).json({ message: 'fonction non trouvé' });
    return;
    }
  const result = await callback.callback( jsonData.inputs );
  res.status(201).json( result );
});
  
  // Route POST pour ajouter un nouvel utilisateur
  router.post('/', async (req : any, res : any) => {
    const { call, inputs } = req.query;

    var jsonData : any;
    /* { 
      call: string, 
      inputs: Array<any> | { [cle: string]: string; }
      } = { call: "", inputs: [] };*/

    var process : { 
      tag: string, 
      callback: any 
      } | undefined;

    console.log( "POST processed", call, inputs );
    
    if (inputs)
        jsonData = JSON.parse(decodeURIComponent(inputs as string)); // Décoder et analyser l'objet JSON
      
    const callback : callbackType | undefined = callbacks.find( (item) => (item.call == call && item.tag == jsonData.call));

    if (callback == undefined) {
      res.status(404).json({ message: 'fonction non trouvé' });
      return;
      }
  
    res.status(201).json( await callback.callback( jsonData.inputs ) );
    
  });
  
  export default router;
