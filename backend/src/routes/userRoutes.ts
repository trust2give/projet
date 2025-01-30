import { Router, Request, Response } from 'express';
import { getUserById, addUser } from '../services/userService';
import { globalState } from '../logic/states';
import { returnAccountTable } from "../libraries/format";
import { showBeacons } from "../logic/beacons";
import { rightCallback } from "../logic/rights";
import { createEntity, getEntity, getAllEntities } from "../logic/entity";
import { contractSet, diamondNames, facetNames, smart, smartEntry, encodeInterfaces } from "../T2G_Data";
import { contractRecord, rwRecord, rwType, menuRecord, Account, NULL_ADDRESS, regex, regex2, regex3 } from "../libraries/types";

const router = Router();

// Route GET pour récupérer un utilisateur par ID

router.get('/', async (req, res) => { 
  const { call, inputs } = req.query;
  var jsonData;

  console.log("GET processed", call, inputs);
  
  if (inputs)
      jsonData = JSON.parse(decodeURIComponent(inputs as string)); // Décoder et analyser l'objet JSON
    
  switch (call) {
    case "entity": {
      if (jsonData.call == "get") {
        if (jsonData.inputs.length != 1)
          res.json( 
            await getAllEntities()
            );
        else {
          if (jsonData.inputs[0].match(regex2))
            res.json( 
              await getEntity( jsonData.inputs[0] )
              );
            }
          }
      break;
      }
    case "rights": {
      if (jsonData.call == "get") {
        if (jsonData.inputs.length != 1)
          res.json( 
            await rightCallback.find( (item) => item.tag == "all")?.callback()
            );
        else {
          if (Number(jsonData.inputs[0]))
            res.json( 
              await rightCallback.find( (item) => item.tag == "get")?.callback( <Account>`@${jsonData.inputs[0]}` )
              );
            }
          }
      break;
      }
    case "state": {
      res.json( await showBeacons( [diamondNames.Diamond, ...facetNames, ...contractSet] ) );
      break;
      }
    case "accounts": {
      res.json(returnAccountTable());
      break;
      }
    default:
      res.status(404).json({ message: 'fonction non trouvé' });
    }
  });
  
  // Route POST pour ajouter un nouvel utilisateur
  router.post('/', async (req, res) => {
    const { call, inputs } = req.query;

    var jsonData : { 
      call: string, 
      inputs: Array<any> | { [cle: string]: string; }
      } = { call: "", inputs: [] };

    var process : { 
      tag: string, 
      callback: any 
      } | undefined;

    console.log( "POST processed", call, inputs );
    
    if (inputs)
        jsonData = JSON.parse(decodeURIComponent(inputs as string)); // Décoder et analyser l'objet JSON
      
    switch (call) {
      case "entity": {
        console.log("enter entities")
        if (jsonData.call == "company" || jsonData.call == "people") {
          if (jsonData.inputs.length == 2)
            res.status(201).json( 
              await createEntity( jsonData.inputs[0], jsonData.inputs[1])
                );
              }
        break;
        }
      case "rights": {

        process = rightCallback.find( (item) => item.tag == jsonData.call );

        if (process != undefined) {
          if (jsonData.call == "register") {
            if (jsonData.inputs.length == 2)
              res.status(201).json( 
                await process?.callback(
                    <Account>`@${jsonData.inputs[0]}`,
                    (Number(jsonData.inputs[1]) % 256)
                    )
                  );
                }
          else if (jsonData.call == "ban") {
            if (Number(jsonData.inputs[0]))
              res.status(201).json( 
                await process?.callback( 
                  <Account>`@${jsonData.inputs[0]}`
                  )
                );
            }
          }
        break;
        }
      default:
        res.status(404).json({ message: 'fonction non trouvé' });
      }
    
    //res.status(201).json(addedUser);
  });
  
  export default router;
