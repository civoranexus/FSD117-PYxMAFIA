import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected successfully");
        }catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

export default connectDB;