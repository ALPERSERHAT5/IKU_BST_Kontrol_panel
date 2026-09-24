import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const PROBLEMS = [
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

const ROOMS = [
  { roomCode: '4C-12-13', floor: 4, corridor: 'C', roomNumber: '12-13' },
  { roomCode: '3B-05',    floor: 3, corridor: 'B', roomNumber: '05' },
  { roomCode: '2A-01',    floor: 2, corridor: 'A', roomNumber: '01' },
];

async function main() {
  // Ana Admin — Murat Bey
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

  for (const name of PROBLEMS) {
    await prisma.problemType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const r of ROOMS) {
    await prisma.room.upsert({
      where: { roomCode: r.roomCode },
      update: {},
      create: {
        ...r,
        qrToken: crypto.randomBytes(16).toString('hex'),
      },
    });
  }

  console.log('Seed tamamlandı.');
  console.log('Ana Admin: murat.bey@iku.edu.tr / murat123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });