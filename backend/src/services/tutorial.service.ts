import * as tutorialRepository from '../repositories/tutorial.repository';
import { TutorialQuery } from '../validators/public.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { AppError } from '../utils/AppError';

export const getTutorials = async (query: TutorialQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await tutorialRepository.findTutorials(query, skip);
  return paginate(items, total, page, limit);
};

export const getTutorialById = async (id: string) => {
  const tutorial = await tutorialRepository.findTutorialById(id);
  if (!tutorial) {
    throw new AppError('Tutorial not found', 404, 'NOT_FOUND');
  }
  return tutorial;
};
