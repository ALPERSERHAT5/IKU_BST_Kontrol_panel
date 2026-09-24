import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { buildRoomQrDataUrl, generateRoomQrPng } from '../services/qr.service.js';

const prisma = new PrismaClient();

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function list(req, res, next) {
  try {
    const rooms = await prisma.room.findMany({ orderBy: { roomCode: 'asc' } });
    res.json({ rooms });
  } catch (e) { next(e); }
}

export async function getByQrToken(req, res, next) {
  try {
    const room = await prisma.room.findUnique({ where: { qrToken: req.params.token } });
    if (!room) return res.status(404).json({ error: 'Sınıf bulunamadı.' });
    res.json({ room });
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const { roomCode, floor, corridor, roomNumber } = req.body;
    if (!roomCode || !floor || !corridor || !roomNumber) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }
    const room = await prisma.room.create({
      data: {
        roomCode: roomCode.trim(),
        floor: parseInt(floor, 10),
        corridor: corridor.trim().toUpperCase(),
        roomNumber: roomNumber.trim(),
        qrToken: crypto.randomBytes(16).toString('hex'),
      },
    });
    res.status(201).json({ room });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Bu sınıf kodu zaten kayıtlı.' });
    }
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    await prisma.room.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) { next(e); }
}

export async function qrDataUrl(req, res, next) {
  try {
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) return res.status(404).json({ error: 'Sınıf bulunamadı.' });
    const dataUrl = await buildRoomQrDataUrl(room, BASE_URL);
    res.json({ dataUrl, room });
  } catch (e) { next(e); }
}

export async function qrPng(req, res, next) {
  try {
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) return res.status(404).json({ error: 'Sınıf bulunamadı.' });
    const buffer = await generateRoomQrPng(room, BASE_URL);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="${room.roomCode}.png"`);
    res.send(buffer);
  } catch (e) { next(e); }
}

export async function problemTypes(req, res, next) {
  try {
    const list = await prisma.problemType.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ problemTypes: list });
  } catch (e) { next(e); }
}