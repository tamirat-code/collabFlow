import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', 'name avatar')
    .populate('task', 'title')
    .populate('project', 'name')
    .sort('-createdAt')
    .limit(30);
  res.json(notifications);
};

export const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user.id, read: false });
  res.json({ count });
};

export const markAsRead = async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { read: true }
  );
  res.json({ success: true });
};

export const markAllAsRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
  res.json({ success: true });
};