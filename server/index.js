import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from './config/Passport.js';
import 'express-async-errors';
import authRoutes from './routes/authRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import http from 'http';
import { initSocket } from './socket.js';
import { startReminderJob } from './utils/RemainderJob.js';
import aiAssistantRoutes from './routes/aiAssistantRoutes.js';
import {
  generalLimiter,
  authLimiter,
  sensitiveAuthLimiter,
  uploadLimiter,
  billingLimiter,
} from './middleware/rateLimiter.js';

const app = express();

app.set('trust proxy', 1);

app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(generalLimiter);

app.use('/api/auth/login',               authLimiter);
app.use('/api/auth/register',            authLimiter);
app.use('/api/auth/forgot-password',     sensitiveAuthLimiter);
app.use('/api/auth/reset-password',      sensitiveAuthLimiter);
app.use('/api/auth/resend-verification', sensitiveAuthLimiter);
app.use('/api/auth/verify-email',        sensitiveAuthLimiter);


app.use('/api/billing', billingLimiter);


app.use('/api/auth',          authRoutes);
app.use('/api/workspaces',    workspaceRoutes);
app.use('/api/billing',       billingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'CollabFlow API is running' });
});
const httpServer = http.createServer(app);
initSocket(httpServer);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
      startReminderJob();
    });
  })
  .catch(err => console.error(err));