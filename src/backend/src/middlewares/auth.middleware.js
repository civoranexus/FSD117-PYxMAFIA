import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

async function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.jwt_secret);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ message: 'Invalid or expired authentication token' });
    }
}

async function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
}

async function isVendor(req, res, next) {
    if (req.user.role !== 'vendor') {
        return res.status(403).json({ message: 'Access denied: Vendors only' });
    }
    next();
}

export { authMiddleware, isAdmin, isVendor };