const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check in User collection
    let user = await User.findOne({ email });
    if (!user) {
      // Check in Admin collection
      user = await Admin.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and assign a token
    const token = jwt.sign(
      { id: user._id, role: user instanceof Admin ? "admin" : "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user instanceof Admin ? "admin" : "user",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User  already exists" });
    }

    // Create a new user
    user = new User({ name, email, password: await bcrypt.hash(password, 10) });
    await user.save();

    res.status(201).json({ message: "Account created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// Protected route example
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Fetch user from User or Admin collection
    const user =
      (await User.findById(req.user.id)) || (await Admin.findById(req.user.id));

    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    // Return user data including name
    res.json({
      id: user._id,
      name: user.name, // Include name in the response
      email: user.email,
      role: req.user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
