import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, FileText, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, fileUrl } from '../../api';

const STATUS_STYLE = {
  applied: 'bg-slate-100 text-slate-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  hired: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/employer/dashboard')
      .then((res) => setData(res.data))
      .catch((e) => toast.error(errMsg(e)));
  }, []);

  if (!data) return <p className="text-slate-500">Loading…</p>;

  const { stats, recentApplicants } = data;
  const cards = [
    { label: 'Total jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-brand-600 bg-brand-50' },
    { label: 'Open jobs', value: stats.openJobs, icon: FileText, color: 'text-sky-600 bg-sky-50' },
    { label: 'Applicants', value: stats.totalApplicants, icon: Users, color: 'text-amber-600 bg-amber-50' },
    { label: 'Hired', value: stats.hired, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Link to="/employer/post-job" className="btn">Post a job</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card flex items-center gap-4"
          >
            <div className={`rounded-lg p-3 ${color}`}><Icon size={22} /></div>
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-semibold">Recent applicants</h2>
      {recentApplicants.length === 0 ? (
        <div className="card py-10 text-center text-slate-500">No applicants yet.</div>
      ) : (
        <div className="card divide-y divide-slate-100 p-0">
          {recentApplicants.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              {a.profile_photo ? (
                <img src={fileUrl(a.profile_photo)} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  {a.name[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.name}</p>
                <p className="truncate text-xs text-slate-500">Applied for {a.job_title}</p>
              </div>
              {a.resume && (
                <a href={fileUrl(a.resume)} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">
                  Resume
                </a>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[a.status]}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
