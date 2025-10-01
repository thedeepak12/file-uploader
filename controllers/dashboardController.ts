import { Request, Response } from 'express';

export function getDashboard(req: Request, res: Response) {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  res.render('dashboard/index', {
    user: req.user
  });
}
