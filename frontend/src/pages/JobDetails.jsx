import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, Building2, Clock, MapPin, Send, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, fileUrl, formatSalary } from '../api';
import { useAuth } from '../context/AuthContext';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => setLoading(false));
  }, [id, user]);

  const requireSeeker = () => {
    if (!user) { toast('Please login to continue'); navigate('/login', { state: { from: `/jobs/${id}` } }); return false; }
    if (user.role !== 'seeker') { toast.error('Only job seekers can do this'); return false; }
    return true;
  };

  const apply = async () => {
    if (!requireSeeker()) return;
    setApplying(true);
    try {
      await api.post(`/applications/${id}`);
      setJob((j) => ({ ...j, applied: true }));
      toast.success('Application submitted!');
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setApplying(false);
    }
  };

  const toggleSave = async () => {
    if (!requireSeeker()) return;
    try {
      const { data } = await api.post(`/saved/${id}`);
      setJob((j) => ({ ...j, saved: data.saved }));
      toast.success(data.saved ? 'Job saved' : 'Removed from saved');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!job) return <p className="text-slate-500">Job not found.</p>;

  const requirements = (job.requirements || '').split('\n').map((r) => r.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back to jobs
      </Link>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {job.company_logo ? (
              <img src={fileUrl(job.company_logo)} alt="" className="h-14 w-14 rounded-lg object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Building2 size={26} />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{job.title}</h1>
              <p className="text-slate-500">{job.company_name || 'Company'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleSave} className="btn-outline" title="Save job">
              <Bookmark size={16} fill={job.saved ? 'currentColor' : 'none'} className={job.saved ? 'text-brand-600' : ''} />
              {job.saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={apply} disabled={applying || job.applied || job.status === 'closed'} className="btn">
              <Send size={16} />
              {job.applied ? 'Applied' : job.status === 'closed' ? 'Closed' : applying ? 'Applying…' : 'Apply now'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <span className="flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> {job.location}</span>
          <span className="flex items-center gap-2"><Clock size={16} className="text-slate-400" /> {job.job_type}</span>
          <span className="flex items-center gap-2"><Tag size={16} className="text-slate-400" /> {job.category}</span>
          <span className="font-semibold">{formatSalary(job.salary_min, job.salary_max)}</span>
        </div>

        <hr className="my-5 border-slate-200" />

        <h2 className="mb-2 font-semibold">Job description</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p>

        {requirements.length > 0 && (
          <>
            <h2 className="mb-2 mt-6 font-semibold">Requirements</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {requirements.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </>
        )}

        {job.company_description && (
          <>
            <h2 className="mb-2 mt-6 font-semibold">About {job.company_name || 'the company'}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.company_description}</p>
          </>
        )}
      </div>
    </div>
  );
}
