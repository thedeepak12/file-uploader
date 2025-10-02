import { Router } from 'express';
import { createFolder } from '../controllers/folderController.js';

const router = Router();

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

router.post('/folders', isAuthenticated, createFolder);

export default router;
