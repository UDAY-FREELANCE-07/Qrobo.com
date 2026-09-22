import * as bannerRepository from '../repositories/admin.banner.repository';
import { CreateBannerInput, UpdateBannerInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';

export const getBanners = async () => {
  return bannerRepository.findBanners();
};

export const getBannerById = async (id: string) => {
  const banner = await bannerRepository.findBannerById(id);
  if (!banner) {
    throw new AppError('Banner not found', 404, 'NOT_FOUND');
  }
  return banner;
};

export const createBanner = async (data: CreateBannerInput) => {
  return bannerRepository.createBanner(data);
};

export const updateBanner = async (id: string, data: UpdateBannerInput) => {
  const banner = await bannerRepository.findBannerById(id);
  if (!banner) {
    throw new AppError('Banner not found', 404, 'NOT_FOUND');
  }
  return bannerRepository.updateBanner(id, data);
};

export const deleteBanner = async (id: string) => {
  const banner = await bannerRepository.findBannerById(id);
  if (!banner) {
    throw new AppError('Banner not found', 404, 'NOT_FOUND');
  }
  await bannerRepository.deleteBanner(id);
  return null;
};
