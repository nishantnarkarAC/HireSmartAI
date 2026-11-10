const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { auth, requireRole } = require('../middleware/auth');

// Optional auth: attaches req.user if a valid token is present, never blocks.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      /* treat as guest */
    }
  }
  next();
}

// GET /api/jobs  (public) ?search=&city=&category=&type=&minSalary=&maxSalary=&page=&limit=
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, city, category, type, minSalary, maxSalary } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    const where = ["j.status = 'open'"];
    const params = [];

    if (search) { where.push('j.title LIKE ?'); params.push(`%${search}%`); }
    if (city) { where.push('j.location LIKE ?'); params.push(`%${city}%`); }
    if (category) { where.push('j.category = ?'); params.push(category); }
    if (type) { where.push('j.job_type = ?'); params.push(type); }
    if (minSalary) { where.push('j.salary_max >= ?'); params.push(Number(minSalary)); }
    if (maxSalary) { where.push('j.salary_min <= ?'); params.push(Number(maxSalary)); }

    const whereSql = where.join(' AND ');
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM jobs j WHERE ${whereSql}`, params);

    const [jobs] = await db.query(
      `SELECT j.id, j.title, j.location, j.category, j.job_type, j.salary_min, j.salary_max, j.created_at,
              u.company_name, u.company_logo
       FROM jobs j JOIN users u ON u.id = j.employer_id
       WHERE ${whereSql}
       ORDER BY j.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, (page - 1) * limit]
    );

    // Mark which jobs the logged-in seeker has saved
    if (req.user && req.user.role === 'seeker' && jobs.length) {
      const [saved] = await db.query(
        'SELECT job_id FROM saved_jobs WHERE seeker_id = ? AND job_id IN (?)',
        [req.user.id, jobs.map((j) => j.id)]
      );
      const savedSet = new Set(saved.map((s) => s.job_id));
      jobs.forEach((j) => { j.saved = savedSet.has(j.id); });
    }

    res.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/mine  (employer: their own postings with applicant counts)
router.get('/mine', auth, requireRole('employer'), async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT j.*, COUNT(a.id) AS applicants
       FROM jobs j LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.employer_id = ?
       GROUP BY j.id ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/jobs/:id  (public)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT j.*, u.company_name, u.company_description, u.company_logo
       FROM jobs j JOIN users u ON u.id = j.employer_id WHERE j.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Job not found' });
    const job = rows[0];

    if (req.user && req.user.role === 'seeker') {
      const [[a]] = await db.query('SELECT COUNT(*) AS c FROM applications WHERE job_id = ? AND seeker_id = ?', [job.id, req.user.id]);
      const [[s]] = await db.query('SELECT COUNT(*) AS c FROM saved_jobs WHERE job_id = ? AND seeker_id = ?', [job.id, req.user.id]);
      job.applied = a.c > 0;
      job.saved = s.c > 0;
    }
    res.json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/jobs  (employer)
router.post('/', auth, requireRole('employer'), async (req, res) => {
  try {
    const { title, description, requirements, location, category, job_type, salary_min, salary_max } = req.body;
    if (!title || !description || !location || !category || !job_type) {
      return res.status(400).json({ message: 'Title, description, location, category and job type are required' });
    }
    if (!['Full-time', 'Part-time', 'Internship'].includes(job_type)) {
      return res.status(400).json({ message: 'Invalid job type' });
    }
    const [result] = await db.query(
      `INSERT INTO jobs (employer_id, title, description, requirements, location, category, job_type, salary_min, salary_max)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, requirements || '', location, category, job_type, Number(salary_min) || 0, Number(salary_max) || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/jobs/:id/status  (employer: open/close)
router.patch('/:id/status', auth, requireRole('employer'), async (req, res) => {
  try {
    const status = req.body.status === 'closed' ? 'closed' : 'open';
    const [r] = await db.query('UPDATE jobs SET status = ? WHERE id = ? AND employer_id = ?', [status, req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/jobs/:id  (employer)
router.delete('/:id', auth, requireRole('employer'), async (req, res) => {
  try {
    const [r] = await db.query('DELETE FROM jobs WHERE id = ? AND employer_id = ?', [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
