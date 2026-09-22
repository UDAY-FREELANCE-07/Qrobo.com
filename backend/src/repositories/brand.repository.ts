import { PrismaClient, Prisma } from '@prisma/client';
import { BrandQuery } from '../validators/public.validator';

const prisma = new PrismaClient();

export const findBrands = async (query: BrandQuery, skip: number) => {
  const where: Prisma.BrandWhereInput = {};

  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' };
  }

  const [total, items] = await Promise.all([
    prisma.brand.count({ where }),
    prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: query.limit,
    }),
  ]);

  return { total, items };
};

export const findBrandById = async (id: string) => {
  return prisma.brand.findUnique({
    where: { id },
  });
};
