import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import http from 'http';
import https from 'https';

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
  const folderId = parseInt(id);

  try {
    const files = await prisma.file.findMany({
      where: {
        folderId: folderId,
        ownerId: userId
      },
      select: {
        name: true,
        storageName: true
      }
    });

    for (const file of files) {
      if (file.storageName) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let resourceType = 'raw';
        
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension || '')) {
          resourceType = 'image';
        } 
        else if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'].includes(fileExtension || '')) {
          resourceType = 'video';
        }
        
        await cloudinary.uploader.destroy(file.storageName, {
          resource_type: resourceType
        });
      }
    }

    await prisma.file.deleteMany({
      where: {
        folderId: folderId,
        ownerId: userId
      }
    });

    await prisma.folder.deleteMany({
      where: {
        id: folderId,
        ownerId: userId
      }
    });

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.redirect('/');
  }
}

export const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (_req, _file, cb) => {
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

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        resource_type: 'auto',
        folder: 'file-uploader' + '/' + user.email + '/' + folder.name,
        public_id: `${userId}_${folderId}_${Date.now()}`,
      }, (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          reject(error);
          return;
        }
        resolve(result);
      });
      
      uploadStream.end(file.buffer);
    });

    await prisma.file.create({
      data: {
        name: file.originalname, 
        storageName: (uploadResult as any).public_id,
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

    res.redirect(`/folders/${id}`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
}
async function fetchWithRedirect(url: string, res: Response, redirectCount: number = 0): Promise<void> {
  if (redirectCount > 5) {
    console.error('Too many redirects');
    res.status(500).send('Error downloading file: Too many redirects');
    return;
  }

  const protocol = url.startsWith('https:') ? https : http;

  const request = protocol.get(url, (response) => {
    if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      const location = response.headers.location;
      const absoluteLocation = new URL(location, url).toString();
      fetchWithRedirect(absoluteLocation, res, redirectCount + 1);
      return;
    }

    if (!response.statusCode || response.statusCode !== 200) {
      console.error(`Failed to download file: Status code ${response.statusCode}`);
      res.status(500).send(`Error downloading file: Server returned status ${response.statusCode}`);
      return;
    }

    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }
    if (response.headers['content-disposition']) {
      res.setHeader('Content-Disposition', response.headers['content-disposition']);
    }

    response.pipe(res);
  });

  request.on('error', (err) => {
    console.error('Error streaming file:', err);
    res.status(500).send('Error downloading file');
  });

  request.setTimeout(30000, () => {
    console.error('Request timeout');
    request.destroy();
    res.status(500).send('Error downloading file: Request timeout');
  });
}

export async function downloadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { id } = req.params;
  if (!id) {
    res.status(400).send('File ID is required');
    return;
  }

  const userId = user.id;
  const fileId = parseInt(id);

  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: userId
      },
      select: {
        name: true,
        storageName: true,
        size: true
      }
    });

    if (!file) {
      res.status(404).send('File not found');
      return;
    }

    if (!file.storageName) {
      res.status(404).send('File not found in storage');
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let resourceType = 'raw';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension || '')) {
      resourceType = 'image';
    } 
    else if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'].includes(fileExtension || '')) {
      resourceType = 'video';
    }
    
    const fileUrl = cloudinary.url(file.storageName, {
      resource_type: resourceType,
      secure: true,
      type: 'upload',
      flags: 'attachment'
    });

    console.log('Generated fileUrl:', fileUrl);
    console.log('Resource type:', resourceType);
    console.log('File details:', {
      name: file.name,
      storageName: file.storageName,
      size: file.size
    });

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);

    await fetchWithRedirect(fileUrl, res);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file');
  }
}

export async function downloadFileDirect(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { id } = req.params;
  if (!id) {
    res.status(400).send('File ID is required');
    return;
  }

  const userId = user.id;
  const fileId = parseInt(id);

  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        ownerId: userId
      },
      select: {
        name: true,
        storageName: true
      }
    });

    if (!file || !file.storageName) {
      res.status(404).send('File not found');
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    let resourceType = 'raw';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension || '')) {
      resourceType = 'image';
    } 
    else if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'].includes(fileExtension || '')) {
      resourceType = 'video';
    }
    
    const fileUrl = cloudinary.url(file.storageName, {
      resource_type: resourceType,
      secure: true,
      type: 'upload',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 300
    });

    console.log('Signed fileUrl:', fileUrl);

    res.redirect(fileUrl);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file');
  }
}
