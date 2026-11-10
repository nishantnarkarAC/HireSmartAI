import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Briefcase, Bookmark, User, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fileUrl } from '../api';

const linkCls = ({ isActive }) =>
  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <Briefcase size={22} /> HireSmartAI
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkCls}>Jobs</NavLink>

          {user?.role === 'seeker' && (
            <>
              <NavLink to="/saved" className={linkCls}><Bookmark size={16} /> Saved</NavLink>
              <NavLink to="/applications" className={linkCls}><ClipboardList size={16} /> Applications</NavLink>
              <NavLink to="/profile" className={linkCls}>
                {user.profile_photo ? (
                  <img src={fileUrl(user.profile_photo)} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <User size={16} />
                )}
                Profile
              </NavLink>
            </>
          )}

          {user?.role === 'employer' && (
            <NavLink to="/employer" className={linkCls}><LayoutDashboard size={16} /> Dashboard</NavLink>
          )}

          {user ? (
            <button onClick={handleLogout} className="btn-outline ml-2"><LogOut size={16} /> Logout</button>
          ) : (
            <>
              <Link to="/login" className="btn-outline ml-2">Login</Link>
              <Link to="/register" className="btn">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
