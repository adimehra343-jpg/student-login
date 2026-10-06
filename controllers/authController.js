const User = require("../models/User");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const { parsePhoneNumberFromString } = require("libphonenumber-js");
const jwt = require("jsonwebtoken");

// ================= GENERATE OTP =================

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


// ================= SIGNUP =================

const signup = async (req, res) => {
    try {

        const {
            name,
            email,
            phone,
            password,
            role
        } = req.body;


        // Check required fields
        if (!name || !email || !phone || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }


        // Validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }


        // Validate role
        if (!["student", "teacher"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }


        // Validate phone
        const phoneNumber = parsePhoneNumberFromString(
            phone,
            "IN"
        );


        if (!phoneNumber || !phoneNumber.isValid()) {
            return res.status(400).json({
                message: "Invalid mobile number"
            });
        }


        const formattedPhone = phoneNumber.number;


        // Check duplicate email/phone
        const existingUser = await User.findOne({
            $or: [
                {
                    email: email.toLowerCase()
                },
                {
                    phone: formattedPhone
                }
            ]
        });


        if (existingUser) {
            return res.status(400).json({
                message: "Email or mobile number already registered"
            });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        // Generate OTP
        const emailOTP = generateOTP();


        const emailOTPExpires = new Date(
            Date.now() + 10 * 60 * 1000
        );


        // Show OTP in terminal for testing
        console.log("EMAIL OTP:", emailOTP);


        // Create user
        const user = await User.create({

            name,

            email: email.toLowerCase(),

            phone: formattedPhone,

            password: hashedPassword,

            role,

            emailOTP,

            emailOTPExpires

        });


        // Response
        res.status(201).json({

            message: "Account created successfully",

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Server error",

            error: error.message

        });

    }
};


// ================= VERIFY EMAIL =================

const verifyEmail = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        // Check fields
        if (!email || !otp) {

            return res.status(400).json({

                message: "Email and OTP are required"

            });

        }


        // Find user
        const user = await User.findOne({

            email: email.toLowerCase()

        });


        if (!user) {

            return res.status(404).json({

                message: "User not found"

            });

        }


        // Check already verified
        if (user.emailVerified) {

            return res.status(400).json({

                message: "Email already verified"

            });

        }


        // Check OTP
        if (
            !user.emailOTP ||
            user.emailOTP !== otp
        ) {

            return res.status(400).json({

                message: "Invalid OTP"

            });

        }


        // Check OTP expiry
        if (
            !user.emailOTPExpires ||
            user.emailOTPExpires < new Date()
        ) {

            return res.status(400).json({

                message: "OTP has expired"

            });

        }


        // Verify email
        user.emailVerified = true;


        // Remove OTP
        user.emailOTP = undefined;
        user.emailOTPExpires = undefined;


        await user.save();


        res.json({

            message: "Email verified successfully ✅"

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Server error"

        });

    }
};


// ================= LOGIN =================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // Check fields
        if (!email || !password) {

            return res.status(400).json({

                message: "Email and password are required"

            });

        }


        // Find user
        const user = await User.findOne({

            email: email.toLowerCase()

        });


        // User doesn't exist
        if (!user) {

            return res.status(401).json({

                message: "Invalid email or password"

            });

        }


        // Check email verification
        if (!user.emailVerified) {

            return res.status(403).json({

                message: "Please verify your email first"

            });

        }


        // Compare password
        const passwordMatch = await bcrypt.compare(

            password,

            user.password

        );


        if (!passwordMatch) {

            return res.status(401).json({

                message: "Invalid email or password"

            });

        }


        // Create JWT
        const token = jwt.sign(

            {
                id: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );


        // Login response
        res.json({

            message: "Login successful ✅",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                phone: user.phone,

                role: user.role

            }

        });


    } catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Server error"

        });

    }
};


// ================= EXPORT =================

module.exports = {

    signup,

    verifyEmail,

    login

};