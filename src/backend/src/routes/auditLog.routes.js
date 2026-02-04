import {Router} from "express";
import auditController from "../controllers/auditLog.controllers.js";
import fakeReportController from "../controllers/fakeReport.controllers.js";
import {authMiddleware,isVendor,isAdmin} from "../middlewares/auth.middleware.js";

const router = Router();

// Admin: see everything
router.get("/all", authMiddleware, isAdmin, auditController.getAllAuditLogs);
router.get("/qr/:qrCode", authMiddleware, isAdmin, auditController.getAuditLogsByQR); // check audit logs by QR code


// Vendor: see only their own products' logs
router.get("/vendor", authMiddleware, isVendor, auditController.getVendorAuditLogs);

// Admin & Vendor: logs of a specific product
router.get("/product/:productId", authMiddleware, auditController.getProductAuditLogs);

// Public: limited audit logs for product details page
router.get("/public/product/:productId", auditController.getPublicProductAuditLogs);

// Public: report a product as fake/suspicious (no auth)
router.post("/public/product/:productId/report-fake", fakeReportController.createPublicFakeReport);

export default router;
