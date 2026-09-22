import * as promoCardRepository from '../repositories/promo-card.repository';
import { PaginationQuery } from '../validators/public.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';

export const getPromoCards = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await promoCardRepository.findPromoCards(query, skip);
  return paginate(items, total, page, limit);
};
