import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const findCategories = async (skip: number, limit: number, filters: any) => {
  const where: Prisma.CategoryWhereInput = {};
  
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }

  const [total, items] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } }
      }
    }),
  ]);
  return { total, items };
};

export const findCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
        parent: true,
        _count: { select: { products: true, children: true } }
    }
  });
};

export const createCategory = async (data: any) => {
  return prisma.category.create({
    data
  });
};

export const updateCategory = async (id: string, data: any) => {
  return prisma.category.update({
    where: { id },
    data
  });
};

export const deleteCategory = async (id: string) => {
  return prisma.category.delete({
    where: { id }
  });
};
