import { Request, Response, NextFunction } from 'express';
import * as promoCardService from '../services/admin.promo-card.service';
import { createPromoCardSchema, updatePromoCardSchema, idParamSchema } from '../validators/admin.validator';

export const getPromoCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promoCards = await promoCardService.getPromoCards();
    res.status(200).json({ status: 'success', data: promoCards });
  } catch (error) {
    next(error);
  }
};

export const getPromoCardById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const promoCard = await promoCardService.getPromoCardById(id);
    res.status(200).json({ status: 'success', data: promoCard });
  } catch (error) {
    next(error);
  }
};

export const createPromoCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPromoCardSchema.parse(req.body);
    const promoCard = await promoCardService.createPromoCard(data);
    res.status(201).json({ status: 'success', data: promoCard });
  } catch (error) {
    next(error);
  }
};

export const updatePromoCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updatePromoCardSchema.parse(req.body);
    const promoCard = await promoCardService.updatePromoCard(id, data);
    res.status(200).json({ status: 'success', data: promoCard });
  } catch (error) {
    next(error);
  }
};

export const deletePromoCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await promoCardService.deletePromoCard(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
