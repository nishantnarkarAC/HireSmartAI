const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const ALLOWED = {
  profile_photo: ['.png', '.jpg', '.jpeg', '.webp'],
  company_logo: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
  resume: ['.pdf', '.doc', '.docx'],
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const ok = (ALLOWED[file.fieldname] || []).includes(ext);
  cb(ok ? null : new Error(`Invalid file type for ${file.fieldname}`), ok);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
