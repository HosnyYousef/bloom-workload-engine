const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const EMPTY_GOALS = { yearly: [], monthly: [], weekly: [] };

// Keep only non-empty strings so the scorer never sees junk
const cleanTier = (value) =>
  Array.isArray(value)
    ? value.filter((s) => typeof s === 'string').map((s) => s.trim()).filter(Boolean)
    : [];

// @route   GET /api/goals
// @desc    Get the logged-in user's goal statements
// @access  Private
router.get('/', protect, (req, res) => {
  res.status(200).json(req.user.goals || EMPTY_GOALS);
});

// @route   PUT /api/goals
// @desc    Replace the user's goals. Body: { yearly, monthly, weekly },
//          each an array of plain statements like "run a half marathon".
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    req.user.goals = {
      yearly: cleanTier(req.body.yearly),
      monthly: cleanTier(req.body.monthly),
      weekly: cleanTier(req.body.weekly),
    };
    await req.user.save();
    res.status(200).json(req.user.goals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
