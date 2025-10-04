import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

    const files = await prisma.file.findMany({
      where: {
        folderId: parseInt(id),
        ownerId: userId
      },
      orderBy: {
        modifiedAt: 'desc'
      }
    });

    res.render('folder/index', {
      user: user,
      folder,
      files
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

export async function uploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { id } = req.params;
  const file = req.file;

  if (!file) {
    res.status(400).send('No file uploaded');
    return;
  }

  if (!id) {
    res.status(400).send('Folder ID is required');
    return;
  }

  const userId = user.id;
  const folderId = parseInt(id);

  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        ownerId: userId
      }
    });

    if (!folder) {
      res.status(404).send('Folder not found');
      return;
    }

    await prisma.file.create({
      data: {
        name: file.originalname,
        size: file.size,
        ownerId: userId,
        folderId: folderId
      }
    });

    await prisma.folder.update({
      where: { id: folderId },
      data: {
        size: folder.size + file.size
      }
    });

    res.redirect(`/folders/${folderId}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
}
