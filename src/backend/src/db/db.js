import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        }catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }finally {
        console.log("MongoDB connection successful");
    }
};

export default connectDB;