import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import AuditLog from "../models/auditLog.model.js";
import ContactMessage from "../models/contactMessage.model.js";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseBoolean = (value) => {
    if (value === undefined || value === null) return undefined;
    const v = String(value).trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(v)) return true;
    if (["false", "0", "no", "n"].includes(v)) return false;
    return undefined;
};

const ALLOWED_QR_STATUS = new Set(["generated", "printed", "active", "used", "blocked"]);

const ALLOWED_CONTACT_STATUS = new Set(["new", "read", "replied"]);

const parsePositiveInt = (value, fallback) => {
    const n = Number.parseInt(String(value), 10);
    if (Number.isFinite(n) && n > 0) return n;
    return fallback;
};

const adminController = {
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.status(200).json({ 
                success: true, 
                count: users.length,
                users 
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error fetching users", 
                error: error.message 
            });
        }
    },

    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id).select('-password');
            
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }

            res.status(200).json({ 
                success: true, 
                user 
            });
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error fetching user", 
                error: error.message 
            });
        }
    },

    // Update user role
    updateUserRole: async (req, res) => {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!['user', 'vendor', 'admin'].includes(role)) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid role. Must be 'user', 'vendor', or 'admin'" 
                });
            }

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }

            user.role = role;
            await user.save();

            res.status(200).json({ 
                success: true, 
                message: "User role updated successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error("Error updating user role:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error updating user role", 
                error: error.message 
            });
        }
    },

    // Delete user
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Prevent admin from deleting themselves
            if (id === req.user._id.toString()) {
                return res.status(400).json({ 
                    success: false, 
                    message: "You cannot delete your own account" 
                });
            }

            const user = await User.findByIdAndDelete(id);
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "User not found" 
                });
            }

            res.status(200).json({ 
                success: true, 
                message: "User deleted successfully" 
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error deleting user", 
                error: error.message 
            });
        }
    },

    // Get all vendors
    getAllVendors: async (req, res) => {
        try {
            const { search } = req.query;

            const filter = { role: 'vendor' };
            if (typeof search === 'string' && search.trim()) {
                filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
            }

            const vendors = await User.find(filter).select('-password');
            res.status(200).json({ 
                success: true, 
                count: vendors.length,
                vendors 
            });
        } catch (error) {
            console.error("Error fetching vendors:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error fetching vendors", 
                error: error.message 
            });
        }
    },

    // Vendor summary (admin-only): counts to help decide if vendor is creating too many fake/suspicious products
    getVendorSummary: async (req, res) => {
        try {
            const { id } = req.params;

            const vendor = await User.findById(id).select('-password');
            if (!vendor) {
                return res.status(404).json({ success: false, message: 'Vendor not found' });
            }
            if (vendor.role !== 'vendor') {
                return res.status(400).json({ success: false, message: 'User is not a vendor' });
            }

            const [totalProducts, suspiciousProducts, blockedProducts, activeProducts] = await Promise.all([
                Product.countDocuments({ vendorId: id }),
                Product.countDocuments({ vendorId: id, isSuspicious: true }),
                Product.countDocuments({ vendorId: id, qrStatus: 'blocked' }),
                Product.countDocuments({ vendorId: id, qrStatus: 'active' })
            ]);

            return res.status(200).json({
                success: true,
                vendor,
                products: {
                    total: totalProducts,
                    suspicious: suspiciousProducts,
                    blocked: blockedProducts,
                    active: activeProducts
                }
            });
        } catch (error) {
            console.error('Error fetching vendor summary:', error);
            return res.status(500).json({ success: false, message: 'Error fetching vendor summary', error: error.message });
        }
    },

    // Block/unblock vendor. Optionally block all their products to invalidate them.
    setVendorBlockedStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { isBlocked, reason, blockProducts } = req.body || {};

            const nextBlocked = parseBoolean(isBlocked);
            if (nextBlocked === undefined) {
                return res.status(400).json({ success: false, message: 'isBlocked must be a boolean' });
            }

            const vendor = await User.findById(id);
            if (!vendor) {
                return res.status(404).json({ success: false, message: 'Vendor not found' });
            }
            if (vendor.role !== 'vendor') {
                return res.status(400).json({ success: false, message: 'User is not a vendor' });
            }

            vendor.isBlocked = nextBlocked;
            vendor.blockedAt = nextBlocked ? new Date() : undefined;
            vendor.blockedReason = nextBlocked ? (typeof reason === 'string' ? reason.trim().slice(0, 200) : '') : undefined;
            await vendor.save();

            const shouldBlockProducts = nextBlocked && (parseBoolean(blockProducts) ?? true);
            let productsUpdated = 0;
            if (shouldBlockProducts) {
                const result = await Product.updateMany(
                    { vendorId: id },
                    { $set: { qrStatus: 'blocked', isSuspicious: true } }
                );
                productsUpdated = result?.modifiedCount ?? result?.nModified ?? 0;
            }

            const safeVendor = await User.findById(id).select('-password');
            return res.status(200).json({
                success: true,
                message: nextBlocked ? 'Vendor blocked successfully' : 'Vendor unblocked successfully',
                vendor: safeVendor,
                productsUpdated
            });
        } catch (error) {
            console.error('Error updating vendor block status:', error);
            return res.status(500).json({ success: false, message: 'Error updating vendor block status', error: error.message });
        }
    },

    // Get dashboard statistics
    getDashboardStats: async (req, res) => {
        try {
            const totalUsers = await User.countDocuments();
            const totalVendors = await User.countDocuments({ role: 'vendor' });
            const totalAdmins = await User.countDocuments({ role: 'admin' });
            const totalProducts = await Product.countDocuments();
            const activeProducts = await Product.countDocuments({ qrStatus: 'active' });
            const blockedProducts = await Product.countDocuments({ qrStatus: 'blocked' });
            const suspiciousProducts = await Product.countDocuments({ isSuspicious: true });

            res.status(200).json({ 
                success: true, 
                stats: {
                    users: {
                        total: totalUsers,
                        vendors: totalVendors,
                        admins: totalAdmins,
                        regular: totalUsers - totalVendors - totalAdmins
                    },
                    products: {
                        total: totalProducts,
                        active: activeProducts,
                        blocked: blockedProducts,
                        suspicious: suspiciousProducts
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error fetching dashboard statistics", 
                error: error.message 
            });
        }
    },

    // Get all products (admin view)
    getAllProducts: async (req, res) => {
        try {
            const { qrStatus, vendorId } = req.query;
            const suspicious = parseBoolean(req.query.suspicious);

            const filter = {};
            if (suspicious !== undefined) filter.isSuspicious = suspicious;
            if (qrStatus && ALLOWED_QR_STATUS.has(String(qrStatus))) filter.qrStatus = String(qrStatus);
            if (vendorId) filter.vendorId = vendorId;

            const products = await Product.find(filter)
                .populate('vendorId', 'name email role')
                .sort({ createdAt: -1 });

            res.status(200).json({ 
                success: true, 
                count: products.length,
                products 
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error fetching products", 
                error: error.message 
            });
        }
    },

    // Admin review/update product flags
    reviewProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const { isSuspicious, qrStatus } = req.body || {};

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            const suspiciousParsed = parseBoolean(isSuspicious);
            if (suspiciousParsed !== undefined) product.isSuspicious = suspiciousParsed;

            if (qrStatus !== undefined) {
                const nextStatus = String(qrStatus);
                if (!ALLOWED_QR_STATUS.has(nextStatus)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid qrStatus. Must be one of: generated, active, used, blocked"
                    });
                }
                product.qrStatus = nextStatus;
            }

            await product.save();

            const updated = await Product.findById(product._id).populate('vendorId', 'name email role');
            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                product: updated
            });
        } catch (error) {
            console.error('Error reviewing product:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating product',
                error: error.message
            });
        }
    },

    // Get audit logs
    getAuditLogs: async (req, res) => {
        try {
            const { limit = 50 } = req.query;
            const logs = await AuditLog.find()
                .populate('productId', 'productName qrStatus isSuspicious')
                .populate('vendorId', 'name email')
                .sort({ scannedAt: -1 })
                .limit(parseInt(limit));
            
            res.status(200).json({ 
                success: true, 
                count: logs.length,
                logs 
            });
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            res.status(500).json({ 
                success: false, 
                message: "Error fetching audit logs", 
                error: error.message 
            });
        }
    }

    ,

    // Contact-us: list all messages (admin)
    getContactMessages: async (req, res) => {
        try {
            const { status, search } = req.query;
            const limit = parsePositiveInt(req.query.limit, 50);
            const page = parsePositiveInt(req.query.page, 1);

            const filter = {};
            if (status && ALLOWED_CONTACT_STATUS.has(String(status))) {
                filter.status = String(status);
            }

            if (typeof search === 'string' && search.trim()) {
                const s = search.trim();
                const rx = new RegExp(escapeRegex(s), 'i');
                filter.$or = [{ name: rx }, { email: rx }, { subject: rx }, { message: rx }];
            }

            const skip = (page - 1) * limit;
            const [total, messages] = await Promise.all([
                ContactMessage.countDocuments(filter),
                ContactMessage.find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('name email subject status createdAt updatedAt')
            ]);

            res.status(200).json({
                success: true,
                total,
                page,
                limit,
                count: messages.length,
                messages,
            });
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching contact messages',
                error: error.message,
            });
        }
    },

    // Contact-us: get one message in detail (admin)
    getContactMessageById: async (req, res) => {
        try {
            const { id } = req.params;
            const message = await ContactMessage.findById(id);

            if (!message) {
                return res.status(404).json({ success: false, message: 'Contact message not found' });
            }

            res.status(200).json({ success: true, message });
        } catch (error) {
            console.error('Error fetching contact message:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching contact message',
                error: error.message,
            });
        }
    },

    // Contact-us: update message status (admin)
    updateContactMessageStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body || {};
            const nextStatus = String(status || '').trim();

            if (!ALLOWED_CONTACT_STATUS.has(nextStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be one of: new, read, replied",
                });
            }

            const message = await ContactMessage.findById(id);
            if (!message) {
                return res.status(404).json({ success: false, message: 'Contact message not found' });
            }

            message.status = nextStatus;
            await message.save();

            res.status(200).json({
                success: true,
                message: 'Contact message status updated',
                contactMessage: message,
            });
        } catch (error) {
            console.error('Error updating contact message status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating contact message status',
                error: error.message,
            });
        }
    }
};

export default adminController;
