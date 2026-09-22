import * as categoryRepository from '../repositories/admin.category.repository';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { PaginationQuery } from '../validators/public.validator';

export const getCategories = async (query: PaginationQuery & { search?: string }) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await categoryRepository.findCategories(skip, limit, query);
  return paginate(items, total, page, limit);
};

export const getCategoryById = async (id: string) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }
  return category;
};

export const createCategory = async (data: CreateCategoryInput) => {
  return categoryRepository.createCategory(data);
};

export const updateCategory = async (id: string, data: UpdateCategoryInput) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }
  
  if (data.parent_id && data.parent_id === id) {
      throw new AppError('Category cannot be its own parent', 400, 'BAD_REQUEST');
  }
  
  return categoryRepository.updateCategory(id, data);
};

export const deleteCategory = async (id: string) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new AppError('Category not found', 404, 'NOT_FOUND');
  }

  if (category._count.products > 0) {
    throw new AppError('Cannot delete category because it has associated products', 400, 'BAD_REQUEST');
  }

  if (category._count.children > 0) {
    throw new AppError('Cannot delete category because it has child categories', 400, 'BAD_REQUEST');
  }

  await categoryRepository.deleteCategory(id);
  return null;
};
