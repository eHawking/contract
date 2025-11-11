import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { usersAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Providers</h1>
            <p className="text-gray-600">Manage service provider accounts</p>
          </div>
          <Link to="/admin/users/new" className="btn btn-primary">
            <Plus size={20} />
            <span>Add Provider</span>
          </Link>
        </div>

        <div className="card">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No service providers found</p>
              <Link to="/admin/users/new" className="btn btn-primary">
                Add First Provider
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Company</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{user.company_name}</td>
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4 text-sm">{user.email}</td>
                      <td className="py-3 px-4 text-sm">{user.phone}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {user.status === 'pending' && (
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <CheckCircle size={20} />
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'inactive')}
                              className="text-red-600 hover:text-red-700"
                              title="Deactivate"
                            >
                              <XCircle size={20} />
                            </button>
                          )}
                          {user.status === 'inactive' && (
                            <button
                              onClick={() => handleStatusChange(user.id, 'active')}
                              className="text-green-600 hover:text-green-700"
                              title="Activate"
                            >
                              <CheckCircle size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminUsers;
