const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Initialize Express app
const app = express()

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: false }));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'BloomSpace API is running!'})
})

// API Routes (AFTER middleware)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})