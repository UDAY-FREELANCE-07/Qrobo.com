import { PrismaClient, Prisma } from '@prisma/client';
import { TutorialQuery } from '../validators/public.validator';

const prisma = new PrismaClient();

export const findTutorials = async (query: TutorialQuery, skip: number) => {
  const where: Prisma.TutorialWhereInput = {
    is_published: true,
  };

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }

  const [total, items] = await Promise.all([
    prisma.tutorial.count({ where }),
    prisma.tutorial.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: query.limit,
    }),
  ]);

  return { total, items };
};

export const findTutorialById = async (id: string) => {
  return prisma.tutorial.findFirst({
    where: { 
      id,
      is_published: true,
    },
  });
};
