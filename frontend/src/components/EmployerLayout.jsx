import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Briefcase, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fileUrl } from '../api';

const linkCls = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function EmployerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 text-lg font-bold text-brand-700">
          <Briefcase size={22} /> HireSmartAI
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to="/employer" end className={linkCls}><LayoutDashboard size={18} /> Dashboard</NavLink>
          <NavLink to="/employer/post-job" className={linkCls}><PlusCircle size={18} /> Post a Job</NavLink>
          <NavLink to="/employer/jobs" className={linkCls}><Briefcase size={18} /> Manage Jobs</NavLink>
          <NavLink to="/employer/profile" className={linkCls}><Building2 size={18} /> Company Profile</NavLink>
        </nav>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4">
          {user.company_logo || user.profile_photo ? (
            <img src={fileUrl(user.company_logo || user.profile_photo)} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
              {user.name[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.company_name || user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            title="Logout"
            onClick={() => { logout(); navigate('/'); }}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="flex-1">
        {/* Mobile top bar */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white p-2 md:hidden">
          <NavLink to="/employer" end className={linkCls}>Dashboard</NavLink>
          <NavLink to="/employer/post-job" className={linkCls}>Post</NavLink>
          <NavLink to="/employer/jobs" className={linkCls}>Jobs</NavLink>
          <NavLink to="/employer/profile" className={linkCls}>Profile</NavLink>
        </div>
        <main className="mx-auto max-w-5xl p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
