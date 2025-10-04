import express from 'express';
import dotenv from 'dotenv';
import { configureAuth } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import folderRoutes from './routes/folderRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('dist/views/dashboard'));
app.use(express.static('dist/views/folder'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

configureAuth(app);

app.use(authRoutes);
app.use(folderRoutes);
app.use(dashboardRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
