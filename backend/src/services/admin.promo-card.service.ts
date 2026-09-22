import * as promoCardRepository from '../repositories/admin.promo-card.repository';
import { CreatePromoCardInput, UpdatePromoCardInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';

export const getPromoCards = async () => {
  return promoCardRepository.findPromoCards();
};

export const getPromoCardById = async (id: string) => {
  const promoCard = await promoCardRepository.findPromoCardById(id);
  if (!promoCard) {
    throw new AppError('Promo Card not found', 404, 'NOT_FOUND');
  }
  return promoCard;
};

export const createPromoCard = async (data: CreatePromoCardInput) => {
  return promoCardRepository.createPromoCard(data);
};

export const updatePromoCard = async (id: string, data: UpdatePromoCardInput) => {
  const promoCard = await promoCardRepository.findPromoCardById(id);
  if (!promoCard) {
    throw new AppError('Promo Card not found', 404, 'NOT_FOUND');
  }
  return promoCardRepository.updatePromoCard(id, data);
};

export const deletePromoCard = async (id: string) => {
  const promoCard = await promoCardRepository.findPromoCardById(id);
  if (!promoCard) {
    throw new AppError('Promo Card not found', 404, 'NOT_FOUND');
  }
  await promoCardRepository.deletePromoCard(id);
  return null;
};
