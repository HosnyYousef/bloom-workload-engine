console.log('✅ Auth routes file loaded');

const Task = require("../models/Task"); // adjust path if your model lives elsewhere
const demoSeed = require("../seed/demoSeed");

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  console.log('📝 Register route hit');
  console.log('Body:', req.body);
  
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    console.log('✅ User created:', user._id);

    // Return user data + token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password this time)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Return user data + token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/demo
// One-click demo login for recruiters. No credentials required.
// Resets the demo user's tasks to a clean seed on every call.
router.post("/demo", async (req, res) => {
  try {
    // Find the demo account by a flag rather than email so it's explicit
    const demoUser = await User.findOne({ isDemo: true });

    if (!demoUser) {
      return res.status(404).json({ message: "Demo account not configured" });
    }

    // Wipe all existing tasks for the demo user so each recruiter starts fresh
    await Task.deleteMany({ userId: demoUser._id });

    // Insert the seed tasks, attaching them to the demo user's ID
    const seededTasks = demoSeed.map((task) => ({
      ...task,
      userId: demoUser._id,
    }));
    await Task.insertMany(seededTasks);

    // Issue a normal JWT — the rest of the app treats this as a regular session
    const token = jwt.sign(
      { userId: demoUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // shorter expiry for demo sessions
    );

    res.json({
      token,
      user: {
        id: demoUser._id,
        name: demoUser.name,
        email: demoUser.email,
      },
    });
  } catch (err) {
    console.error("Demo login error:", err);
    res.status(500).json({ message: "Demo login failed" });
  }
});

module.exports = router;