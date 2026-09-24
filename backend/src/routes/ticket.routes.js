import { Router } from 'express';
import * as c from '../controllers/ticket.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Kullanıcı
router.post('/', c.create);
router.get('/my', c.myTickets);

// Admin
router.get('/', requireRole('admin', 'superadmin'), c.listAll);
router.get('/stats', requireRole('admin', 'superadmin'), c.stats);
router.get('/assigned-to-me', requireRole('admin', 'superadmin'), c.myAssigned);
router.get('/archived', requireRole('admin', 'superadmin'), c.archived);
router.post('/:id/assign', requireRole('admin', 'superadmin'), c.assign);
router.post('/:id/complete', requireRole('admin', 'superadmin'), c.complete);
router.post('/:id/cancel', requireRole('admin', 'superadmin'), c.cancel);

export default router;