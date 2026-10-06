
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["student", "teacher"],
            required: true
        },

        emailVerified: {
            type: Boolean,
            default: false
        },

        phoneVerified: {
            type: Boolean,
            default: false
        },

        emailOTP: String,

        emailOTPExpires: Date
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);