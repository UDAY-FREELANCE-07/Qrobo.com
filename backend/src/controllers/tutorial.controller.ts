import { Request, Response, NextFunction } from 'express';
import * as tutorialService from '../services/tutorial.service';
import { tutorialQuerySchema, idParamSchema } from '../validators/public.validator';

export const getTutorials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = tutorialQuerySchema.parse(req.query);
    const result = await tutorialService.getTutorials(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTutorialById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const tutorial = await tutorialService.getTutorialById(id);
    res.status(200).json({
      status: 'success',
      data: tutorial,
    });
  } catch (error) {
    next(error);
  }
};
