import { Router, Request, Response } from 'express';
import { getUserById, addUser } from '../services/userService';
import { globalState } from '../logic/states';
import { returnAccountTable } from "../libraries/format";
import { showBeacons } from "../logic/beacons";
import { rightCallback } from "../logic/rights";
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
    case "rights": {
      type refKeys = keyof typeof Account;

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
    case "write": {
      if (inputs) {
        
        }
      break;
      }
    case "state": {
      res.json( await showBeacons( [diamondNames.Diamond, ...facetNames, ...contractSet] ) );
      break;
      }
    /*case "user": {
      if (inputs) {
        try {
          const jsonData = JSON.parse(decodeURIComponent(inputs as string)); // Décoder et analyser l'objet JSON
          
          const userId = parseInt(jsonData.id);
          const user = getUserById(userId);	
    
          if (user) {
            res.json(user);
            } 
          else {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
          } 
        catch (error) {
          res.status(400).json({ message: 'Erreur lors de l\'analyse des données', error: error });
          }
        } 
      else {
        res.status(400).json({ message: 'Paramètre manquant' });
        }  
      break;
    }*/
    case "accounts": {
      res.json(returnAccountTable());
      break;
      }
    default:
      res.status(404).json({ message: 'fonction non trouvé' });
    }
  });
  
  // Route POST pour ajouter un nouvel utilisateur
  router.post('/', (req, res) => {
    const newUser = req.body;
    const addedUser = addUser(newUser);
    res.status(201).json(addedUser);
  });
  
  export default router;
