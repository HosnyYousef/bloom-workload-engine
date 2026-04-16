// Run once to create the demo account in Atlas.
// Delete this file after running.
// Usage: node backend/seed/createDemoUser.js

require("dotenv").config(); // .env is in backend/, same level as this script's root
const mongoose = require("mongoose"); // was missing
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // adjust path

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const existing = await User.findOne({ isDemo: true });
  if (existing) {
    console.log("Demo user already exists");
    process.exit(0);
  }

  // Password doesn't matter since login bypasses credentials, but the field may be required
  const hashedPassword = await bcrypt.hash("demo-placeholder-pw", 10);

  await User.create({
    name: "Demo User",
    email: "demo@bloomspace.app",
    password: hashedPassword,
    isDemo: true,
  });

  console.log("Demo user created");
  mongoose.disconnect();
});