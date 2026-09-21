import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { AppError } from '../utils/AppError';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new AppError('You are not logged in. Please log in to get access.', 401, 'UNAUTHORIZED');
    }

    const payload = verifyAccessToken(accessToken);
    (req as any).user = payload;

    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    
    if (!roles.includes(userRole)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
    }
    
    next();
  };
};
