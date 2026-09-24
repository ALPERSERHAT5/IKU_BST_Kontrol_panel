import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  adminInviteCode: process.env.ADMIN_INVITE_CODE || 'BST-2026-ADMIN',
};

if (!env.jwtSecret || !env.jwtRefreshSecret) {
  throw new Error('JWT_SECRET ve JWT_REFRESH_SECRET .env dosyasında tanımlanmalıdır.');
}