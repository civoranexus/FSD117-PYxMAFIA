import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import AuditLog from "../models/auditLog.model.js";

const parseBoolean = (value) => {
    if (value === undefined || value === null) return undefined;
    const v = String(value).trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(v)) return true;
    if (["false", "0", "no", "n"].includes(v)) return false;
    return undefined;
};

const ALLOWED_QR_STATUS = new Set(["generated", "active", "used", "blocked"]);

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
            const vendors = await User.find({ role: 'vendor' }).select('-password');
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
};

export default adminController;
