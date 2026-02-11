import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

await mongoose.connect(process.env.MONGO_URI);

const admin = await User.create({
  name: "System Admin",
  email: "piyus.useless@gmail.com",
  password: await bcrypt.hash("Admin@123", 12),
  phone_no: "0000000000",
  role: "admin"
});

console.log("Admin created");
process.exit();
