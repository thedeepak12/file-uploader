import { Request, Response, NextFunction } from 'express';

export function validateSignup(req: Request, res: Response, next: NextFunction) {
  const body = (req.body || {}) as Partial<Record<'email' | 'password' | 'confirmPassword', string>>;
  const email = body.email ?? '';
  const password = body.password ?? '';
  const confirmPassword = body.confirmPassword ?? '';

  const errors: string[] = [];
  let confirmError = '';

  if (password !== confirmPassword) confirmError = 'Passwords do not match';

  if (errors.length > 0 || confirmError) {
    return res.status(400).render('auth/signup', {
      title: 'Sign Up',
      errors,
      confirmError,
      formData: { email },
    });
  }

  return next();
}
