import AuditLog from "../models/auditLog.model.js";
import Product from "../models/product.model.js";

async function getAllAuditLogs(req, res) {
    try{
        const auditLogs = await AuditLog.find().populate("productId", "productName").populate("vendorId", "name email").sort({ scannedAt: -1 });;
        res.status(200).json(auditLogs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getVendorAuditLogs(req, res) {
    try {
        const products = await Product.find({ vendorId: req.user.id });
        const productIds = products.map(product => product._id);
        const auditLogs = await AuditLog.find({ productId: { $in: productIds } }).populate("vendorId", "name email").sort({ scannedAt: -1 });
        res.status(200).json(auditLogs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProductAuditLogs(req, res) {
    const { productId } = req.params;
    try {
        const auditLogs = await AuditLog.find({ productId }).populate("vendorId", "name").sort({ scannedAt: -1 });
        if (!auditLogs || auditLogs.length === 0) {
            return res.status(404).json({ message: 'No audit logs found for this product' });
        }
        res.status(200).json(auditLogs);
    } catch (error) {
        console.error("Error fetching product audit logs:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Public: privacy-safe view of audit logs for a product (no auth)
// Returns only the minimum useful fields (no IP/user-agent).
async function getPublicProductAuditLogs(req, res) {
    const { productId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 8, 20);
    try {
        const auditLogs = await AuditLog.find({ productId })
            .select('scanResult location scannedAt')
            .sort({ scannedAt: -1 })
            .limit(limit);
        res.status(200).json(auditLogs);
    } catch (error) {
        console.error("Error fetching public product audit logs:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getAuditLogsByQR(req, res) {
    const { qrCode } = req.params;
    try {
        const auditLogs = await AuditLog.find({ qrCode }).
            populate("productId", "productName").
            populate("vendorId", "name email").
            sort({ scannedAt: -1 });
        if (!auditLogs || auditLogs.length === 0) {
            return res.status(404).json({ message: 'No audit logs found for this QR code' });
        }
        res.status(200).json(auditLogs);
    } catch (error) {
        console.error("Error fetching audit logs by QR code:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const auditController = {
    getAllAuditLogs,
    getVendorAuditLogs,
    getAuditLogsByQR,
    getProductAuditLogs,
    getPublicProductAuditLogs
};
export default auditController;
        