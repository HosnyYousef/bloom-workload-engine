const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');
const { parseEntry } = require('../engine/parseEntry');
const { recommendTasks, applyPriorityPlan, todayCapacity } = require('../engine/recommend');

// @route   GET /api/tasks
// @desc    Get all tasks for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/tasks/parse
// @desc    Turn a freeform entry into a structured task suggestion.
//          Does not save anything; the client decides what to keep.
// @access  Private
router.post('/parse', protect, (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ message: 'Task text is required' });
  }
  res.status(200).json(parseEntry(text));
});

// @route   POST /api/tasks/recommend
// @desc    Score all open tasks and return the top 3 for today plus
//          tomorrow / don't forget buckets. Body: { energyLevel, persist }.
//          energyLevel comes from the client's energy selector for now;
//          the measurement method is pluggable (see engine/README.md).
//          With persist: true the buckets are written to sortedCategory.
// @access  Private
router.post('/recommend', protect, async (req, res) => {
  try {
    const { energyLevel = 'typical', persist = false, preferredTodayIds } = req.body;

    const tasks = await Task.find({ user: req.user._id, completed: false });

    const recommendations = recommendTasks(tasks, {
      now: new Date(),
      energy: { level: energyLevel },
      goals: req.user.goals || {},
    });
    const savedPlan = Array.isArray(preferredTodayIds)
      ? preferredTodayIds
      : Array.from(req.user.priorityPlans?.[energyLevel] || []);
    const result = applyPriorityPlan(recommendations, savedPlan);

    if (persist) {
      const buckets = [
        ['today', 'priorities'],
        ['tomorrow', 'tomorrow'],
        ['dontForget', 'dontForget'],
      ];
      const ops = [];
      for (const [bucket, category] of buckets) {
        for (const [sectionOrder, item] of result[bucket].entries()) {
          ops.push({
            updateOne: {
              filter: { _id: item.task._id },
              update: { sorted: true, sortedCategory: category, sortedAt: Date.now(), sectionOrder },
            },
          });
        }
      }
      if (ops.length > 0) await Task.bulkWrite(ops);
      req.user.priorityPlans = req.user.priorityPlans || {};
      req.user.priorityPlans[energyLevel] = result.today.map(item => item.task._id);
      if (typeof req.user.save === 'function') await req.user.save();
    }

    const serialize = (item) => ({
      ...(item.task.toObject ? item.task.toObject() : item.task),
      score: item.score,
      scoreBreakdown: item.breakdown,
    });

    res.status(200).json({
      today: result.today.map(serialize),
      tomorrow: result.tomorrow.map(serialize),
      dontForget: result.dontForget.map(serialize),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tasks/priority-plan/:energyLevel
// @desc    Save the user's explicit ordered priorities for one energy mode.
// @access  Private
router.put('/priority-plan/:energyLevel', protect, async (req, res) => {
  const { energyLevel } = req.params;
  const taskIds = Array.isArray(req.body.taskIds) ? req.body.taskIds.map(String) : null;
  if (!['early', 'typical', 'slow'].includes(energyLevel)) {
    return res.status(400).json({ message: 'Invalid energy level' });
  }
  if (!taskIds || taskIds.length > todayCapacity(energyLevel) || new Set(taskIds).size !== taskIds.length) {
    return res.status(400).json({ message: 'Invalid priority plan' });
  }

  req.user.priorityPlans = req.user.priorityPlans || {};
  req.user.priorityPlans[energyLevel] = taskIds;
  await req.user.save();
  return res.status(200).json({ energyLevel, taskIds });
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user owns this task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user owns this task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
