const router = require('express').Router();
const db = require('../config/db');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth, requireRole('employer'));

// GET /api/employer/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const id = req.user.id;
    const [[jobs]] = await db.query('SELECT COUNT(*) AS total FROM jobs WHERE employer_id = ?', [id]);
    const [[openJobs]] = await db.query("SELECT COUNT(*) AS total FROM jobs WHERE employer_id = ? AND status = 'open'", [id]);
    const [[apps]] = await db.query(
      'SELECT COUNT(*) AS total FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.employer_id = ?', [id]);
    const [[hired]] = await db.query(
      "SELECT COUNT(*) AS total FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.employer_id = ? AND a.status = 'hired'", [id]);

    const [recent] = await db.query(
      `SELECT a.id, a.status, a.applied_at, u.name, u.email, u.profile_photo, u.resume, j.title AS job_title
       FROM applications a JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = a.seeker_id
       WHERE j.employer_id = ? ORDER BY a.applied_at DESC LIMIT 8`,
      [id]
    );

    res.json({
      stats: { totalJobs: jobs.total, openJobs: openJobs.total, totalApplicants: apps.total, hired: hired.total },
      recentApplicants: recent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
