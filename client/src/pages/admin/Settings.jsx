import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { settingsAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('company');
  const [settings, setSettings] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    logo_url: '',
    email_smtp_host: '',
    email_smtp_port: 587,
    email_smtp_user: '',
    email_smtp_password: '',
    email_smtp_secure: true,
    gemini_api_key: '',
    gemini_model: 'gemini-1.5-flash'
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const { data } = await settingsAPI.get();
      if (data.settings) setSettings({ ...settings, ...data.settings });
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await settingsAPI.update(settings);
      toast.success('Settings updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update settings');
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return toast.error('Select a logo file first');
    try {
      const { data } = await settingsAPI.uploadLogo(logoFile);
      setSettings((s) => ({ ...s, logo_url: data.logo_url }));
      toast.success('Logo updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Logo upload failed');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12 text-gray-600">Loading settings...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <PageHeader title="Settings" />

        <div className="flex gap-2 mb-6">
          <button className={`btn ${tab==='company'?'btn-primary':'btn-outline'}`} onClick={() => setTab('company')}>Company</button>
          <button className={`btn ${tab==='email'?'btn-primary':'btn-outline'}`} onClick={() => setTab('email')}>Email</button>
          <button className={`btn ${tab==='ai'?'btn-primary':'btn-outline'}`} onClick={() => setTab('ai')}>AI (Gemini)</button>
        </div>

        {tab === 'company' && (
          <div className="card space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-sm">No Logo</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={(e)=>setLogoFile(e.target.files[0]||null)} />
                <button className="btn btn-secondary" onClick={handleLogoUpload}>Upload</button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                <input className="input" value={settings.company_name||''} onChange={(e)=>setSettings({...settings, company_name:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input className="input" value={settings.company_phone||''} onChange={(e)=>setSettings({...settings, company_phone:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input type="email" className="input" value={settings.company_email||''} onChange={(e)=>setSettings({...settings, company_email:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
                <input className="input" value={settings.company_website||''} onChange={(e)=>setSettings({...settings, company_website:e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                <textarea className="textarea" rows="3" value={settings.company_address||''} onChange={(e)=>setSettings({...settings, company_address:e.target.value})} />
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        )}

        {tab === 'email' && (
          <div className="card space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SMTP Host</label>
                <input className="input" value={settings.email_smtp_host||''} onChange={(e)=>setSettings({...settings, email_smtp_host:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SMTP Port</label>
                <input type="number" className="input" value={settings.email_smtp_port||''} onChange={(e)=>setSettings({...settings, email_smtp_port: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SMTP User</label>
                <input className="input" value={settings.email_smtp_user||''} onChange={(e)=>setSettings({...settings, email_smtp_user:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SMTP Password</label>
                <input type="password" className="input" value={settings.email_smtp_password||''} onChange={(e)=>setSettings({...settings, email_smtp_password:e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Use TLS/SSL</label>
                <select className="select" value={settings.email_smtp_secure? '1':'0'} onChange={(e)=>setSettings({...settings, email_smtp_secure: e.target.value==='1'})}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        )}

        {tab === 'ai' && (
          <div className="card space-y-6">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-4 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                Status: {settings.gemini_api_key ? <span className="text-green-600 dark:text-green-400 font-medium">Enabled</span> : <span className="text-red-600 dark:text-red-400 font-medium">Disabled</span>}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gemini API Key</label>
                <input className="input" value={settings.gemini_api_key||''} onChange={(e)=>setSettings({...settings, gemini_api_key:e.target.value})} placeholder="Enter API Key" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model (free text)</label>
                <input className="input" value={settings.gemini_model||'gemini-1.5-flash'} onChange={(e)=>setSettings({...settings, gemini_model:e.target.value})} placeholder="e.g., gemini-2.5-flash" />
                <p className="text-xs text-gray-500 mt-1">Examples: gemini-1.5-flash, gemini-1.5-pro, gemini-2.5-flash (if available in your account)</p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminSettings;
