import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(user.role === 'employer' ? '/employer' : location.state?.from || '/', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto mt-10 max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Login</h1>
      <input
        type="email" required placeholder="Email" className="input"
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password" required placeholder="Password" className="input"
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="btn w-full" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
      <p className="text-center text-sm text-slate-500">
        No account? <Link to="/register" className="text-brand-600 hover:underline">Sign up</Link>
      </p>
    </form>
  );
}
