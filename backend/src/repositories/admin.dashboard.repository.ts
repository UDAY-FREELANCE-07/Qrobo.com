import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async () => {
  const [
    totalCustomers,
    totalProducts,
    totalCategories,
    totalBrands,
    totalOrders,
    totalReviews,
    revenueAgg,
    pendingOrdersCount,
    recentOrders,
    lowStockProducts
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.order.count(),
    prisma.review.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { payment_status: 'PAID' }
    }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { user: { select: { full_name: true, email: true } } }
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } }, // Simplified low stock check
      orderBy: { stock: 'asc' },
      take: 10,
      select: { id: true, name: true, sku: true, stock: true, low_stock_threshold: true }
    })
  ]);

  return {
    totalCustomers,
    totalProducts,
    totalCategories,
    totalBrands,
    totalOrders,
    totalReviews,
    totalRevenue: revenueAgg._sum.total || 0,
    pendingOrdersCount,
    recentOrders,
    lowStockProducts
  };
};
