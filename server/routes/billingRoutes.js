import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkWorkspaceAccess, requireWorkspaceRole } from '../middleware/workspaceMiddleware.js';
import {
  getBillingStatus,
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
} from '../controllers/billingController.js';

const router = express.Router();

// Webhook — raw body, no auth
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.use(protect);
router.get ('/:workspaceId/status',   checkWorkspaceAccess, getBillingStatus);
router.post('/:workspaceId/checkout', checkWorkspaceAccess, requireWorkspaceRole('admin'), createCheckoutSession);
router.post('/:workspaceId/portal',   checkWorkspaceAccess, requireWorkspaceRole('admin'), createPortalSession);

export default router;