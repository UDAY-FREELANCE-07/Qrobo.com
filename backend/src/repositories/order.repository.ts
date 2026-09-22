import { PrismaClient } from '@prisma/client';
import { CheckoutInput } from '../validators/customer.validator';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export const findOrders = async (userId: string, skip: number, limit: number) => {
  const where = { user_id: userId };
  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        items: {
            select: { id: true, product_id: true, product_name: true, product_image: true, price: true, quantity: true, total: true }
        }
      }
    }),
  ]);
  return { total, items };
};

export const findOrderById = async (id: string, userId: string) => {
  return prisma.order.findFirst({
    where: { id, user_id: userId },
    include: {
        items: true
    }
  });
};

export const createOrder = async (userId: string, data: CheckoutInput) => {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { user_id: userId },
      include: { items: { include: { product: true } } }
    });
    
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400, 'BAD_REQUEST');
    }

    let subtotal = 0;
    const orderItemsData = [];
    
    for (const item of cart.items) {
      if (!item.product || !item.product.is_published) {
        throw new AppError(`Product not available`, 400, 'BAD_REQUEST');
      }
      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.name}`, 400, 'BAD_REQUEST');
      }
      
      const price = Number(item.product.price);
      const total = price * item.quantity;
      subtotal += total;
      
      orderItemsData.push({
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.primary_image,
        product_slug: item.product.slug,
        sku: item.product.sku,
        price,
        quantity: item.quantity,
        total,
      });

      await tx.product.update({
        where: { id: item.product.id },
        data: { stock: item.product.stock - item.quantity }
      });
    }

    const shippingAddress = await tx.address.findFirst({
      where: { id: data.shipping_address_id, user_id: userId }
    });
    
    if (!shippingAddress) {
      throw new AppError('Shipping address not found', 404, 'NOT_FOUND');
    }
    
    let billingAddress = shippingAddress;
    if (data.billing_address_id) {
        const ba = await tx.address.findFirst({ where: { id: data.billing_address_id, user_id: userId } });
        if (ba) billingAddress = ba;
    }

    const order_number = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await tx.order.create({
      data: {
        order_number,
        user_id: userId,
        status: 'PENDING',
        payment_status: 'PENDING',
        payment_method: data.payment_method,
        subtotal,
        total: subtotal,
        shipping_address: shippingAddress as any,
        billing_address: billingAddress as any,
        notes: data.notes,
        items: {
          create: orderItemsData
        }
      },
      include: { items: true }
    });

    await tx.cartItem.deleteMany({
      where: { cart_id: cart.id }
    });

    return order;
  });
};
