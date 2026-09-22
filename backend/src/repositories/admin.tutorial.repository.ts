import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findTutorials = async (skip: number, limit: number) => {
  const [total, items] = await Promise.all([
    prisma.tutorial.count(),
    prisma.tutorial.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
  ]);
  return { total, items };
};

export const findTutorialById = async (id: string) => {
  return prisma.tutorial.findUnique({ where: { id } });
};

export const createTutorial = async (data: any) => {
  return prisma.tutorial.create({ data });
};

export const updateTutorial = async (id: string, data: any) => {
  return prisma.tutorial.update({ where: { id }, data });
};

export const deleteTutorial = async (id: string) => {
  return prisma.tutorial.delete({ where: { id } });
};
