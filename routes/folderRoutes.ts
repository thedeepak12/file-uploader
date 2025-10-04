import { Router, Request, Response, NextFunction } from 'express';
import { createFolder, getFolder, updateFolder, deleteFolder, uploadFile, upload } from '../controllers/folderController.js';

const router = Router();

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function methodOverride(req: Request, _res: Response, next: NextFunction) {
  if (req.query && req.query._method) {
    req.method = req.query._method as string;
    delete req.query._method;
  }
  next();
}

router.use(methodOverride);

router.post('/folders', isAuthenticated, createFolder as any);
router.get('/folders/:id', isAuthenticated, getFolder as any);
router.put('/folders/:id', isAuthenticated, updateFolder as any);
router.delete('/folders/:id', isAuthenticated, deleteFolder as any);
router.post('/folders/:id/files', isAuthenticated, upload.single('file'), uploadFile as any);

export default router;
