import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 8080; // ou un autre port
const HOST = '0.0.0.0'; // Écouter sur toutes les interfaces réseau

app.use(cors());
app.use(express.json());

app.post('/command', (req: Request, res: Response) => {
    const { command } = req.body;

    if (command === 'greet') {
        res.send('Hello, World!');
    } else if (command === 'time') {
        res.send(`Current time is: ${new Date().toISOString()}`);
    } else {
        res.status(400).send('Unknown command');
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

