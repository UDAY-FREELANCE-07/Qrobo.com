import * as brandRepository from '../repositories/brand.repository';
import { BrandQuery } from '../validators/public.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { AppError } from '../utils/AppError';

export const getBrands = async (query: BrandQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await brandRepository.findBrands(query, skip);
  return paginate(items, total, page, limit);
};

export const getBrandById = async (id: string) => {
  const brand = await brandRepository.findBrandById(id);
  if (!brand) {
    throw new AppError('Brand not found', 404, 'NOT_FOUND');
  }
  return brand;
};
