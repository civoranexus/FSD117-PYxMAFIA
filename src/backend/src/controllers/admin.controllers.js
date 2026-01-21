import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import AuditLog from "../models/auditLog.model.js";

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
            const activeProducts = await Product.countDocuments({ status: 'active' });
            const blockedProducts = await Product.countDocuments({ status: 'blocked' });

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
                        blocked: blockedProducts
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
            const products = await Product.find().populate('vendor', 'name email');
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

    // Get audit logs
    getAuditLogs: async (req, res) => {
        try {
            const { limit = 50 } = req.query;
            const logs = await AuditLog.find()
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
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
