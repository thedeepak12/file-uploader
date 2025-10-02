import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createFolder(req: Request, res: Response) {
  if (!req.user) {
    return res.redirect('/login');
  }

  const { name } = req.body;
  const userId = (req.user as any).id;

  try {
    await prisma.folder.create({
      data: {
        name,
        size: 0,
        ownerId: userId
      }
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error creating folder:', error);
    res.redirect('/');
  }
}
