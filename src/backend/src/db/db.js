import mongoose from "mongoose";

const db_password = process.env.db_password;

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://piyuscollege_db_user:${db_password}@cluster0.lksc954.mongodb.net/?appName=Cluster0`)
        }catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }finally {
        console.log("MongoDB connection successful");
    }
};

export default connectDB;