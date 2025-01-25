import express from 'express';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = 8080;

app.use(express.json()); // Middleware pour parser le JSON
app.use('/api/users', userRoutes); // Utilisation des routes des utilisateurs

app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
