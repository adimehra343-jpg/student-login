const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Student Success AI Backend Running 🚀"
    });
});

// Auth routes
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});