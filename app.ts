import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.render('layouts/main', {});
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
