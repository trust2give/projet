import { Router, Request, Response } from 'express';
import { getUserById, addUser } from '../services/userService';
import { globalState } from '../logic/states';

const router = Router();

// Route GET pour récupérer un utilisateur par ID

router.get('/', (req, res) => { 
  const { call, inputs } = req.query;
  
  switch (call) {
    case "user": {
      const userId = parseInt(inputs.id);
      const user = getUserById(userId);	
      
      if (user) {
        res.json(user);
      } 
      else {
        res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      break;
    }
    case "state": {
        res.json(globalState);
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
