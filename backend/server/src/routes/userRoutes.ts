import { Router, Request, Response } from 'express';
import { getUserById, addUser } from '../services/userService';
import { globalState, loadWallets, assignAccounts } from '../logic/states';
import { returnAccountTable } from "../libraries/format";

const router = Router();

// Route GET pour récupérer un utilisateur par ID

router.get('/', async (req, res) => { 
  const { call, inputs } = req.query;

  console.log("GET reveived");

  await loadWallets();

  // Initialize wallet/accounts from hardhat node
  await assignAccounts();

  console.log("GET initialized", call, inputs);
  
  switch (call) {
    case "user": {
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
    }
    case "state": {
        res.json(globalState);
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
  router.post('/', (req, res) => {
    const newUser = req.body;
    const addedUser = addUser(newUser);
    res.status(201).json(addedUser);
  });
  
  export default router;
