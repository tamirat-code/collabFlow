import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireWorkspaceRole } from '../middleware/workspaceMiddleware.js';
import {
  createProject, getProjects, getProject, updateProject, deleteProject,
} from '../controllers/projectController.js';
import {
  createTask, getTasks, updateTask, moveTask, deleteTask,
} from '../controllers/taskController.js';


const router = express.Router({ mergeParams: true });

router.post('/', requireWorkspaceRole('admin', 'member'), createProject);
router.get('/', getProjects);
router.get('/:projectId', getProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);


router.post('/:projectId/tasks', createTask);
router.get('/:projectId/tasks', getTasks);
router.put('/:projectId/tasks/:taskId', updateTask);
router.put('/:projectId/tasks/:taskId/move', moveTask);
router.delete('/:projectId/tasks/:taskId', deleteTask);

export default router;