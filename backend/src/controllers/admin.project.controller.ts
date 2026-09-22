import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/admin.project.service';
import { createProjectSchema, updateProjectSchema, idParamSchema } from '../validators/admin.validator';

export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await projectService.getProjects(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const project = await projectService.getProjectById(id);
    res.status(200).json({ status: 'success', data: project });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(data);
    res.status(201).json({ status: 'success', data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateProjectSchema.parse(req.body);
    const project = await projectService.updateProject(id, data);
    res.status(200).json({ status: 'success', data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await projectService.deleteProject(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
