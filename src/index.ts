import express, { Request, Response } from 'express';

const app = express();
const PORT = 3321;

app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('🚀 Hello from Express + TypeScript!');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
