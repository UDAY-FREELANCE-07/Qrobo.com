import { PrismaClient, Prisma } from '@prisma/client';
import { ProjectQuery } from '../validators/public.validator';

const prisma = new PrismaClient();

export const findProjects = async (query: ProjectQuery, skip: number) => {
  const where: Prisma.ProjectWhereInput = {
    is_published: true,
  };

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }

  const [total, items] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: query.limit,
    }),
  ]);

  return { total, items };
};

export const findProjectById = async (id: string) => {
  return prisma.project.findFirst({
    where: { 
      id,
      is_published: true,
    },
  });
};
