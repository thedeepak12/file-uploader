import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

export async function postSignup(req: Request, res: Response, next: NextFunction) {
  const {
    email = '',
    password = '',
  } = (req.body || {}) as Partial<Record<'email' | 'password', string>>;
  try {
    const prisma = new PrismaClient();
    console.log('[postSignup] Incoming signup:', { email: typeof email === 'string' && email ? email : '(empty)' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).render('auth/signup', {
        title: 'Sign Up',
        errors: ['Email already exists.'],
        formData: { email },
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        email,
        password: hashed,
      },
    });
    console.log('[postSignup] User created with id:', created.id);

    return res.redirect('/login');
  } catch (err) {
    console.error('[postSignup] Error during signup:', err);
    return next(err);
  }
}
