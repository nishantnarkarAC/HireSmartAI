import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, fileUrl } from '../../api';

const STATUSES = ['applied', 'shortlisted', 'hired', 'rejected'];

export default function Applicants() {
  const { id } = useParams();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/applications/job/${id}`)
      .then((res) => setApps(res.data))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (app, status) => {
    try {
      await api.patch(`/applications/${app.id}/status`, { status });
      setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
      toast.success(`Marked ${status}`);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div>
      <Link to="/employer/jobs" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to jobs
      </Link>
      <h1 className="mb-4 text-xl font-bold">Applicants</h1>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : apps.length === 0 ? (
        <div className="card py-12 text-center text-slate-500">No one has applied yet.</div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="card flex flex-wrap items-center gap-4">
              {a.profile_photo ? (
                <img src={fileUrl(a.profile_photo)} alt="" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {a.name[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{a.name}</p>
                <p className="text-sm text-slate-500">{a.email} · Applied {new Date(a.applied_at).toLocaleDateString()}</p>
              </div>
              {a.resume && (
                <a href={fileUrl(a.resume)} target="_blank" rel="noreferrer" className="btn-outline">
                  <FileText size={16} /> Resume
                </a>
              )}
              <select className="input w-auto capitalize" value={a.status} onChange={(e) => updateStatus(a, e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
