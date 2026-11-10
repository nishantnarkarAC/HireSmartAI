import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import JobCard from '../components/JobCard';

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/saved')
      .then((res) => setJobs(res.data))
      .catch((e) => toast.error(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  // Unsaving removes the card from this page right away
  const unsave = async (job) => {
    try {
      await api.post(`/saved/${job.id}`);
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
      toast.success('Removed from saved');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Saved jobs</h1>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="card py-12 text-center text-slate-500">
          You haven't saved any jobs yet. <Link to="/" className="text-brand-600 hover:underline">Browse jobs</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => <JobCard key={job.id} job={job} onToggleSave={unsave} />)}
        </div>
      )}
    </div>
  );
}
