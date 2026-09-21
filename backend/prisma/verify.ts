import prisma from '../src/config/prisma';

async function verifyDatabase() {
  console.log('Testing Prisma connection...');
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ Prisma connection successful. User count: ${userCount}`);

    const productCount = await prisma.product.count();
    console.log(`✅ Models are recognized. Product count: ${productCount}`);

    console.log('Database verification passed.');
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
