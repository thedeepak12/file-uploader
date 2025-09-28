import { Router } from 'express';
import { validateSignup } from '../middleware/validateForm.js';
import { postSignup } from '../controllers/authController.js';

const router = Router();

router.get('/signup', (_req, res) => {
  res.render('auth/signup', { title: 'Sign Up' });
});

router.post('/signup', validateSignup, postSignup);

export default router;
