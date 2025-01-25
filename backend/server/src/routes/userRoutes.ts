import { Router, Request, Response } from 'express';
import { getUserById, addUser } from '../services/userService';

const router = Router();

// Route GET pour récupérer un utilisateur par ID
router.get('/:id', (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = getUserById(userId);
  
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  });
  
  // Route POST pour ajouter un nouvel utilisateur
  router.post('/', (req: Request, res: Response) => {
    const newUser = req.body;
    const addedUser = addUser(newUser);
    res.status(201).json(addedUser);
  });
  
  export default router;
