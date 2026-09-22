import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/project.service';
import { projectQuerySchema, idParamSchema } from '../validators/public.validator';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = projectQuerySchema.parse(req.query);
    const result = await projectService.getProjects(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const project = await projectService.getProjectById(id);
    res.status(200).json({
      status: 'success',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
