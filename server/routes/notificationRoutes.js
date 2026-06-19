import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.get('/',         getNotifications);
router.get('/unread',   getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;