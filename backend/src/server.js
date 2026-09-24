import { createApp } from './app.js';
import { env } from './config/env.js';
import { startArchiveCleanupJob } from './jobs/archiveCleanup.js';

const app = createApp();

app.listen(env.port, '0.0.0.0', () => {
  console.log(`BST Kontrol Paneli API çalışıyor: ${env.port}`);
  startArchiveCleanupJob();
});