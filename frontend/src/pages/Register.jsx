import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker' });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await register(form);
      toast.success('Account created');
      navigate(user.role === 'employer' ? '/employer/profile' : '/profile', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto mt-10 max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Create account</h1>

      <div className="grid grid-cols-2 gap-2">
        {[['seeker', 'Job seeker'], ['employer', 'Employer']].map(([val, label]) => (
          <button
            type="button" key={val}
            onClick={() => setForm({ ...form, role: val })}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              form.role === val ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input required placeholder="Full name" className="input" value={form.name} onChange={set('name')} />
      <input type="email" required placeholder="Email" className="input" value={form.email} onChange={set('email')} />
      <input
        type="password" required minLength={6} placeholder="Password (min 6 characters)"
        className="input" value={form.password} onChange={set('password')}
      />
      <button className="btn w-full" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      <p className="text-center text-sm text-slate-500">
        Already registered? <Link to="/login" className="text-brand-600 hover:underline">Login</Link>
      </p>
    </form>
  );
}
