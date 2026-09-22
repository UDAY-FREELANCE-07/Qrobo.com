import * as tutorialRepository from '../repositories/admin.tutorial.repository';
import { CreateTutorialInput, UpdateTutorialInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { PaginationQuery } from '../validators/public.validator';

export const getTutorials = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await tutorialRepository.findTutorials(skip, limit);
  return paginate(items, total, page, limit);
};

export const getTutorialById = async (id: string) => {
  const tutorial = await tutorialRepository.findTutorialById(id);
  if (!tutorial) {
    throw new AppError('Tutorial not found', 404, 'NOT_FOUND');
  }
  return tutorial;
};

export const createTutorial = async (data: CreateTutorialInput) => {
  return tutorialRepository.createTutorial(data);
};

export const updateTutorial = async (id: string, data: UpdateTutorialInput) => {
  const tutorial = await tutorialRepository.findTutorialById(id);
  if (!tutorial) {
    throw new AppError('Tutorial not found', 404, 'NOT_FOUND');
  }
  return tutorialRepository.updateTutorial(id, data);
};

export const deleteTutorial = async (id: string) => {
  const tutorial = await tutorialRepository.findTutorialById(id);
  if (!tutorial) {
    throw new AppError('Tutorial not found', 404, 'NOT_FOUND');
  }
  await tutorialRepository.deleteTutorial(id);
  return null;
};
