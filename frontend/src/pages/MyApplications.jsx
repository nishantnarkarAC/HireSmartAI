import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';

const STATUS_STYLE = {
  applied: 'bg-slate-100 text-slate-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  hired: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/mine')
      .then((res) => setApps(res.data))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">My applications</h1>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : apps.length === 0 ? (
        <div className="card py-12 text-center text-slate-500">
          No applications yet. <Link to="/" className="text-brand-600 hover:underline">Find a job</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link to={`/jobs/${a.job_id}`} className="font-semibold hover:text-brand-600">{a.title}</Link>
                <p className="text-sm text-slate-500">
                  {a.company_name || 'Company'} · {a.location} · Applied {new Date(a.applied_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLE[a.status]}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
