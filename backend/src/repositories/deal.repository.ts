import { PrismaClient, Prisma } from '@prisma/client';
import { PaginationQuery } from '../validators/public.validator';

const prisma = new PrismaClient();

export const findDeals = async (query: PaginationQuery, skip: number) => {
  const where: Prisma.DealWhereInput = {
    is_active: true,
    starts_at: { lte: new Date() },
    ends_at: { gte: new Date() },
  };

  const [total, items] = await Promise.all([
    prisma.deal.count({ where }),
    prisma.deal.findMany({
      where,
      orderBy: { starts_at: 'desc' },
      skip,
      take: query.limit,
      include: {
        product: { select: { id: true, name: true, slug: true, primary_image: true, price: true } }
      }
    }),
  ]);

  return { total, items };
};

export const findDealById = async (id: string) => {
  return prisma.deal.findFirst({
    where: { 
      id,
      is_active: true,
    },
    include: {
        product: { select: { id: true, name: true, slug: true, primary_image: true, price: true } }
    }
  });
};
