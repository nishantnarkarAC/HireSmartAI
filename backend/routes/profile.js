const router = require('express').Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { publicUser } = require('./auth');

// GET /api/profile
router.get('/', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(publicUser(rows[0]));
});

// PUT /api/profile  (multipart: name, company_name, company_description + profile_photo, company_logo, resume)
router.put(
  '/',
  auth,
  upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'company_logo', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, company_name, company_description } = req.body;
      const files = req.files || {};
      const fields = [];
      const params = [];

      if (name) { fields.push('name = ?'); params.push(name); }

      if (req.user.role === 'employer') {
        if (company_name !== undefined) { fields.push('company_name = ?'); params.push(company_name); }
        if (company_description !== undefined) { fields.push('company_description = ?'); params.push(company_description); }
        if (files.company_logo) { fields.push('company_logo = ?'); params.push(files.company_logo[0].filename); }
      } else if (files.resume) {
        fields.push('resume = ?'); params.push(files.resume[0].filename);
      }

      if (files.profile_photo) { fields.push('profile_photo = ?'); params.push(files.profile_photo[0].filename); }

      if (fields.length) {
        await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...params, req.user.id]);
      }
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
      res.json(publicUser(rows[0]));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
