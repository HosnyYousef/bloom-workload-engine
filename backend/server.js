// dotenv must load first so SENTRY_DSN is available when Sentry.init() runs
const dotenv = require('dotenv')
dotenv.config()

const Sentry = require('@sentry/node')

// Sentry is only active when SENTRY_DSN is set. No-op otherwise.
// To enable: add SENTRY_DSN=<your-dsn> to backend/.env
Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  environment: process.env.NODE_ENV || 'development',
  enabled: !!process.env.SENTRY_DSN,
})

const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')

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

// Sentry error handler — must be the last middleware before the generic error handler
app.use(Sentry.expressErrorHandler())

// Generic error handler (catches anything not caught by Sentry or routes)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ message: 'Internal server error' })
})

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})
