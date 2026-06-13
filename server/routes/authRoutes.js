import express from 'express';
import passport from 'passport';
import { register, login, refresh, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from '../utils/generateToken.js'; // ← was missing

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
      }

      const accessToken  = generateAccessToken(user._id,user.role);
      const refreshToken = generateRefreshToken(user._id,user.role);
      setRefreshTokenCookie(res, refreshToken);

      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
    })(req, res, next);
  }
);

export default router;