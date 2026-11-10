import { useState } from 'react';
import { FileText, ImagePlus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { errMsg, fileUrl } from '../api';
import { useAuth } from '../context/AuthContext';

// One profile page for both roles: seekers get a resume upload, employers get company fields.
export default function Profile() {
  const { user, setUser } = useAuth();
  const isEmployer = user.role === 'employer';

  const [form, setForm] = useState({
    name: user.name || '',
    company_name: user.company_name || '',
    company_description: user.company_description || '',
  });
  const [files, setFiles] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const pick = (k) => (e) => setFiles({ ...files, [k]: e.target.files[0] });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (isEmployer) {
        fd.append('company_name', form.company_name);
        fd.append('company_description', form.company_description);
      }
      Object.entries(files).forEach(([k, f]) => f && fd.append(k, f));

      const { data } = await api.put('/profile', fd);
      setUser(data);
      setFiles({});
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const photoPreview = files.profile_photo ? URL.createObjectURL(files.profile_photo) : fileUrl(user.profile_photo);
  const logoPreview = files.company_logo ? URL.createObjectURL(files.company_logo) : fileUrl(user.company_logo);

  return (
    <form onSubmit={submit} className="card mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-bold">{isEmployer ? 'Company profile' : 'My profile'}</h1>

      <div className="flex items-center gap-4">
        {photoPreview ? (
          <img src={photoPreview} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-semibold text-brand-700">
            {user.name[0]}
          </div>
        )}
        <label className="btn-outline cursor-pointer">
          <ImagePlus size={16} /> {files.profile_photo ? files.profile_photo.name : 'Change photo'}
          <input type="file" accept="image/*" hidden onChange={pick('profile_photo')} />
        </label>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input className="input" required value={form.name} onChange={set('name')} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input className="input bg-slate-50" value={user.email} disabled />
      </div>

      {isEmployer ? (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">Company name</label>
            <input className="input" value={form.company_name} onChange={set('company_name')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Company description</label>
            <textarea rows={4} className="input" value={form.company_description} onChange={set('company_description')} />
          </div>
          <div className="flex items-center gap-4">
            {logoPreview && <img src={logoPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />}
            <label className="btn-outline cursor-pointer">
              <Upload size={16} /> {files.company_logo ? files.company_logo.name : 'Upload company logo'}
              <input type="file" accept="image/*" hidden onChange={pick('company_logo')} />
            </label>
          </div>
        </>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium">Resume (PDF, DOC, DOCX – max 5 MB)</label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="btn-outline cursor-pointer">
              <Upload size={16} /> {files.resume ? files.resume.name : user.resume ? 'Replace resume' : 'Upload resume'}
              <input type="file" accept=".pdf,.doc,.docx" hidden onChange={pick('resume')} />
            </label>
            {user.resume && !files.resume && (
              <a href={fileUrl(user.resume)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">
                <FileText size={16} /> View current resume
              </a>
            )}
          </div>
        </div>
      )}

      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
