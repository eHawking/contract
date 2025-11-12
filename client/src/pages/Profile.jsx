import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { profileAPI, authAPI } from '../lib/api';
import useAuthStore from '../store/useAuthStore';
import { toast } from 'sonner';

function Profile() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company_name: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const load = async () => {
    try {
      const { data } = await profileAPI.get();
      const u = data.user || user;
      setForm({
        name: u?.name || '',
        email: u?.email || '',
        phone: u?.phone || '',
        address: u?.address || '',
        company_name: u?.company_name || ''
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const { data } = await profileAPI.update(form);
      if (data.user) updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return toast.error('Select a photo first');
    try {
      const { data } = await profileAPI.uploadAvatar(avatarFile);
      updateUser({ ...(user||{}), avatar_url: data.avatar_url });
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload photo');
    }
  };

  const changePassword = async () => {
    if (!pwd.currentPassword || !pwd.newPassword) return toast.error('Enter both current and new password');
    try {
      await authAPI.changePassword(pwd);
      setPwd({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-600">Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column: avatar */}
          <div className="card flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-sm">No Photo</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e)=>setAvatarFile(e.target.files[0]||null)} />
            <button className="btn btn-secondary w-full" onClick={uploadAvatar}>Upload Photo</button>
          </div>

          {/* Right column: profile form */}
          <div className="md:col-span-2 card space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input className="input" value={form.name} onChange={(e)=>setForm({ ...form, name:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e)=>setForm({ ...form, email:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input className="input" value={form.phone} onChange={(e)=>setForm({ ...form, phone:e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input className="input" value={form.company_name} onChange={(e)=>setForm({ ...form, company_name:e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea className="textarea" rows="3" value={form.address} onChange={(e)=>setForm({ ...form, address:e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={saveProfile}>Save Profile</button>
          </div>
        </div>

        {/* Change password */}
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input type="password" className="input" value={pwd.currentPassword} onChange={(e)=>setPwd({ ...pwd, currentPassword:e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type="password" className="input" value={pwd.newPassword} onChange={(e)=>setPwd({ ...pwd, newPassword:e.target.value })} />
            </div>
          </div>
          <button className="btn btn-secondary mt-4" onClick={changePassword}>Update Password</button>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;
