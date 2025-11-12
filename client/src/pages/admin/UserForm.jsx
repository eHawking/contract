import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { usersAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminUserForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    phone: '',
    address: '',
    commercial_registration: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usersAPI.create(formData);
      toast.success('Provider created successfully');
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-6">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <PageHeader title="Add Service Provider" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  className="input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password * (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commercial Registration</label>
                <input
                  type="text"
                  className="input"
                  value={formData.commercial_registration}
                  onChange={(e) => setFormData({ ...formData, commercial_registration: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                <textarea
                  required
                  className="textarea"
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Create Provider</span>
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default AdminUserForm;
