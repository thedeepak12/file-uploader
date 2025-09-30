import session from 'express-session';
import passport from '../config/passport.js';
import { Application } from 'express';

export function configureAuth(app: Application) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  app.use(passport.initialize());
  app.use(passport.session());
}
