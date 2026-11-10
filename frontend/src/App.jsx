import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import EmployerLayout from './components/EmployerLayout';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import SavedJobs from './pages/SavedJobs';
import MyApplications from './pages/MyApplications';
import Profile from './pages/Profile';
import Dashboard from './pages/employer/Dashboard';
import PostJob from './pages/employer/PostJob';
import ManageJobs from './pages/employer/ManageJobs';
import Applicants from './pages/employer/Applicants';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { loading } = useAuth();
  if (loading) return <div className="p-10 text-center text-slate-500">Loading…</div>;

  return (
    <Routes>
      {/* Employer area (dashboard layout) */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute role="employer">
            <EmployerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="jobs/:id/applicants" element={<Applicants />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Public + job seeker area */}
      <Route
        path="*"
        element={
          <>
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-6">
              <Routes>
                <Route path="/" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/saved" element={<ProtectedRoute role="seeker"><SavedJobs /></ProtectedRoute>} />
                <Route path="/applications" element={<ProtectedRoute role="seeker"><MyApplications /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute role="seeker"><Profile /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        }
      />
    </Routes>
  );
}
