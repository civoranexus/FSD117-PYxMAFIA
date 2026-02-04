import FakeReport from '../models/fakeReport.model.js';
import Product from '../models/product.model.js';

const parsePositiveInt = (value, fallback) => {
  const n = Number.parseInt(String(value), 10);
  if (Number.isFinite(n) && n > 0) return n;
  return fallback;
};

const ALLOWED_STATUS = new Set(['new', 'reviewed', 'dismissed', 'actioned']);

const clampString = (value, maxLen) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
};

const getIp = (req) => {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim().slice(0, 80);
  if (Array.isArray(xf) && xf.length) return String(xf[0]).trim().slice(0, 80);
  return String(req.ip || '').trim().slice(0, 80);
};

// Public: allow an end-user to report a product as fake/suspicious.
// POST /api/audit/public/product/:productId/report-fake
async function createPublicFakeReport(req, res) {
  try {
    const { productId } = req.params;
    const reason = clampString(req.body?.reason, 200);
    const details = clampString(req.body?.details, 1200);
    const reporterName = clampString(req.body?.reporterName, 80);
    const reporterEmail = clampString(req.body?.reporterEmail, 120);

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required.' });
    }

    const product = await Product.findById(productId).select('_id vendorId qrCode isSuspicious');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const reporterIp = getIp(req);
    const reporterUserAgent = clampString(req.get('user-agent') || '', 300);

    // Best-effort dedupe: same IP + product within last hour.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existing = await FakeReport.findOne({
      productId: product._id,
      reporterIp,
      createdAt: { $gte: oneHourAgo },
    }).select('_id createdAt');

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Report already received. Thank you.',
        reportId: existing._id,
        deduped: true,
      });
    }

    const report = await FakeReport.create({
      productId: product._id,
      vendorId: product.vendorId,
      qrCode: product.qrCode,
      reason,
      details,
      reporterName,
      reporterEmail,
      reporterIp,
      reporterUserAgent,
    });

    // Mark product suspicious so it shows up in admin view.
    if (!product.isSuspicious) {
      await Product.updateOne({ _id: product._id }, { $set: { isSuspicious: true } });
    }

    return res.status(201).json({
      success: true,
      message: 'Report submitted. Admin will review it.',
      reportId: report._id,
    });
  } catch (error) {
    console.error('Error creating fake report:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Admin: list reports
// GET /api/admin/fake-reports?status=new|reviewed|dismissed|actioned|all&page=1&limit=50
async function listFakeReports(req, res) {
  try {
    const status = clampString(req.query?.status, 20) || 'all';
    const page = parsePositiveInt(req.query?.page, 1);
    const limit = Math.min(parsePositiveInt(req.query?.limit, 50), 200);

    const filter = {};
    if (status && status !== 'all') {
      if (!ALLOWED_STATUS.has(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter.' });
      }
      filter.status = status;
    }

    const [total, reports] = await Promise.all([
      FakeReport.countDocuments(filter),
      FakeReport.find(filter)
        .populate('productId', 'productName vendorName qrStatus isSuspicious createdAt')
        .populate('vendorId', 'name email isBlocked createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      reports,
    });
  } catch (error) {
    console.error('Error listing fake reports:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// Admin: update report status/notes
// PATCH /api/admin/fake-reports/:id
async function updateFakeReport(req, res) {
  try {
    const { id } = req.params;
    const nextStatus = clampString(req.body?.status, 20);
    const adminNotes = clampString(req.body?.adminNotes, 1200);

    const update = {};
    if (nextStatus) {
      if (!ALLOWED_STATUS.has(nextStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
      }
      update.status = nextStatus;
    }
    if (typeof req.body?.adminNotes === 'string') {
      update.adminNotes = adminNotes;
    }

    const report = await FakeReport.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('productId', 'productName vendorName qrStatus isSuspicious createdAt')
      .populate('vendorId', 'name email isBlocked createdAt');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error('Error updating fake report:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const fakeReportController = {
  createPublicFakeReport,
  listFakeReports,
  updateFakeReport,
};

export default fakeReportController;
