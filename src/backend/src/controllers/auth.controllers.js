import User from "../models/user.model";
import bcrypt from "bcryptjs";


async function registerUser(req, res) {
    const { name, email, phone_no, password } = req.body;

    try {
        // Check if user with the same email or phone number already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone number already exists, please login instead' });
        }

        // Create a new user

        //hash password before saving
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({ name, email, phone_no, password: hashedPassword });
        await newUser.save();
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
        res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export { registerUser, loginUser };