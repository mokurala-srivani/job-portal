const mongoose = require('mongoose');
const app = require('../server');

let connecting = null;
async function ensureDb() {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    connecting = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  }
  await connecting;
}

module.exports = async (req, res) => {
  try {
    await ensureDb();
  } catch (err) {
    return res.status(503).json({ message: 'Database unavailable', error: err.message });
  }
  return app(req, res);
};
