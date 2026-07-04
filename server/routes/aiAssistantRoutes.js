import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkWorkspaceAccess } from '../middleware/workspaceMiddleware.js';
import { requirePlan } from '../middleware/planMiddleware.js';
import { getConversation, sendMessage, clearConversation } from '../controllers/aiAssistantController.js';

const router = express.Router();

router.use(protect);

router.get(
  '/:workspaceId/conversation',
  checkWorkspaceAccess,
  requirePlan('pro', 'business'),
  getConversation
);
router.post(
  '/:workspaceId/message',
  checkWorkspaceAccess,
  requirePlan('pro', 'business'),
  sendMessage
);
router.delete(
  '/:workspaceId/conversation',
  checkWorkspaceAccess,
  requirePlan('pro', 'business'),
  clearConversation
);

export default router;