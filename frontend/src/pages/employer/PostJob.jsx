import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { CATEGORIES, JOB_TYPES, errMsg } from '../../api';

const EMPTY = {
  title: '', description: '', requirements: '', location: '',
  category: CATEGORIES[0], job_type: JOB_TYPES[0], salary_min: '', salary_max: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.salary_min && form.salary_max && Number(form.salary_min) > Number(form.salary_max)) {
      return toast.error('Minimum salary cannot exceed maximum salary');
    }
    setBusy(true);
    try {
      await api.post('/jobs', form);
      toast.success('Job posted');
      navigate('/employer/jobs');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-4">
      <h1 className="text-xl font-bold">Post a new job</h1>

      <div>
        <label className="mb-1 block text-sm font-medium">Job title</label>
        <input required className="input" placeholder="e.g. Senior React Developer" value={form.title} onChange={set('title')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input required className="input" placeholder="Mumbai" value={form.location} onChange={set('location')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select className="input" value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Job type</label>
          <select className="input" value={form.job_type} onChange={set('job_type')}>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Min salary (₹ / year)</label>
          <input type="number" min="0" className="input" value={form.salary_min} onChange={set('salary_min')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Max salary (₹ / year)</label>
          <input type="number" min="0" className="input" value={form.salary_max} onChange={set('salary_max')} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea required rows={5} className="input" value={form.description} onChange={set('description')} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Requirements (one per line)</label>
        <textarea rows={4} className="input" value={form.requirements} onChange={set('requirements')} />
      </div>

      <button className="btn" disabled={busy}>{busy ? 'Posting…' : 'Post job'}</button>
    </form>
  );
}
