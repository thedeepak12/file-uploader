import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.redirect('/login');
  }

  const userId = req.user.id;

  try {
    const folders = await prisma.folder.findMany({
      where: { ownerId: userId },
      orderBy: { modifiedAt: 'desc' }
    });

    res.render('dashboard/index', {
      user: req.user,
      folders
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.render('dashboard/index', {
      user: req.user,
      folders: []
    });
  }
}
