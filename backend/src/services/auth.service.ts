import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../utils/AppError';
import { SignupInput, SigninInput } from '../validators/auth.validator';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

export const signup = async (data: SignupInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('Email is already registered', 400, 'BAD_REQUEST');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password_hash: passwordHash,
      full_name: data.name,
      role: 'CUSTOMER',
    },
  });

  const payload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user, accessToken, refreshToken };
};

export const signin = async (data: SigninInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !user.password_hash) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user, accessToken, refreshToken };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      created_at: true,
      updated_at: true,
    }
  });

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  return user;
};
