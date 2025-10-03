import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: User;
}

export async function createFolder(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.redirect('/login');
  }

  const { name } = req.body;
  const userId = user.id;

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

export async function getFolder(req: AuthenticatedRequest, res: Response) {
  const user = req.user;
  if (!user) {
    return res.redirect('/login');
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).send('Folder ID is required');
  }

  const userId = user.id;

  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: parseInt(id),
        ownerId: userId
      }
    });

    if (!folder) {
      return res.status(404).send('Folder not found');
    }

    res.render('folder/index', {
      user: user,
      folder,
      files: []
    });
  } catch (error) {
    console.error('Error fetching folder:', error);
    res.redirect('/');
  }
}

export async function updateFolder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { id } = req.params;
  const { name } = req.body;
  
  if (!id) {
    res.status(400).send('Folder ID is required');
    return;
  }
  
  if (!name) {
    res.status(400).send('Folder name is required');
    return;
  }

  const userId = user.id;

  try {
    await prisma.folder.updateMany({
      where: {
        id: parseInt(id),
        ownerId: userId
      },
      data: {
        name
      }
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error updating folder:', error);
    res.redirect('/');
  }
}

export async function deleteFolder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { id } = req.params;
  if (!id) {
    res.status(400).send('Folder ID is required');
    return;
  }

  const userId = user.id;

  try {
    await prisma.folder.deleteMany({
      where: {
        id: parseInt(id),
        ownerId: userId
      }
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.redirect('/');
  }
}
