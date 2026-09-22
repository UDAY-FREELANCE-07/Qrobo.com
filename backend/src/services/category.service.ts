import * as categoryRepository from '../repositories/category.repository';
import { CategoryQuery } from '../validators/public.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { AppError } from '../utils/AppError';

export const getCategories = async (query: CategoryQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await categoryRepository.findCategories(query, skip);
  return paginate(items, total, page, limit);
};

export const getCategoryById = async (id: string) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }
  return category;
};
