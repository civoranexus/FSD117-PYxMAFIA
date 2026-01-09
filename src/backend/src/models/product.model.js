import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true },

    batchId: { type: String, required: true},
    manufactureDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },

    vendorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    vendorName: { type: String, required: true },

    qrCode: { type: String, required: true, unique: true },   // secure token inside QR
    qrImageUrl: { type: String, required: true },

    qrStatus: { 
        type: String, 
        enum: ['generated', 'active', 'used', 'blocked'], 
        default: 'generated' 
    },

    verificationCount: { type: Number, default: 0 },
    lastVerifiedAt: { type: Date },

    isSuspicious: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

export default Product;