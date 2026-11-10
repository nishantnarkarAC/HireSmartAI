const router = require('express').Router();
const db = require('../config/db');
const { auth, requireRole } = require('../middleware/auth');

// POST /api/applications/:jobId  (seeker applies; resume required)
router.post('/:jobId', auth, requireRole('seeker'), async (req, res) => {
  try {
    const [[me]] = await db.query('SELECT resume FROM users WHERE id = ?', [req.user.id]);
    if (!me.resume) return res.status(400).json({ message: 'Please upload your resume in your profile before applying' });

    const [jobs] = await db.query("SELECT id FROM jobs WHERE id = ? AND status = 'open'", [req.params.jobId]);
    if (!jobs.length) return res.status(404).json({ message: 'Job not found or closed' });

    await db.query('INSERT INTO applications (job_id, seeker_id) VALUES (?, ?)', [req.params.jobId, req.user.id]);
    res.status(201).json({ message: 'Application submitted' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'You already applied to this job' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/applications/mine  (seeker's applications)
router.get('/mine', auth, requireRole('seeker'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.status, a.applied_at, j.id AS job_id, j.title, j.location, u.company_name
       FROM applications a JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = j.employer_id
       WHERE a.seeker_id = ? ORDER BY a.applied_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/applications/job/:jobId  (employer sees applicants for their job)
router.get('/job/:jobId', auth, requireRole('employer'), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.status, a.applied_at, u.id AS seeker_id, u.name, u.email, u.profile_photo, u.resume
       FROM applications a
       JOIN jobs j ON j.id = a.job_id
       JOIN users u ON u.id = a.seeker_id
       WHERE a.job_id = ? AND j.employer_id = ?
       ORDER BY a.applied_at DESC`,
      [req.params.jobId, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/applications/:id/status  (employer: shortlist / hire / reject)
router.patch('/:id/status', auth, requireRole('employer'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['applied', 'shortlisted', 'hired', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const [r] = await db.query(
      `UPDATE applications a JOIN jobs j ON j.id = a.job_id
       SET a.status = ? WHERE a.id = ? AND j.employer_id = ?`,
      [status, req.params.id, req.user.id]
    );
    if (!r.affectedRows) return res.status(404).json({ message: 'Application not found' });
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
