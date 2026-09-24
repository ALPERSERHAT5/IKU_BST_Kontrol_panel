import { createApp } from './app.js';
import { env } from './config/env.js';
import { startArchiveCleanupJob } from './jobs/archiveCleanup.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`BST Kontrol Paneli API çalışıyor: http://localhost:${env.port}`);
  startArchiveCleanupJob();
});