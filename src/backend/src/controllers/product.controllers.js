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
            qrStatus: "generated",
            qrCode,
            qrImageUrl
        });
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', productId: newProduct._id });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProducts(req, res) {
    const vendorId = req.user._id;
    try {
        const products = await productModel.find({ vendorId }); //fetch products for the logged in vendor
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProductByQRCode(req, res) {
    const { id: qrCode } = req.params;

    try {
        let scanResult = "Invalid";

        const product = await productModel.findOne({ qrCode });

        if (!product) {
            await AuditLog.create({ qrCode, scanResult });
            return res.status(404).json({ status: scanResult });
        }

        if (product.qrStatus === "blocked") {
            scanResult = "Blocked";
        }
        else if (product.qrStatus === "used") {
            scanResult = "AlreadyUsed";
        }
        else {
            scanResult = "Valid";
            product.qrStatus = "used";
            product.verificationCount += 1;
            product.lastVerifiedAt = new Date();
        }

        // 🚨 FRAUD DETECTION — MUST be before save
        const recentScans = await AuditLog.find({
            qrCode,
            scannedAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) }
        });

        const uniqueIPs = new Set(recentScans.map(log => log.ipAddress));

        if (recentScans.length >= 3 || uniqueIPs.size >= 2) {
            product.isSuspicious = true;
            product.qrStatus = "blocked";
            scanResult = "Blocked";
        }

        await product.save();

        // 🌍 Location tracking
        let ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress;

        if (ip === "::1" || ip === "127.0.0.1") ip = "8.8.8.8";

        const geo = geoip.lookup(ip);

        const location = geo
            ? `${geo.city || "Unknown"}, ${geo.country || "Unknown"}`
            : "Unknown";

        // 🧾 Audit log
        await AuditLog.create({
            productId: product._id,
            qrCode,
            vendorId: product.vendorId,
            scanResult,
            ipAddress: ip,
            location,
            userAgent: req.headers["user-agent"]
        });

        return res.status(200).json({
            status: scanResult,
            suspicious: product.isSuspicious,
            product
        });

    } catch (error) {
        console.error("Error fetching product by QR code:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


async function deleteProduct(req, res) {
    const { productId } = req.params;
    const vendorId = req.user._id;
    try {
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (product.vendorId.toString() !== vendorId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this product' });
        }
        if (vendorId.role.toString() == 'vendor') {
            return res.status(403).json({ message: "Unauthorized" });
        }
        await productModel.findByIdAndDelete(id);
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

        product.qrStatus = "active";
        await product.save();
        res.status(200).json({ message: 'Product activated successfully', product });
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
        product.qrStatus = "blocked";
        await product.save();
        res.status(200).json({ message: 'Product blocked successfully', product });
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

        // Update allowed fields only
        product.productName = productName ?? product.productName;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.stock = stock ?? product.stock;
        product.manufactureDate = manufactureDate ?? product.manufactureDate;
        product.expiryDate = expiryDate ?? product.expiryDate;

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
        const name = await User.find({ _id: vendorId }).select('name').limit(1);
        if (name.length === 0) {
            return res.status(404).json({ message: 'No products found for this vendor' });
        }
        const vendorName = name[0].name;
        res.status(200).json({ vendorName });
    } catch (error) {
        console.error("Error fetching vendor name:", error);
        res.status(500).json({ message: 'Internal server error' });
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
    vendorName
};
export default productController;