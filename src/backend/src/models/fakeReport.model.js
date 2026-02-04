import mongoose from 'mongoose';

const fakeReportSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    qrCode: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 1200,
    },
    reporterName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    reporterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },

    status: {
      type: String,
      enum: ['new', 'reviewed', 'dismissed', 'actioned'],
      default: 'new',
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1200,
    },

    reporterIp: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    reporterUserAgent: {
      type: String,
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

fakeReportSchema.index({ productId: 1, createdAt: -1 });
fakeReportSchema.index({ status: 1, createdAt: -1 });

const FakeReport = mongoose.model('FakeReport', fakeReportSchema);

export default FakeReport;
