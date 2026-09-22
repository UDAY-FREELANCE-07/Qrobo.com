import { Router } from 'express';
import * as tutorialController from '../controllers/tutorial.controller';

const router = Router();

router.get('/', tutorialController.getTutorials);
router.get('/:id', tutorialController.getTutorialById);

export default router;
