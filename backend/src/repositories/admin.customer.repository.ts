import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const findCustomers = async (skip: number, limit: number, filters: any) => {
  const where: Prisma.UserWhereInput = { role: 'CUSTOMER' };
  
  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { full_name: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      select: {
        id: true, email: true, full_name: true, phone: true, role: true, created_at: true,
        _count: { select: { orders: true, reviews: true } }
      }
    }),
  ]);
  return { total, items };
};

export const findCustomerById = async (id: string) => {
  return prisma.user.findFirst({
    where: { id, role: 'CUSTOMER' },
    select: {
        id: true, email: true, full_name: true, phone: true, role: true, created_at: true, avatar_url: true,
        _count: { select: { orders: true, reviews: true } },
        addresses: true
    }
  });
};
