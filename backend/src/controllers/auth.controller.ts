import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { signupSchema, signinSchema } from '../validators/auth.validator';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.util';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { AppError } from '../utils/AppError';

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = signupSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.signup(data);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = signinSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.signin(data);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const signout = (req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const user = await authService.getUserById(userId);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401, 'UNAUTHORIZED');
    }

    const payload = verifyRefreshToken(refreshToken);
    
    const newAccessToken = generateAccessToken({ userId: payload.userId, role: payload.role });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, role: payload.role });

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.status(200).json({
      status: 'success',
      message: 'Tokens refreshed'
    });
  } catch (error) {
    next(new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED'));
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { full_name, phone } = req.body;
    const user = await authService.updateProfile(userId, { full_name, phone });
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { password } = req.body;
    await authService.updatePassword(userId, password);
    res.status(200).json({ status: 'success', message: 'Password updated' });
  } catch (error) {
    next(error);
  }
};
