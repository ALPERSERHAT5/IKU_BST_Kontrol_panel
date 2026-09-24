import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function listAdmins(req, res, next) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['admin', 'superadmin'] } },
      select: { id: true, name: true, surname: true, email: true, role: true, createdAt: true, lastLogin: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ admins });
  } catch (e) { next(e); }
}

export async function createAdmin(req, res, next) {
  try {
    const { name, surname, email, password, role } = req.body;
    if (!email || !email.endsWith('@iku.edu.tr')) {
      return res.status(400).json({ error: 'Kurumsal e-posta zorunludur.' });
    }
    if (!['admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Geçersiz rol.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, surname, email, passwordHash, role },
      select: { id: true, name: true, surname: true, email: true, role: true, createdAt: true },
    });
    res.status(201).json({ admin: user });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı.' });
    }
    next(e);
  }
}

export async function removeAdmin(req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Kendinizi silemezsiniz.' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'user' },
      select: { id: true, name: true, surname: true, email: true, createdAt: true, lastLogin: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (e) { next(e); }
}

export async function resetPassword(req, res, next) {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash },
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
}