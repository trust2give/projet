import express, { Request, Response } from 'express';
import cors from 'cors';
import { handleCommand } from './commandHandler'; // Importer la fonction

const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

app.post('/command', (req: Request, res: Response) => {
    const { command } = req.body;

    // Appeler la fonction handleCommand pour traiter la commande
    const responseMessage = handleCommand(command);
    res.send(responseMessage);
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

