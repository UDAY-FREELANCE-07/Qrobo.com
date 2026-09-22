import { PrismaClient, Prisma } from '@prisma/client';
import { CategoryQuery } from '../validators/public.validator';

const prisma = new PrismaClient();

export const findCategories = async (query: CategoryQuery, skip: number) => {
  const where: Prisma.CategoryWhereInput = {};

  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' };
  }

  // Handle null for top-level categories if passed explicitly as string 'null'
  if (query.parent_id !== undefined) {
    where.parent_id = query.parent_id;
  }

  if (query.is_featured !== undefined) {
    where.is_featured = query.is_featured;
  }

  const [total, items] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      skip,
      take: query.limit,
      include: {
        children: { select: { id: true, name: true, slug: true } }
      }
    }),
  ]);

  return { total, items };
};

export const findCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true, image_url: true } }
    },
  });
};
