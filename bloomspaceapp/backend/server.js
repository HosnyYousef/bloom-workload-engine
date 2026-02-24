const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// initalize Express app
const app = express()

// Middleware
app.use(cors()); // Enable CORS for frontend
app.use(express.json()) // Prase JSON bodies
app.use(express.urlencoded({ extended: false }));

// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/tasks', require('./routes/tasks'));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'BloomSpace API is running!'})
})

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})