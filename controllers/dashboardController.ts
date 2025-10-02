import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getDashboard(req: Request, res: Response) {
  if (!req.user) {
    return res.redirect('/login');
  }

  const userId = (req.user as any).id;

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
