import { Router } from 'express';
import adminController from '../controllers/admin.controllers.js';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, isAdmin);

// Dashboard statistics
router.get('/dashboard/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Vendor management
router.get('/vendors', adminController.getAllVendors);

// Product management (admin view)
router.get('/products', adminController.getAllProducts);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
