import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/admin.dashboard.service';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
};
