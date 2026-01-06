import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


async function registerUser(req, res) {
    const { name, email, phone_no, password } = req.body;

    try {
        // Check if user with the same email or phone number already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone number already exists, please login instead' });
        }
        if(phone_no.length == 10){
            return res.status(400).json({ message: 'Phone number is not valid' });
        }
        if(password.length < 6){
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        //hash password before saving
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        // Create a new user
        const newUser = new User({ name, email, phone_no, password: hashedPassword });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.jwt_secret, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        //compare password
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function logoutUser(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}

const authController = { registerUser, loginUser, logoutUser };
export default authController;