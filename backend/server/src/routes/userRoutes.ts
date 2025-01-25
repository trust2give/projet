import { Router } from 'express';

const router = Router();

// Route GET pour récupérer tous les utilisateurs
router.get('/', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);
});

// Route POST pour créer un nouvel utilisateur
router.post('/', (req, res) => {
  const newUser = req.body;
  // Logique pour ajouter un utilisateur (ex: à une base de données)
  res.status(201).json(newUser);
});

export default router;
