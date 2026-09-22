import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/validate', async (req, res, next) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ status: 'error', message: 'Coupon code is required' });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon || !coupon.is_active) {
      return res.status(404).json({ status: 'error', message: 'Invalid coupon code' });
    }

    res.status(200).json({ status: 'success', data: coupon });
  } catch (error) {
    next(error);
  }
});

export default router;
