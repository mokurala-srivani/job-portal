const fs = require('fs');
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  // If multer already wrote a file to disk, clean it up so failed requests don't leak storage.
  if (req.file?.path) fs.promises.unlink(req.file.path).catch(() => {});
  if (Array.isArray(req.files)) req.files.forEach((f) => f?.path && fs.promises.unlink(f.path).catch(() => {}));
  return res.status(400).json({ message: 'Validation failed', errors: result.array() });
};
