import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bookmark, Clock, Building2 } from 'lucide-react';
import { fileUrl, formatSalary } from '../api';

const timeAgo = (d) => {
  const days = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
};

export default function JobCard({ job, view = 'grid', onToggleSave }) {
  const list = view === 'list';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`card flex gap-4 ${list ? 'flex-row items-center' : 'flex-col'}`}
    >
      <div className="flex items-start gap-3">
        {job.company_logo ? (
          <img src={fileUrl(job.company_logo)} alt="" className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Building2 size={22} />
          </div>
        )}
        {!list && (
          <div className="min-w-0 flex-1">
            <Link to={`/jobs/${job.id}`} className="block truncate font-semibold hover:text-brand-600">{job.title}</Link>
            <p className="truncate text-sm text-slate-500">{job.company_name || 'Company'}</p>
          </div>
        )}
      </div>

      {list && (
        <div className="min-w-0 flex-1">
          <Link to={`/jobs/${job.id}`} className="block truncate font-semibold hover:text-brand-600">{job.title}</Link>
          <p className="truncate text-sm text-slate-500">{job.company_name || 'Company'}</p>
        </div>
      )}

      <div className={`flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 ${list ? 'flex-1' : ''}`}>
        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {timeAgo(job.created_at)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{job.job_type}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{job.category}</span>
      </div>

      <div className={`flex items-center justify-between gap-3 ${list ? '' : 'mt-auto'}`}>
        <span className="text-sm font-semibold text-slate-800">{formatSalary(job.salary_min, job.salary_max)}</span>
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(job)}
            title={job.saved ? 'Remove from saved' : 'Save job'}
            className={`rounded-lg p-2 transition hover:bg-slate-100 ${job.saved ? 'text-brand-600' : 'text-slate-400'}`}
          >
            <Bookmark size={18} fill={job.saved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
