import * as orderRepository from '../repositories/order.repository';
import { CheckoutInput } from '../validators/customer.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { AppError } from '../utils/AppError';
import { PaginationQuery } from '../validators/public.validator';

export const getOrders = async (userId: string, query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await orderRepository.findOrders(userId, skip, limit);
  return paginate(items, total, page, limit);
};

export const getOrderById = async (id: string, userId: string) => {
  const order = await orderRepository.findOrderById(id, userId);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }
  return order;
};

export const checkout = async (userId: string, data: CheckoutInput) => {
  return orderRepository.createOrder(userId, data);
};
