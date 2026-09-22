import { Router } from 'express';
import * as projectController from '../controllers/project.controller';

const router = Router();

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

export default router;
