import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const findOrders = async (skip: number, limit: number, filters: any) => {
  const where: Prisma.OrderWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.payment_status) where.payment_status = filters.payment_status;

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, full_name: true, email: true } },
        items: true
      }
    }),
  ]);
  return { total, items };
};

export const findOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
        user: { select: { id: true, full_name: true, email: true, phone: true } },
        items: true
    }
  });
};

export const updateOrderStatus = async (id: string, data: any) => {
  return prisma.order.update({
    where: { id },
    data
  });
};
