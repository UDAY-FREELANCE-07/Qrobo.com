import { Request, Response, NextFunction } from 'express';
import * as tutorialService from '../services/admin.tutorial.service';
import { createTutorialSchema, updateTutorialSchema, idParamSchema } from '../validators/admin.validator';

export const getTutorials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tutorialService.getTutorials(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getTutorialById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const tutorial = await tutorialService.getTutorialById(id);
    res.status(200).json({ status: 'success', data: tutorial });
  } catch (error) {
    next(error);
  }
};

export const createTutorial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createTutorialSchema.parse(req.body);
    const tutorial = await tutorialService.createTutorial(data);
    res.status(201).json({ status: 'success', data: tutorial });
  } catch (error) {
    next(error);
  }
};

export const updateTutorial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateTutorialSchema.parse(req.body);
    const tutorial = await tutorialService.updateTutorial(id, data);
    res.status(200).json({ status: 'success', data: tutorial });
  } catch (error) {
    next(error);
  }
};

export const deleteTutorial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await tutorialService.deleteTutorial(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
