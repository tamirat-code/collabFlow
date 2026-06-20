import express from 'express';
import { requireWorkspaceRole } from '../middleware/workspaceMiddleware.js';
import { requirePlan, enforceProjectLimit } from '../middleware/planMiddleware.js';
import { createProject, getProjects, getProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { createTask, getTasks, updateTask, moveTask, deleteTask } from '../controllers/taskController.js';
import { getComments, addComment, deleteComment, getActivity } from '../controllers/commentController.js';
import { getAttachments, uploadAttachment, deleteAttachment } from '../controllers/attachmentController.js';
import {upload} from '../config/Cloudinary.js';
import multer from 'multer';
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

router.use('/:projectId/tasks/:taskId/attachments', requirePlan('pro', 'business'));

router.get('/:projectId/tasks/:taskId/attachments',                    getAttachments);
router.post('/:projectId/tasks/:taskId/attachments', upload.single('file'), (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}, uploadAttachment);
router.delete('/:projectId/tasks/:taskId/attachments/:attachmentId',   deleteAttachment);


export default router;