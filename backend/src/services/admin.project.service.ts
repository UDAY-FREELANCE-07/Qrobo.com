import * as projectRepository from '../repositories/admin.project.repository';
import { CreateProjectInput, UpdateProjectInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { PaginationQuery } from '../validators/public.validator';

export const getProjects = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await projectRepository.findProjects(skip, limit);
  return paginate(items, total, page, limit);
};

export const getProjectById = async (id: string) => {
  const project = await projectRepository.findProjectById(id);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  return project;
};

export const createProject = async (data: CreateProjectInput) => {
  return projectRepository.createProject(data);
};

export const updateProject = async (id: string, data: UpdateProjectInput) => {
  const project = await projectRepository.findProjectById(id);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  return projectRepository.updateProject(id, data);
};

export const deleteProject = async (id: string) => {
  const project = await projectRepository.findProjectById(id);
  if (!project) {
    throw new AppError('Project not found', 404, 'NOT_FOUND');
  }
  await projectRepository.deleteProject(id);
  return null;
};
