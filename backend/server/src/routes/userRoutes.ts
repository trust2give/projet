import { Router, Request, Response } from 'express';
import { getUserById, addUser } from '../services/userService';

const router = Router();

// Route GET pour récupérer un utilisateur par ID
router.get('/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = getUserById(userId);	
    //res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
    if (user) {
      res.json(user);
    } else {
      res.json({ message: 'Utilisateur non trouvé' });
    }
  });
  
  // Route POST pour ajouter un nouvel utilisateur
  router.post('/', (req, res) => {
    const newUser = req.body;
    const addedUser = addUser(newUser);
    res.status(201).json(addedUser);
  });
  
  export default router;
