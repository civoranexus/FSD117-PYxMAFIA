import productModel from "../models/product.model.js";
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

const productController = {
    createProduct,
    getProducts
};
export default productController;