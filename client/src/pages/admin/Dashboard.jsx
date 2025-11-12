import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, FileStack, TrendingUp, Plus, Clock, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { StatCardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { contractsAPI, usersAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    pendingContracts: 0,
    totalProviders: 0
  });
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [contractsRes, usersRes] = await Promise.all([
        contractsAPI.getAll(),
        usersAPI.getAll({ role: 'provider' })
      ]);

      const contracts = contractsRes.data.contracts;
      
      setStats({
        totalContracts: contracts.length,
        activeContracts: contracts.filter(c => ['signed', 'active'].includes(c.status)).length,
        pendingContracts: contracts.filter(c => c.status === 'sent').length,
        totalProviders: usersRes.data.users.length
      });

      setRecentContracts(contracts.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Contracts',
      value: stats.totalContracts,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/contracts'
    },
    {
      title: 'Active Contracts',
      value: stats.activeContracts,
      icon: CheckCircle,
      color: 'bg-green-500',
      link: '/admin/contracts?status=active'
    },
    {
      title: 'Pending Signatures',
      value: stats.pendingContracts,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/admin/contracts?status=sent'
    },
    {
      title: 'Service Providers',
      value: stats.totalProviders,
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/users'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader title="Dashboard" subtitle="Welcome back! Here's your contract overview." />

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Link to="/admin/contracts/new" className="btn btn-primary">
            <Plus size={20} />
            <span>Create Contract</span>
          </Link>
          <Link to="/admin/templates/new" className="btn btn-outline">
            <FileStack size={20} />
            <span>New Template</span>
          </Link>
          <Link to="/admin/users/new" className="btn btn-secondary">
            <Users size={20} />
            <span>Add Provider</span>
          </Link>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.title} to={stat.link} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Recent Contracts */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Contracts</h2>
            <Link to="/admin/contracts" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : recentContracts.length === 0 ? (
            <EmptyState title="No contracts yet" subtitle="Create a contract to get started." action={<Link to="/admin/contracts/new" className="btn btn-primary">Create Contract</Link>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Contract #</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Provider</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContracts.map((contract) => (
                    <tr key={contract.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="py-3 px-4">
                        <Link 
                          to={`/admin/contracts/${contract.id}/edit`} 
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {contract.contract_number}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-sm">{contract.provider_company || contract.provider_name}</td>
                      <td className="py-3 px-4 text-sm">{contract.title}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${
                          contract.status === 'signed' || contract.status === 'active' ? 'badge-success' :
                          contract.status === 'sent' ? 'badge-info' :
                          contract.status === 'draft' ? 'badge-gray' :
                          'badge-warning'
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(contract.created_at).toLocaleDateString()}
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

export default AdminDashboard;
