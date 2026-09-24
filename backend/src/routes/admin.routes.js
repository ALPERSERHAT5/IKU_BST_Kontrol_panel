import { Router } from 'express';
import * as c from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('superadmin'));

router.get('/admins', c.listAdmins);
router.post('/admins', c.createAdmin);
router.delete('/admins/:id', c.removeAdmin);

router.get('/users', c.listUsers);
router.post('/users/:id/reset-password', c.resetPassword);

export default router;