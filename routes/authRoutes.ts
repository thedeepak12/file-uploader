import { Router } from 'express';
import passport from 'passport';
import { validateSignup } from '../middleware/validateForm.js';
import { postSignup } from '../controllers/authController.js';

const router = Router();

router.get('/signup', (_req, res) => {
  res.render('auth/signup', { title: 'Sign Up' });
});

router.post('/signup', validateSignup, postSignup);

router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Log In',
    loginError: req.query.error === 'true'
  });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any) => {
    if (err) return next(err);
    if (!user) {
      return res.redirect('/login?error=true');
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

export default router;
