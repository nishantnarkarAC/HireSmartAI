import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Trash2, Unlock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, formatSalary } from '../../api';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.get('/jobs/mine')
      .then((res) => setJobs(res.data))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const toggleStatus = async (job) => {
    const status = job.status === 'open' ? 'closed' : 'open';
    try {
      await api.patch(`/jobs/${job.id}/status`, { status });
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status } : j)));
      toast.success(`Job ${status}`);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? Applications for it will be removed too.`)) return;
    try {
      await api.delete(`/jobs/${job.id}`);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
      toast.success('Job deleted');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Manage jobs</h1>
        <Link to="/employer/post-job" className="btn">Post a job</Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="card py-12 text-center text-slate-500">You haven't posted any jobs yet.</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link to={`/jobs/${job.id}`} className="truncate font-semibold hover:text-brand-600">{job.title}</Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    job.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {job.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {job.location} · {job.job_type} · {job.category} · {formatSalary(job.salary_min, job.salary_max)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link to={`/employer/jobs/${job.id}/applicants`} className="btn-outline">
                  <Users size={16} /> {job.applicants} applicant{job.applicants === 1 ? '' : 's'}
                </Link>
                <button onClick={() => toggleStatus(job)} className="btn-outline" title={job.status === 'open' ? 'Close job' : 'Reopen job'}>
                  {job.status === 'open' ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <button onClick={() => remove(job)} className="btn-outline text-rose-600" title="Delete job">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
