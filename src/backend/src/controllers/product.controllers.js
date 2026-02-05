import productModel from "../models/product.model.js";
import AuditLog from "../models/auditLog.model.js";
import crypto from 'crypto';
import { generateQR } from "../utils/generateQR.js";
import geoip from "geoip-lite";
import User from "../models/user.model.js";


async function createProduct(req, res) {
    try {
        const { productName, description, price, category, stock, batchId, manufactureDate, expiryDate } = req.body;

        const vendorId = req.user._id;
        const vendorName = req.user.name;

        const qrCode = crypto.randomBytes(32).toString("hex");
        const qrImageUrl = await generateQR(qrCode);

        const newProduct = new productModel({
            productName,
            description,
            price,
            category,
            stock,
            batchId,
            manufactureDate,
            expiryDate,
            vendorId,
            vendorName,
            // Make newly created products immediately scannable.
            qrStatus: "active",
            qrCode,
            qrImageUrl
        });
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', productId: newProduct._id });
    } catch (error) {
        console.error("Error creating product:", error);
        if (error?.name === 'ValidationError') {
            return res.status(400).json({
                message: error?.message || 'Product validation failed',
                errors: error?.errors ? Object.keys(error.errors) : undefined,
            });
        }
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Duplicate value error. Please retry.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProducts(req, res) {
    const vendorId = req.user._id;
    try {
        const products = await productModel.find({ vendorId }); // fetch products for the logged in vendor
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProductByQRCode(req, res) {
    const { id: qrCode } = req.params;

    try {
        const normalizedQr = typeof qrCode === 'string' ? qrCode.trim() : '';
        const product = await productModel.findOne({ qrCode: normalizedQr });

        // If the QR does not exist => Invalid
        if (!product) {
            return res.status(404).json({ status: "Invalid" });
        }

        // Current request context (needed for fraud checks)
        let ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress;

        if (ip === "::1" || ip === "127.0.0.1") ip = "8.8.8.8";

        const geo = geoip.lookup(ip);
        const location = geo
            ? `${geo.city || "Unknown"}, ${geo.country || "Unknown"}`
            : "Unknown";

        // Determine status
        let scanResult = "Invalid";
        let message = undefined;

        const now = new Date();
        const expiry = product?.expiryDate ? new Date(product.expiryDate) : null;
        const isExpired = expiry && !Number.isNaN(expiry.getTime()) && now.getTime() > expiry.getTime();

        if (product.qrStatus === "blocked") {
            scanResult = "Blocked";
            message = 'This product has been blocked.';
        } else if (isExpired) {
            scanResult = "Expired";
            message = `This product is expired. Expired on ${expiry.toDateString()}.`;
        } else if (product.qrStatus === "active") {
            scanResult = "Valid";
        } else if (product.qrStatus === "used") {
            scanResult = "AlreadyUsed";
        } else {
            // generated/printed/unknown => not yet activated
            scanResult = "Invalid";
            message = 'This product is not active yet. Please ask the vendor/admin to activate it.';
        }

        // Continuous monitoring:
        // if the QR is repeatedly scanned in short window or from different IP/locations,
        // or continues being scanned too much after already used, consider it compromised.
        const WINDOW_MS = 2 * 60 * 1000;
        const recentScans = await AuditLog.find({
            qrCode: normalizedQr,
            scannedAt: { $gte: new Date(Date.now() - WINDOW_MS) }
        }).select('ipAddress location scanResult scannedAt');

        const scanCountWithThis = recentScans.length + 1;
        const uniqueIPs = new Set(recentScans.map(log => log.ipAddress).filter(Boolean));
        uniqueIPs.add(ip);

        const uniqueLocations = new Set(recentScans.map(log => log.location).filter(Boolean));
        uniqueLocations.add(location);

        const MAX_SCANS_IN_WINDOW = 5;
        const MAX_SCANS_AFTER_USED = 3;
        const MULTI_IP_THRESHOLD = 2;
        const MULTI_LOCATION_THRESHOLD = 2;

        const isRapidRepeat = scanCountWithThis > MAX_SCANS_IN_WINDOW;
        const isMultiIp = uniqueIPs.size > MULTI_IP_THRESHOLD;
        const isMultiLocation = uniqueLocations.size > MULTI_LOCATION_THRESHOLD;
        const isRepeatedAfterUsed = product.qrStatus === "used" && scanCountWithThis > MAX_SCANS_AFTER_USED;

        const compromised = (scanResult !== "Blocked") && (isRapidRepeat || isMultiIp || isMultiLocation || isRepeatedAfterUsed);

        // IMPORTANT:
        // Do NOT call product.save() here.
        // Some older/partial product documents in the DB may fail full schema validation,
        // which would break QR verification with "Product validation failed".
        // Instead, persist only the fields we changed via updateOne (no full validation).

        const setUpdate = {};
        const incUpdate = {};

        if (compromised) {
            setUpdate.isSuspicious = true;
            setUpdate.qrStatus = 'blocked';
            scanResult = 'Blocked';
        } else {
            // If expired, do not transition active->used.
            if (!isExpired && product.qrStatus === 'active') {
                setUpdate.qrStatus = 'used';
            }

            if (scanResult === 'Valid' || scanResult === 'AlreadyUsed' || scanResult === 'Expired') {
                incUpdate.verificationCount = 1;
                setUpdate.lastVerifiedAt = now;
            }
        }

        if (Object.keys(setUpdate).length || Object.keys(incUpdate).length) {
            const updateDoc = {};
            if (Object.keys(setUpdate).length) updateDoc.$set = setUpdate;
            if (Object.keys(incUpdate).length) updateDoc.$inc = incUpdate;

            await productModel.updateOne(
                { _id: product._id },
                updateDoc,
                { runValidators: false }
            );
        }

        // Best-effort audit logging (should not break verification UI)
        if (product?._id && product?.vendorId) {
            try {
                await AuditLog.create({
                    productId: product._id,
                    qrCode: normalizedQr,
                    vendorId: product.vendorId,
                    scanResult,
                    ipAddress: ip,
                    location,
                    userAgent: req.headers["user-agent"]
                });
            } catch (auditErr) {
                console.warn('Audit log write failed:', auditErr?.message || auditErr);
            }
        } else {
            console.warn('Skipping audit log: missing productId/vendorId for qr', normalizedQr);
        }

        // Build response product using the in-memory product + our updates
        const productObj = typeof product?.toObject === 'function' ? product.toObject() : product;
        const responseProduct = {
            ...(productObj || {}),
            ...(Object.keys(setUpdate).length ? setUpdate : {}),
        };
        if (incUpdate.verificationCount) {
            const current = Number(responseProduct.verificationCount || 0);
            responseProduct.verificationCount = current + incUpdate.verificationCount;
        }

        return res.status(200).json({
            status: scanResult,
            message,
            expired: Boolean(isExpired),
            suspicious: Boolean(responseProduct.isSuspicious),
            product: responseProduct
        });

    } catch (error) {
        console.error("Error fetching product by QR code:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


async function deleteProduct(req, res) {
    const { id: productId } = req.params;
    const requesterId = req.user._id;
    try {
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const isOwner = product.vendorId.toString() === requesterId.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to delete this product' });
        }

        await productModel.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function activateProduct(req, res) {
    const { id } = req.params;
    const vendorId = req.user._id;
    try {
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.vendorId.toString() !== vendorId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to activate this product' });
        }

        // Avoid full-document validation issues on older/partial documents.
        await productModel.updateOne(
            { _id: product._id },
            { $set: { qrStatus: 'active' } },
            { runValidators: false }
        );

        const updated = await productModel.findById(product._id);
        res.status(200).json({ message: 'Product activated successfully', product: updated });
    } catch (error) {
        console.error("Error activating product:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function blockProduct(req, res) {
    const { id } = req.params;
    const vendorId = req.user._id;
    try {
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.vendorId.toString() !== vendorId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to block this product' });
        }

        await productModel.updateOne(
            { _id: product._id },
            { $set: { qrStatus: 'blocked' } },
            { runValidators: false }
        );

        const updated = await productModel.findById(product._id);
        res.status(200).json({ message: 'Product blocked successfully', product: updated });
    } catch (error) {
        console.error("Error blocking product:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function updateProduct(req, res) {
    const { id } = req.params;
    const vendorId = req.user._id;
    const {
        productName,
        description,
        price,
        category,
        stock,
        manufactureDate,
        expiryDate
    } = req.body;
    try {
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.vendorId.toString() !== vendorId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this product' });
        }

        // Expiry date is immutable after creation.
        // We reject any update attempt that includes expiryDate to guarantee immutability.
        if (expiryDate !== undefined) {
            return res.status(400).json({ message: 'Expiry date cannot be updated.' });
        }

        // Update allowed fields only
        product.productName = productName ?? product.productName;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.stock = stock ?? product.stock;
        product.manufactureDate = manufactureDate ?? product.manufactureDate;
        // product.expiryDate is intentionally not updatable.

        await product.save();
        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function vendorName(req, res) {
    const vendorId = req.user._id;
    try {
        const user = await User.findById(vendorId).select('name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ vendorName: user.name });
    } catch (error) {
        console.error("Error fetching vendor name:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Vendor/Admin: product details by productId + full audit logs.
// - Vendor can only access their own products.
// - Admin can access any product.
async function getVendorProductDetails(req, res) {
    const { id: productId } = req.params;
    const requester = req.user;

    try {
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const isAdmin = requester?.role === 'admin';
        const isVendor = requester?.role === 'vendor';

        if (!isAdmin && !isVendor) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (isVendor && product.vendorId.toString() !== requester._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to view this product' });
        }

        const auditLogs = await AuditLog.find({ productId })
            .populate('vendorId', 'name email role')
            .sort({ scannedAt: -1 });

        return res.status(200).json({
            success: true,
            product,
            auditCount: auditLogs.length,
            auditLogs
        });
    } catch (error) {
        console.error('Error fetching vendor product details:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function regenerateProductQr(req, res) {
    const { id: productId } = req.params;
    const requester = req.user;

    try {
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const isAdmin = requester?.role === 'admin';
        const isVendor = requester?.role === 'vendor';

        if (!isAdmin && !isVendor) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (isVendor && product.vendorId.toString() !== requester._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to regenerate QR for this product' });
        }

        // Generate a fresh QR token; old printed/scanned tokens become invalid.
        // Retry a few times in the extremely unlikely case of a unique collision.
        let newQrCode = '';
        let newQrImageUrl = '';
        const MAX_ATTEMPTS = 3;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
            newQrCode = crypto.randomBytes(32).toString('hex');
            newQrImageUrl = await generateQR(newQrCode);

            product.qrCode = newQrCode;
            product.qrImageUrl = newQrImageUrl;
            // After regenerating, keep the product scannable immediately.
            product.qrStatus = 'active';
            product.isSuspicious = false;
            product.verificationCount = 0;
            product.lastVerifiedAt = undefined;

            try {
                await product.save();
                break;
            } catch (err) {
                // Duplicate key on qrCode unique index
                if (err?.code === 11000 && attempt < MAX_ATTEMPTS) continue;
                throw err;
            }
        }

        return res.status(200).json({
            success: true,
            message: 'QR code regenerated successfully. Previous QR codes are now invalid.',
            product
        });
    } catch (error) {
        console.error('Error regenerating QR code:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const productController = {
    createProduct,
    getProducts,
    getProductByQRCode,
    blockProduct,
    activateProduct,
    deleteProduct,
    updateProduct,
    vendorName,
    getVendorProductDetails,
    regenerateProductQr
};
export default productController;