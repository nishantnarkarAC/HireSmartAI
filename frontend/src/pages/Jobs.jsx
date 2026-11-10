import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { CATEGORIES, JOB_TYPES, errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const SALARY_RANGES = [
  { label: 'Any salary', min: '', max: '' },
  { label: 'Up to ₹3L', min: '', max: 300000 },
  { label: '₹3L – ₹6L', min: 300000, max: 600000 },
  { label: '₹6L – ₹12L', min: 600000, max: 1200000 },
  { label: '₹12L+', min: 1200000, max: '' },
];

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [salaryIdx, setSalaryIdx] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const salary = SALARY_RANGES[salaryIdx];
      const { data } = await api.get('/jobs', {
        params: { search, city, category, type, minSalary: salary.min, maxSalary: salary.max, page, limit: 9 },
      });
      setJobs(data.jobs);
      setPages(data.pages);
      setTotal(data.total);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [search, city, category, type, salaryIdx, page]);

  // Debounce so typing in search boxes doesn't fire a request per keystroke
  useEffect(() => {
    const t = setTimeout(fetchJobs, 300);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  // Reset to page 1 whenever a filter changes
  useEffect(() => { setPage(1); }, [search, city, category, type, salaryIdx]);

  const toggleSave = async (job) => {
    if (!user) { toast('Login to save jobs'); navigate('/login'); return; }
    if (user.role !== 'seeker') return;
    try {
      const { data } = await api.post(`/saved/${job.id}`);
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, saved: data.saved } : j)));
      toast.success(data.saved ? 'Job saved' : 'Removed from saved');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const clearFilters = () => {
    setSearch(''); setCity(''); setCategory(''); setType(''); setSalaryIdx(0);
  };

  return (
    <div>
      {/* Hero search */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-500 p-6 text-white">
        <h1 className="text-2xl font-bold md:text-3xl">Find your next role</h1>
        <p className="mt-1 text-indigo-100">Browse openings from top employers. No login needed to explore.</p>
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 text-slate-800"
              placeholder="Job title (e.g. React Developer)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9 text-slate-800"
              placeholder="City (e.g. Mumbai, Bangalore)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap items-center gap-3">
        <SlidersHorizontal size={16} className="text-slate-400" />
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All job types</option>
          {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="input w-auto" value={salaryIdx} onChange={(e) => setSalaryIdx(Number(e.target.value))}>
          {SALARY_RANGES.map((s, i) => <option key={s.label} value={i}>{s.label}</option>)}
        </select>
        <button onClick={clearFilters} className="text-sm text-brand-600 hover:underline">Clear</button>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-slate-200 p-1">
          <button
            onClick={() => setView('grid')}
            title="Grid view"
            className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-slate-500'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            title="List view"
            className={`rounded-md p-1.5 ${view === 'list' ? 'bg-brand-600 text-white' : 'text-slate-500'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <p className="mb-3 text-sm text-slate-500">{loading ? 'Searching…' : `${total} job${total === 1 ? '' : 's'} found`}</p>

      {!loading && jobs.length === 0 ? (
        <div className="card py-12 text-center text-slate-500">No jobs match your filters.</div>
      ) : (
        <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col gap-3'}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} view={view} onToggleSave={user?.role === 'employer' ? null : toggleSave} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button className="btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="text-sm text-slate-600">Page {page} of {pages}</span>
          <button className="btn-outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
