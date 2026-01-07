import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  qrCode: {
    type: String,
    required: true
  },

  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  scanResult: {
    type: String,
    enum: ["Valid", "Invalid", "AlreadyUsed", "Blocked"],
    required: true
  },

  ipAddress: String,
  location: String,
  userAgent: String,

  scannedAt: {
    type: Date,
    default: Date.now
  }
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;