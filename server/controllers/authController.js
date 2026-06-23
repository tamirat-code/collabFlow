import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import Attachment from '../models/Attachment.js';
import Notification from '../models/Notification.js';
import { generateAccessToken, generateRefreshToken, setRefreshTokenCookie } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';
import { avatarCloudinary } from '../config/avatarUpload.js';



  import { welcomeEmailTemplate,emailVerificationTemplate,passwordResetTemplate, resendVerificationTemplate, goodbyeEmailTemplate } from '../utils/emailTemplates.js';


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
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification token' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully! You can now log in.' });
};
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: 'If that email exists, a verification link has been sent.' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ message: 'Email already verified' });
  }

  
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  sendEmail({
    to: user.email,
    subject: 'Verify Your Email - CollabFlow',
    html: resendVerificationTemplate(verificationUrl, user.name),
  }).catch(console.error);

  res.json({ message: 'Verification email sent. Please check your email.' });
};
export const register = async (req, res) => {
  const { name, email, password, phone, gender, dob } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const user = await User.create({
    name, email, password,
    phone: phone || '',
    gender: gender || '',
    dob: dob || null,
  });

  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  sendEmail({
    to: user.email,
    subject: 'Verify Your Email - CollabFlow',
    html: emailVerificationTemplate(verificationUrl, user.name),
  }).catch(console.error);

  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
    user: { id: user._id, name: user.name, email: user.email, isEmailVerified: user.isEmailVerified }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.password) {
    return res.status(401).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
  }

  if (!(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isEmailVerified) {
    return res.status(403).json({
      message: 'Please verify your email first',
      needsVerification: true,
      email: user.email
    });
  }

  const accessToken = generateAccessToken(user._id,user.role);
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
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out' });
};


export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  const obj = user.toObject();
  obj.hasPassword = !!obj.password;
  delete obj.password;
  res.json(obj);
};

export const updateProfile = async (req, res) => {
  const { name, phone, gender, dob } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: name.trim(),
      phone: phone || '',
      gender: gender || '',
      dob: dob || null,
    },
    { returnDocument: 'after', runValidators: true }
  ).select('-password');

  res.json(user);
};

export const uploadAvatarHandler = async (req, res) => {
  
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.avatar?.includes('res.cloudinary.com') && user.avatarPublicId) {
    try {
      await avatarCloudinary.uploader.destroy(user.avatarPublicId);
    } catch (err) {
      console.error('Failed to remove old avatar from Cloudinary:', err.message);
    }
  }

  user.avatar = req.file.path;
  user.avatarPublicId = req.file.filename;
  await user.save();

  const safeUser = await User.findById(user._id).select('-password');
  res.json(safeUser);
};


export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.password) {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required' });
    }
    const matches = await user.comparePassword(currentPassword);
    if (!matches) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
};


export const deleteAccount = async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.password) {
    if (!password) {
      return res.status(400).json({ message: 'Password confirmation is required' });
    }
    const matches = await user.comparePassword(password);
    if (!matches) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
  }

  const ownedWorkspaces = await Workspace.find({ owner: user._id });

  for (const workspace of ownedWorkspaces) {
    const projects = await Project.find({ workspace: workspace._id });
    const projectIds = projects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } });
    const taskIds = tasks.map((t) => t._id);

    await Comment.deleteMany({ task: { $in: taskIds } });
    await Activity.deleteMany({ task: { $in: taskIds } });
    await Attachment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: { $in: projectIds } });
    await Project.deleteMany({ workspace: workspace._id });
    await Workspace.findByIdAndDelete(workspace._id);
  }

  await Workspace.updateMany(
    { 'members.user': user._id },
    { $pull: { members: { user: user._id } } }
  );

  await Notification.deleteMany({ $or: [{ recipient: user._id }, { sender: user._id }] });

  if (user.avatar?.includes('res.cloudinary.com') && user.avatarPublicId) {
    try {
      await avatarCloudinary.uploader.destroy(user.avatarPublicId);
    } catch (err) {
      console.error('Failed to remove avatar during account deletion:', err.message);
    }
  }

  const userEmail = user.email;
  const userName = user.name;

  await User.findByIdAndDelete(user._id);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  sendEmail({
    to: userEmail,
    subject: 'Your CollabFlow account has been deleted',
    html: goodbyeEmailTemplate(userName),
  }).catch((err) => console.error('Goodbye email failed:', err.message));

  res.json({ message: 'Account deleted successfully' });
};