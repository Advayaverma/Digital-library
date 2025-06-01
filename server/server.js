const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const User = require("./userModel");
const connectDB = require("./db");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: "Username already exists!" });

        user = new User({ username, email, password });
        await user.save();

        res.status(201).json({ msg: "Signup successful!" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: "Invalid credentials!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials!" });

        res.status(200).json({ msg: "Login successful!" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
