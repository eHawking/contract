import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmDialog from '../../components/ConfirmDialog';
import { templatesAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, id: null });

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
        <PageHeader
          title="Contract Templates"
          subtitle="Manage contract templates"
          actions={(
            <Link to="/admin/templates/new" className="btn btn-primary">
              <Plus size={20} />
              <span>Create Template</span>
            </Link>
          )}
        />

        <div className="grid gap-6">
          {loading ? (
            <TableSkeleton />
          ) : templates.length === 0 ? (
            <EmptyState
              title="No templates found"
              subtitle="Create your first template to get started."
              action={<Link to="/admin/templates/new" className="btn btn-primary">Create Template</Link>}
            />
          ) : (
            templates.map((template) => (
              <div key={template.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{template.name}</h3>
                      <span className={`badge ${template.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                        {template.status}
                      </span>
                      {template.category && (
                        <span className="badge badge-info">{template.category}</span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{template.description}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
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
                      onClick={() => setConfirm({ open: true, id: template.id })}
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

        <ConfirmDialog
          open={confirm.open}
          onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
          title="Delete template?"
          description="This action cannot be undone. The template will be permanently removed."
          confirmText="Delete"
          variant="danger"
          onConfirm={async () => {
            if (!confirm.id) return;
            try {
              await handleDelete(confirm.id);
            } finally {
              setConfirm({ open: false, id: null });
            }
          }}
        />
      </div>
    </Layout>
  );
}

export default AdminTemplates;
