import { Router } from 'express';
import { getUserById, addUser } from '../services/userService';

const router = Router();

// Route GET pour récupérer tous les utilisateurs
router.get('/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = getUserById(userId);
  
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  });

// Route POST pour ajouter un nouvel utilisateur
router.post('/', (req, res) => {
    const newUser = req.body;
    const addedUser = addUser(newUser);
    res.status(201).json(addedUser);
  });
  
  export default router;
