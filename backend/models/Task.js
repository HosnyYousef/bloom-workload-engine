const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please add task text'],
        trim: true
    },
    hours: {
        type: Number,
        default: 0
    },
    deadline: {
        type: String,
        default: ''
    },
    // Where the deadline came from: picked by the user, found in the text,
    // or inferred from the task category. Lets the UI mark suggestions.
    deadlineSource: {
        type: String,
        enum: ['user', 'explicit', 'inferred', 'none', ''],
        default: ''
    },
    // How much focus the task needs. Set by the parser, editable by the user.
    energyRequired: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    // Small sub-steps the parser suggests so starting feels doable
    steps: [{
        text: { type: String, required: true },
        done: { type: Boolean, default: false }
    }],
    importance: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    completed: {
        type: Boolean,
        default: false
    },
    sorted: {
        type: Boolean,
        default: false
    },
    sortedCategory: {
        type: String,
        enum: ['priorities', 'tomorrow', 'dontForget', null],
        default: null
    },
    sortedAt: {
        type: Number,
        default: null
    },
    goal: {
        type: String,
        default: 'Personal'
    },
    smart: {
        specific: { type: Boolean, default: false },
        measurable: { type: Boolean, default: false },
        achievable: { type: Boolean, default: false },
        relevant: { type: Boolean, default: false },
        timeBound: { type: Boolean, default: false }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Task', taskSchema)