import { Router } from 'express';
import * as c from '../controllers/room.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/problems', c.problemTypes);
router.get('/qr-token/:token', c.getByQrToken);

router.use(authenticate);

router.get('/', c.list);
router.post('/', requireRole('superadmin'), c.create);
router.delete('/:id', requireRole('superadmin'), c.remove);
router.get('/:id/qr', requireRole('admin', 'superadmin'), c.qrDataUrl);
router.get('/:id/qr.png', requireRole('admin', 'superadmin'), c.qrPng);

export default router;