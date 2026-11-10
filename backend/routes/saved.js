const router = require('express').Router();
const db = require('../config/db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth, requireRole('seeker'));

// GET /api/saved
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT j.id, j.title, j.location, j.category, j.job_type, j.salary_min, j.salary_max, j.created_at,
              u.company_name, u.company_logo
       FROM saved_jobs s JOIN jobs j ON j.id = s.job_id JOIN users u ON u.id = j.employer_id
       WHERE s.seeker_id = ? ORDER BY s.saved_at DESC`,
      [req.user.id]
    );
    res.json(rows.map((r) => ({ ...r, saved: true })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/saved/:jobId  (toggle: saves if not saved, removes if saved)
router.post('/:jobId', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM saved_jobs WHERE job_id = ? AND seeker_id = ?', [req.params.jobId, req.user.id]);
    if (existing.length) {
      await db.query('DELETE FROM saved_jobs WHERE id = ?', [existing[0].id]);
      return res.json({ saved: false });
    }
    await db.query('INSERT INTO saved_jobs (job_id, seeker_id) VALUES (?, ?)', [req.params.jobId, req.user.id]);
    res.status(201).json({ saved: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
