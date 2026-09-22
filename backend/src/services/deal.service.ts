import * as dealRepository from '../repositories/deal.repository';
import { PaginationQuery } from '../validators/public.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { AppError } from '../utils/AppError';

export const getDeals = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await dealRepository.findDeals(query, skip);
  return paginate(items, total, page, limit);
};

export const getDealById = async (id: string) => {
  const deal = await dealRepository.findDealById(id);
  if (!deal) {
    throw new AppError('Deal not found', 404, 'NOT_FOUND');
  }
  return deal;
};
