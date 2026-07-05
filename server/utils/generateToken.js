import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });


export const generateRefreshToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

export const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
};