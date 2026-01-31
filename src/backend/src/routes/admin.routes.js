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
router.get('/vendors/:id/summary', adminController.getVendorSummary);
router.patch('/vendors/:id/block', adminController.setVendorBlockedStatus);
router.patch('/vendors/:id/unblock', adminController.setVendorBlockedStatus);

// Product management (admin view)
router.get('/products', adminController.getAllProducts);
router.patch('/products/:id/review', adminController.reviewProduct);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Contact-us queries (admin)
router.get('/contact-messages', adminController.getContactMessages);
router.get('/contact-messages/:id', adminController.getContactMessageById);
router.patch('/contact-messages/:id/status', adminController.updateContactMessageStatus);

export default router;
