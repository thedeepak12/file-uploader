import { Router, Request, Response, NextFunction } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';

const router = Router();

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

router.get('/', isAuthenticated, getDashboard as any);

export default router;
