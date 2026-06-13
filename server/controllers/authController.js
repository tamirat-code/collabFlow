import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';


export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const user = await User.create({ name, email, password });
  const accessToken = generateAccessToken(user._id,user.role);
  const refreshToken = generateRefreshToken(user._id,user.role);
  setRefreshTokenCookie(res, refreshToken);

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