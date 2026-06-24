import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkWorkspaceAccess, requireWorkspaceRole } from '../middleware/workspaceMiddleware.js';
import { enforceMemberLimit } from '../middleware/planMiddleware.js';
import {
  createWorkspace, getMyWorkspaces, getWorkspace,
  inviteMember, removeMember, deleteWorkspace,
  
} from '../controllers/workspaceController.js';
import projectRoutes from './projectRoutes.js';
import { getAnalytics } from '../controllers/projectController.js';
const router = express.Router();

router.use(protect);

router.post('/', createWorkspace);
router.get('/',  getMyWorkspaces);

router.get   ('/:workspaceId',                    checkWorkspaceAccess, getWorkspace);
router.post  ('/:workspaceId/invite',             checkWorkspaceAccess, requireWorkspaceRole('admin'), enforceMemberLimit, inviteMember);
router.delete('/:workspaceId/members/:userId',    checkWorkspaceAccess, requireWorkspaceRole('admin'), removeMember);
router.delete('/:workspaceId',                    checkWorkspaceAccess, deleteWorkspace);
router.get('/:workspaceId/analytics', checkWorkspaceAccess, getAnalytics);
router.use('/:workspaceId/projects', checkWorkspaceAccess, projectRoutes);

export default router;