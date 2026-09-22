import * as bannerRepository from '../repositories/banner.repository';
import { PaginationQuery } from '../validators/public.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';

export const getBanners = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await bannerRepository.findBanners(query, skip);
  return paginate(items, total, page, limit);
};
