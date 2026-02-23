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
    },deadline: {
        type: String,
        default: ''
    },
    importance: {
        type: String,
        emum: ['high', 'medium', 'low'],
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
        emum: ['priorties', 'tomorrow', 'dontForget', null],
        default: null
    },
    sortedAt: {
        type: Number,
        default: null
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