import * as brandRepository from '../repositories/admin.brand.repository';
import { CreateBrandInput, UpdateBrandInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { PaginationQuery } from '../validators/public.validator';

export const getBrands = async (query: PaginationQuery & { search?: string }) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await brandRepository.findBrands(skip, limit, query);
  return paginate(items, total, page, limit);
};

export const getBrandById = async (id: string) => {
  const brand = await brandRepository.findBrandById(id);
  if (!brand) {
    throw new AppError('Brand not found', 404, 'NOT_FOUND');
  }
  return brand;
};

export const createBrand = async (data: CreateBrandInput) => {
  return brandRepository.createBrand(data);
};

export const updateBrand = async (id: string, data: UpdateBrandInput) => {
  const brand = await brandRepository.findBrandById(id);
  if (!brand) {
    throw new AppError('Brand not found', 404, 'NOT_FOUND');
  }
  return brandRepository.updateBrand(id, data);
};

export const deleteBrand = async (id: string) => {
  const brand = await brandRepository.findBrandById(id);
  if (!brand) {
    throw new AppError('Brand not found', 404, 'NOT_FOUND');
  }

  if (brand._count.products > 0) {
    throw new AppError('Cannot delete brand because it has associated products', 400, 'BAD_REQUEST');
  }

  await brandRepository.deleteBrand(id);
  return null;
};
