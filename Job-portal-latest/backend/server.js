require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/users', require('./routes/users'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

if (require.main === module) {
  connectDB(process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => console.log(`[api] listening on :${PORT}`)))
    .catch((err) => {
      console.error('[db] connection failed', err.message);
      process.exit(1);
    });
}

module.exports = app;
