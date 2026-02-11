import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


async function registerUser(req, res) {
    const { name, email, phone_no, password } = req.body;
    const safeRole = "vendor"; // Assign a default role to new users


    try {
        if (!name || !email || !phone_no || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if user with the same email or phone number already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone number already exists, please login instead' });
        }
        
        // Validate phone number length
        if (phone_no.length !== 10) {
            return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
        }
        
        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        //hash password before saving
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        // Create a new user
        const newUser = new User({ name, email, phone_no, role: safeRole, password: hashedPassword });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.jwt_secret, { expiresIn: '1h' });
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        //compare password
        const isPasswordValid = bcrypt.compareSync(String(password), user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, { expiresIn: '1h' });
        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            path: '/',
        });

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function logoutUser(req, res) {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        path: '/',
    });
    res.status(200).json({ message: 'Logout successful' });
}

const authController = { registerUser, loginUser, logoutUser };
export default authController;