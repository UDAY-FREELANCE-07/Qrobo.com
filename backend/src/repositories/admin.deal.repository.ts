import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const findDeals = async (skip: number, limit: number) => {
  const [total, items] = await Promise.all([
    prisma.deal.count(),
    prisma.deal.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        product: { select: { name: true, slug: true, price: true } }
      }
    }),
  ]);
  return { total, items };
};

export const findDealById = async (id: string) => {
  return prisma.deal.findUnique({
    where: { id },
    include: { product: true }
  });
};

export const createDeal = async (data: any) => {
  return prisma.deal.create({ data });
};

export const updateDeal = async (id: string, data: any) => {
  return prisma.deal.update({ where: { id }, data });
};

export const deleteDeal = async (id: string) => {
  return prisma.deal.delete({ where: { id } });
};
