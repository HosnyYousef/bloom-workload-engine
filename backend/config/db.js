const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    // Do not exit the process here. app.listen() already runs by the time
    // this rejects, so exiting kills a server that looks like it's up.
    // Every route touching the DB still fails (and logs) until MONGODB_URI
    // is fixed and the process is restarted, but at least the failure is
    // visible instead of the whole API silently disappearing.
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    console.error('   The API will stay up, but any route that touches the database will error until this is fixed.')
  }
}

module.exports = connectDB;