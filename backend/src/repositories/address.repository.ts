import { PrismaClient } from '@prisma/client';
import { CreateAddressInput, UpdateAddressInput } from '../validators/customer.validator';

const prisma = new PrismaClient();

export const findAddressesByUserId = async (userId: string) => {
  return prisma.address.findMany({
    where: { user_id: userId },
    orderBy: { is_default: 'desc', created_at: 'desc' },
  });
};

export const findAddressByIdAndUserId = async (id: string, userId: string) => {
  return prisma.address.findFirst({
    where: { id, user_id: userId },
  });
};

export const createAddress = async (userId: string, data: CreateAddressInput) => {
  return prisma.$transaction(async (tx) => {
    if (data.is_default) {
      await tx.address.updateMany({
        where: { user_id: userId, is_default: true },
        data: { is_default: false },
      });
    } else {
      const existingAddress = await tx.address.findFirst({
        where: { user_id: userId },
      });
      if (!existingAddress) {
        data.is_default = true;
      }
    }

    return tx.address.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  });
};

export const updateAddress = async (id: string, userId: string, data: UpdateAddressInput) => {
  return prisma.$transaction(async (tx) => {
    if (data.is_default) {
      await tx.address.updateMany({
        where: { user_id: userId, is_default: true, id: { not: id } },
        data: { is_default: false },
      });
    }

    return tx.address.update({
      where: { id },
      data,
    });
  });
};

export const deleteAddress = async (id: string) => {
  return prisma.address.delete({
    where: { id },
  });
};
