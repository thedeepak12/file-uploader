import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';

const router = Router();

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

router.get('/', isAuthenticated, getDashboard);

export default router;
