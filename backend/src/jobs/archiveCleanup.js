import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function startArchiveCleanupJob() {
  // Her gün saat 03:00'te çalış
  cron.schedule('0 3 * * *', async () => {
    try {
      const result = await prisma.ticket.deleteMany({
        where: {
          status: 'completed',
          archiveDeleteAt: { lt: new Date() },
        },
      });
      console.log(`[Arşiv temizliği] ${result.count} kayıt silindi.`);
    } catch (err) {
      console.error('[Arşiv temizliği hatası]', err);
    }
  });
  console.log('Arşiv temizleme görevi aktif (her gün 03:00).');
}