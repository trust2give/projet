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
<<<<<<< HEAD
      res.status(404).json({ message: 'Utilisateur non trouvé' });
=======
      res.json({ message: 'Utilisateur non trouvé' });
>>>>>>> 54c3527a9e5e7af4667f885b2cca09f328e31fbd
    }
  });
  
  // Route POST pour ajouter un nouvel utilisateur
  router.post('/', (req, res) => {
    const newUser = req.body;
    const addedUser = addUser(newUser);
    res.status(201).json(addedUser);
  });
  
  export default router;
