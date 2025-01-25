import express from 'express';
import userRoutes from './routes/userRoutes';
import cors from 'cors';
import { initState } from './logic/states';

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(cors());

app.use(express.json()); // Middleware pour parser le JSON
app.use('/T2G', userRoutes); // Utilisation des routes des utilisateurs


app.listen(PORT, () => {
  
  initState();
  
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
