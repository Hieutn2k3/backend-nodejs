import express, { Request, Response } from 'express';
import { env } from '@src/config/env';

const app = express();
const PORT = env.PORT;

app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Hello from Express + TypeScript!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
