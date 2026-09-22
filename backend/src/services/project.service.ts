import * as projectRepository from '../repositories/project.repository';
import { ProjectQuery } from '../validators/public.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { AppError } from '../utils/AppError';

export const getProjects = async (query: ProjectQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await projectRepository.findProjects(query, skip);
  return paginate(items, total, page, limit);
};

export const getProjectById = async (id: string) => {
  const project = await projectRepository.findProjectById(id);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  return project;
};
