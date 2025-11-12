import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { usersAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, action: null, user: null });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await usersAPI.getAll({ role: 'provider' });
      setUsers(data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await usersAPI.approve(id);
      toast.success('User approved successfully');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve user');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await usersAPI.update(id, { status });
      toast.success('Status updated successfully');
      loadUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Service Providers"
          subtitle="Manage service provider accounts"
          actions={(
            <Link to="/admin/users/new" className="btn btn-primary">
              <Plus size={20} />
              <span>Add Provider</span>
            </Link>
          )}
        />

        <div className="card">
          <DataTable
            columns={[
              { header: 'Company', key: 'company_name', cellClassName: 'font-medium' },
              { header: 'Name', key: 'name' },
              { header: 'Email', key: 'email', cellClassName: 'text-sm' },
              { header: 'Phone', key: 'phone', cellClassName: 'text-sm' },
              { header: 'Status', key: 'status', render: (u) => (<StatusBadge status={u.status} />) },
              { header: 'Actions', key: 'actions', render: (u) => (
                <div className="flex gap-2">
                  {u.status === 'pending' && (
                    <button
                      onClick={() => setConfirm({ open: true, action: 'approve', user: u })}
                      className="text-green-600 hover:text-green-700"
                      title="Approve"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  {u.status === 'active' && (
                    <button
                      onClick={() => setConfirm({ open: true, action: 'deactivate', user: u })}
                      className="text-red-600 hover:text-red-700"
                      title="Deactivate"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                  {u.status === 'inactive' && (
                    <button
                      onClick={() => setConfirm({ open: true, action: 'activate', user: u })}
                      className="text-green-600 hover:text-green-700"
                      title="Activate"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              ) }
            ]}
            data={users}
            rowKey="id"
            loading={loading}
            empty={{
              title: 'No service providers found',
              subtitle: 'Add your first provider to get started.',
              action: (<Link to="/admin/users/new" className="btn btn-primary">Add Provider</Link>)
            }}
            maxHeight="28rem"
          />
        </div>

        <ConfirmDialog
          open={confirm.open}
          onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}
          title={confirm.action === 'approve' ? 'Approve provider?' : confirm.action === 'deactivate' ? 'Deactivate provider?' : 'Activate provider?'}
          description={
            confirm.action === 'approve' ? 'This will allow the provider to access the system.' :
            confirm.action === 'deactivate' ? 'The provider will be unable to log in until reactivated.' :
            'The provider will regain access to the system.'
          }
          confirmText={confirm.action === 'approve' ? 'Approve' : confirm.action === 'deactivate' ? 'Deactivate' : 'Activate'}
          variant={confirm.action === 'deactivate' ? 'danger' : 'primary'}
          onConfirm={async () => {
            try {
              if (!confirm.user) return;
              if (confirm.action === 'approve') await handleApprove(confirm.user.id);
              if (confirm.action === 'deactivate') await handleStatusChange(confirm.user.id, 'inactive');
              if (confirm.action === 'activate') await handleStatusChange(confirm.user.id, 'active');
            } finally {
              setConfirm({ open: false, action: null, user: null });
            }
          }}
        />
      </div>
    </Layout>
  );
}

export default AdminUsers;
