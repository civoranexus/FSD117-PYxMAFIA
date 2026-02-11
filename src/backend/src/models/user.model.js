import mongoose from "mongoose";

const userModel = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone_no: { type: String, required: true, unique: true },
    password: { type: String, required: true }, //not require to be require as in future google/facebook authentication can be added
    role: {
        type: String,
        enum: ["user", "vendor", "admin"],
        default: "user"
    },

    // Admin can block a user/vendor from using the system
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date },
    blockedReason: { type: String }
}, {
    timestamps: true
});

const User = mongoose.model("User", userModel);

export default User;