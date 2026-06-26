import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requirePlan } from '../middleware/planMiddleware.js';
import { getTaskSummary, getSubtaskSuggestions, getPrioritySuggestion } from '../controllers/aiController.js';

const router = express.Router({ mergeParams: true });

router.use(protect, requirePlan('business'));

router.get('/projects/:projectId/tasks/:taskId/ai/summary',   getTaskSummary);
router.get('/projects/:projectId/tasks/:taskId/ai/subtasks',  getSubtaskSuggestions);
router.get('/projects/:projectId/tasks/:taskId/ai/priority',  getPrioritySuggestion);

export default router;