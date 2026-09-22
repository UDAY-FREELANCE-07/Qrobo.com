import * as dealRepository from '../repositories/admin.deal.repository';
import * as productRepository from '../repositories/admin.product.repository';
import { CreateDealInput, UpdateDealInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { PaginationQuery } from '../validators/public.validator';

export const getDeals = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await dealRepository.findDeals(skip, limit);
  return paginate(items, total, page, limit);
};

export const getDealById = async (id: string) => {
  const deal = await dealRepository.findDealById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404, 'NOT_FOUND');
  }
  return deal;
};

export const createDeal = async (data: CreateDealInput) => {
  const product = await productRepository.findProductById(data.product_id);
  if (!product) {
    throw new AppError('Product not found for this deal', 404, 'NOT_FOUND');
  }

  return dealRepository.createDeal(data);
};

export const updateDeal = async (id: string, data: UpdateDealInput) => {
  const deal = await dealRepository.findDealById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404, 'NOT_FOUND');
  }

  if (data.product_id) {
    const product = await productRepository.findProductById(data.product_id);
    if (!product) {
      throw new AppError('Product not found for this deal', 404, 'NOT_FOUND');
    }
  }

  return dealRepository.updateDeal(id, data);
};

export const deleteDeal = async (id: string) => {
  const deal = await dealRepository.findDealById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404, 'NOT_FOUND');
  }
  await dealRepository.deleteDeal(id);
  return null;
};
