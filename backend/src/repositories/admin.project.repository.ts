import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findProjects = async (skip: number, limit: number) => {
  const [total, items] = await Promise.all([
    prisma.project.count(),
    prisma.project.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
  ]);
  return { total, items };
};

export const findProjectById = async (id: string) => {
  return prisma.project.findUnique({ where: { id } });
};

export const createProject = async (data: any) => {
  return prisma.project.create({ data });
};

export const updateProject = async (id: string, data: any) => {
  return prisma.project.update({ where: { id }, data });
};

export const deleteProject = async (id: string) => {
  return prisma.project.delete({ where: { id } });
};
