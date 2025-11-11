import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { templatesAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data } = await templatesAPI.getAll();
      setTemplates(data.templates);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await templatesAPI.delete(id);
      toast.success('Template deleted successfully');
      loadTemplates();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete template');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Templates</h1>
            <p className="text-gray-600">Manage contract templates</p>
          </div>
          <Link to="/admin/templates/new" className="btn btn-primary">
            <Plus size={20} />
            <span>Create Template</span>
          </Link>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : templates.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">No templates found</p>
              <Link to="/admin/templates/new" className="btn btn-primary">
                Create Your First Template
              </Link>
            </div>
          ) : (
            templates.map((template) => (
              <div key={template.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <span className={`badge ${template.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                        {template.status}
                      </span>
                      {template.category && (
                        <span className="badge badge-info">{template.category}</span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      to={`/admin/templates/${template.id}/edit`} 
                      className="btn btn-secondary"
                    >
                      <Edit size={18} />
                      <span>Edit</span>
                    </Link>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="btn btn-danger"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminTemplates;
