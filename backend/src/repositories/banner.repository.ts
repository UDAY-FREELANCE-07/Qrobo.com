import { PrismaClient } from '@prisma/client';
import { PaginationQuery } from '../validators/public.validator';

const prisma = new PrismaClient();

export const findBanners = async (query: PaginationQuery, skip: number) => {
  const where = { is_active: true };

  const [total, items] = await Promise.all([
    prisma.banner.count({ where }),
    prisma.banner.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      skip,
      take: query.limit,
    }),
  ]);

  return { total, items };
};
