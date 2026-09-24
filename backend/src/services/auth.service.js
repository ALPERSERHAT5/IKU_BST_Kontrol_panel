import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

const IKU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@iku\.edu\.tr$/;

export function validateIkuEmail(email) {
  return IKU_EMAIL_REGEX.test(email);
}

export async function registerUser({ name, surname, email, password }) {
  if (!validateIkuEmail(email)) {
    const err = new Error('Sadece @iku.edu.tr uzantılı e-posta adresleri kabul edilir.');
    err.status = 400;
    throw err;
  }
  if (!password || password.length < 6) {
    const err = new Error('Şifre en az 6 karakter olmalıdır.');
    err.status = 400;
    throw err;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Bu e-posta ile kayıtlı bir kullanıcı zaten var.');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, surname, email, passwordHash, role: 'user' },
  });
  return publicUser(user);
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('E-posta veya şifre hatalı.');
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error('E-posta veya şifre hatalı.');
    err.status = 401;
    throw err;
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
  return issueTokens(user);
}

export function issueTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );
  return { accessToken, refreshToken, user: publicUser(user) };
}

export async function refreshTokens(token) {
  try {
    const payload = jwt.verify(token, env.jwtRefreshSecret);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new Error('Kullanıcı bulunamadı.');
    return issueTokens(user);
  } catch {
    const err = new Error('Oturum yenilenemedi.');
    err.status = 401;
    throw err;
  }
}

export function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    surname: u.surname,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  };
}