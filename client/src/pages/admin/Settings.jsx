import { useState, useEffect } from 'react';
import { settingsAPI } from '../../lib/api';
import { toast } from 'sonner';
import { Save, Upload, Sparkles, Building2, Mail, Lock, Key } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      setSettings(response.data);
      if (response.data.company_logo) {
        setLogoPreview(response.data.company_logo);
      }
    } catch (error) {
      toast.error('Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload logo first if changed
      if (logoFile) {
        const logoResponse = await settingsAPI.uploadLogo(logoFile);
        settings.company_logo = logoResponse.data.filePath;
      }

      // Save all settings
      await settingsAPI.update(settings);
      toast.success('Settings saved successfully');
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Details', icon: Building2 },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'ai', label: 'AI Settings', icon: Sparkles }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Company Details Tab */}
      {activeTab === 'company' && (
        <div className="card space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Company Information</h2>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="w-32 h-32 object-contain border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700"
                />
              )}
              <div>
                <label className="btn btn-secondary cursor-pointer flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  PNG, JPG, SVG up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={settings.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
              className="input"
              placeholder="Company Name"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <textarea
              value={settings.company_address || ''}
              onChange={(e) => handleChange('company_address', e.target.value)}
              className="input"
              rows={3}
              placeholder="Company Address"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={settings.company_phone || ''}
              onChange={(e) => handleChange('company_phone', e.target.value)}
              className="input"
              placeholder="+966 50 911 9859"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.company_email || ''}
              onChange={(e) => handleChange('company_email', e.target.value)}
              className="input"
              placeholder="company@example.com"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={settings.company_website || ''}
              onChange={(e) => handleChange('company_website', e.target.value)}
              className="input"
              placeholder="www.example.com"
            />
          </div>
        </div>
      )}

      {/* Email Settings Tab */}
      {activeTab === 'email' && (
        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Configuration</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Configure SMTP settings for sending email notifications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SMTP Host */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.smtp_host || ''}
                onChange={(e) => handleChange('smtp_host', e.target.value)}
                className="input"
                placeholder="mail.example.com"
              />
            </div>

            {/* SMTP Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtp_port || '587'}
                onChange={(e) => handleChange('smtp_port', e.target.value)}
                className="input"
                placeholder="587"
              />
            </div>

            {/* SMTP User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                value={settings.smtp_user || ''}
                onChange={(e) => handleChange('smtp_user', e.target.value)}
                className="input"
                placeholder="username"
              />
            </div>

            {/* SMTP Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                value={settings.smtp_password || ''}
                onChange={(e) => handleChange('smtp_password', e.target.value)}
                className="input"
                placeholder="Enter password to change"
              />
            </div>

            {/* From Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={settings.smtp_from_name || ''}
                onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                className="input"
                placeholder="AEMCO Contract Builder"
              />
            </div>

            {/* From Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={settings.smtp_from_email || ''}
                onChange={(e) => handleChange('smtp_from_email', e.target.value)}
                className="input"
                placeholder="noreply@example.com"
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Settings Tab */}
      {activeTab === 'ai' && (
        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              AI Content Generation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Configure Google Gemini AI for automatic contract and template content generation
            </p>
          </div>

          {/* Enable AI */}
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Enable AI Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use AI to generate contract content automatically
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.ai_enabled === 'true'}
                onChange={(e) => handleChange('ai_enabled', e.target.checked ? 'true' : 'false')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 dark:peer-checked:bg-purple-500"></div>
            </label>
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={settings.gemini_api_key || ''}
              onChange={(e) => handleChange('gemini_api_key', e.target.value)}
              className="input"
              placeholder="Enter your Gemini API key"
            />
            <p className="text-sm text-gray-500 mt-2">
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gemini Model
            </label>
            <select
              value={settings.gemini_model || 'gemini-1.5-pro-latest'}
              onChange={(e) => handleChange('gemini_model', e.target.value)}
              className="input"
            >
              <option value="gemini-1.5-pro-latest">Gemini 1.5 Pro (Latest)</option>
              <option value="gemini-1.5-flash-latest">Gemini 1.5 Flash (Latest)</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Pro model for best quality, Flash for faster responses
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>AI will help generate professional contract content</li>
              <li>Automatically fill templates with relevant clauses</li>
              <li>Suggest improvements to contract language</li>
              <li>Generate content based on contract type and details</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
