import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import roomRoutes from './routes/room.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 240,
    standardHeaders: true,
  });
  app.use('/api', limiter);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/seed', async (req, res) => {
  if (req.query.key !== 'bst-seed-2026-gizli') {
    return res.status(403).json({ error: 'Yetkisiz.' });
  }
  try {
    const bcrypt = (await import('bcryptjs')).default;
    const crypto = (await import('crypto')).default;
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Problem türleri
    const problems = [
      'Projeksiyon çalışmıyor',
      'Bilgisayar açılmıyor',
      'Bilgisayar dondu',
      'Kişisel bilgisayarımı projeksiyona bağlayamadım',
      'İnternet yok',
      'Ekran görüntüsü gelmiyor',
      'Klavye çalışmıyor',
      'Mouse çalışmıyor',
      'Ses sistemi çalışmıyor',
      'HDMI bağlantısı çalışmıyor',
      'Diğer',
    ];
    for (const name of problems) {
      await prisma.problemType.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    // Sınıflar
    const rooms = [
      { roomCode: '4C-12-13', floor: 4, corridor: 'C', roomNumber: '12-13' },
      { roomCode: '3B-05', floor: 3, corridor: 'B', roomNumber: '05' },
      { roomCode: '2A-01', floor: 2, corridor: 'A', roomNumber: '01' },
    ];
    for (const r of rooms) {
      await prisma.room.upsert({
        where: { roomCode: r.roomCode },
        update: {},
        create: { ...r, qrToken: crypto.randomBytes(16).toString('hex') },
      });
    }

    // Ana Admin - Murat Bey
    const passwordHash = await bcrypt.hash('murat123', 10);
    await prisma.user.upsert({
      where: { email: 'murat.bey@iku.edu.tr' },
      update: {},
      create: {
        name: 'Murat',
        surname: 'Bey',
        email: 'murat.bey@iku.edu.tr',
        passwordHash,
        role: 'superadmin',
      },
    });

    await prisma.$disconnect();
    res.json({ ok: true, message: 'Seed tamamlandı. Giriş: murat.bey@iku.edu.tr / murat123' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
  app.use('/api/auth', authRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}