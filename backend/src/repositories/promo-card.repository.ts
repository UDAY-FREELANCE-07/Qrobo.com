import { PrismaClient } from '@prisma/client';
import { PaginationQuery } from '../validators/public.validator';

const prisma = new PrismaClient();

export const findPromoCards = async (query: PaginationQuery, skip: number) => {
  const where = { is_active: true };

  const [total, items] = await Promise.all([
    prisma.promoCard.count({ where }),
    prisma.promoCard.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      skip,
      take: query.limit,
    }),
  ]);

  return { total, items };
};
