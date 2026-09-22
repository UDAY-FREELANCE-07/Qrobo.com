import { Request, Response, NextFunction } from 'express';
import * as bannerService from '../services/admin.banner.service';
import { createBannerSchema, updateBannerSchema, idParamSchema } from '../validators/admin.validator';

export const getBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banners = await bannerService.getBanners();
    res.status(200).json({ status: 'success', data: banners });
  } catch (error) {
    next(error);
  }
};

export const getBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const banner = await bannerService.getBannerById(id);
    res.status(200).json({ status: 'success', data: banner });
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createBannerSchema.parse(req.body);
    const banner = await bannerService.createBanner(data);
    res.status(201).json({ status: 'success', data: banner });
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateBannerSchema.parse(req.body);
    const banner = await bannerService.updateBanner(id, data);
    res.status(200).json({ status: 'success', data: banner });
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await bannerService.deleteBanner(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
