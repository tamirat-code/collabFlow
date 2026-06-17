import express from 'express';
import { requireWorkspaceRole } from '../middleware/workspaceMiddleware.js';
import { requirePlan, enforceProjectLimit } from '../middleware/planMiddleware.js';
import { createProject, getProjects, getProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { createTask, getTasks, updateTask, moveTask, deleteTask } from '../controllers/taskController.js';
import { getComments, addComment, deleteComment, getActivity } from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true });


router.post('/',             requireWorkspaceRole('admin', 'member'), enforceProjectLimit, createProject);
router.get('/',              getProjects);
router.get('/:projectId',    getProject);
router.put('/:projectId',    updateProject);
router.delete('/:projectId', deleteProject);


router.post('/:projectId/tasks',              createTask);
router.get('/:projectId/tasks',               getTasks);
router.put('/:projectId/tasks/:taskId',       updateTask);
router.put('/:projectId/tasks/:taskId/move',  moveTask);
router.delete('/:projectId/tasks/:taskId',    deleteTask);


router.use('/:projectId/tasks/:taskId/comments', requirePlan('pro', 'business'));
router.use('/:projectId/tasks/:taskId/activity', requirePlan('pro', 'business'));

router.get('/:projectId/tasks/:taskId/comments',               getComments);
router.post('/:projectId/tasks/:taskId/comments',              addComment);
router.delete('/:projectId/tasks/:taskId/comments/:commentId', deleteComment);
router.get('/:projectId/tasks/:taskId/activity',               getActivity);

export default router;