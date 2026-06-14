import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';
import { passwordResetTemplate } from '../utils/emailTemplates.js';


  import { welcomeEmailTemplate } from '../utils/emailTemplates.js';


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

 
  if (!user) {
    return res.json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const resetToken = user.generateResetToken();
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

 await sendEmail({
  to: user.email,
  subject: 'Reset Your Password - CollabFlow',
  html: passwordResetTemplate(resetUrl, user.name),
});

  res.json({ message: 'If that email exists, a reset link has been sent.' });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful. Please log in.' });
};
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const user = await User.create({ name, email, password });
  const accessToken = generateAccessToken(user._id,user.role);
  const refreshToken = generateRefreshToken(user._id,user.role);
  setRefreshTokenCookie(res, refreshToken);


sendEmail({
  to: user.email,
  subject: 'Welcome to CollabFlow! 🎉',
  html: welcomeEmailTemplate(user.name),
}).catch(console.error);

  res.status(201).json({
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });

};


export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  setRefreshTokenCookie(res, refreshToken);

  res.json({
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};


export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const accessToken = generateAccessToken(decoded.id);
  res.json({ accessToken });
};


export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};


export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
};