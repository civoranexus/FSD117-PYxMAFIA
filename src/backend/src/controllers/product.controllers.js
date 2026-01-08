import productModel from "../models/product.model.js";
import AuditLog from "../models/auditLog.model.js";
import crypto from 'crypto';
import { generateQR } from "../utils/generateQR.js";

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
    const { id } = req.params; // QR code from the URL
    try {
        let scanResult = "Invalid"; //enum: ['generated', 'printed', 'active', 'used', 'blocked']
        const product = await productModel.findOne({ qrCode: id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found', scanResult });// Always return scanResult even if product not found
        }
        if (product) {
            if (product.qrStatus === "used") {
                scanResult = "AlreadyUsed";
            } else if (product.qrStatus === "blocked") {
                scanResult = "Blocked";
            } else {
                scanResult = "Valid";
                product.qrStatus = "used";
                product.verificationCount += 1;
                product.lastVerifiedAt = new Date();
                await product.save();
            }
        }
        // 🚨 FRAUD DETECTION
        const recentScans = await AuditLog.find({ qrCode })
            .sort({ scannedAt: -1 })
            .limit(5);

        const ipSet = new Set(recentScans.map(log => log.ipAddress));

        if (product.verificationCount > 1 || ipSet.size > 1) {
            product.isSuspicious = true;
            product.qrStatus = "blocked";
            scanResult = "Blocked";
        }

        await product.save();


        // 🔐 Always create audit log
        await AuditLog.create({
            productId: product?._id,
            qrCode: id,
            vendorId: product?.vendorId,
            scanResult,
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"]
        });

        res.status(200).json({ status: scanResult,suspicious: product.isSuspicious, product });
    } catch (error) {
        console.error("Error fetching product by QR code:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const productController = {
    createProduct,
    getProducts,
    getProductByQRCode
};
export default productController;