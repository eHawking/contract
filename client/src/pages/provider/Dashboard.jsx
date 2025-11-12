import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, DollarSign } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import { StatCardSkeleton, TableSkeleton } from '../../components/Skeleton';
import { providerAPI } from '../../lib/api';
import { toast } from 'sonner';

function ProviderDashboard() {
  const [stats, setStats] = useState({
    total_contracts: 0,
    pending_contracts: 0,
    active_contracts: 0,
    total_value: 0
  });
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, contractsRes] = await Promise.all([
        providerAPI.getStats(),
        providerAPI.getContracts()
      ]);

      setStats(statsRes.data.stats);
      setContracts(contractsRes.data.contracts.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Contracts',
      value: stats.total_contracts,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Signatures',
      value: stats.pending_contracts,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Active Contracts',
      value: stats.active_contracts,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Total Value',
      value: `${stats.total_value.toLocaleString()} SAR`,
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Dashboard" subtitle="Welcome to your contract management portal" />

        {loading ? (
          <StatCardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                      <Icon size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Contracts</h2>
            <Link to="/provider/contracts" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : contracts.length === 0 ? (
            <EmptyState title="No contracts yet" subtitle="You don't have any contracts assigned." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Contract #</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="py-3 px-4">
                        <Link 
                          to={`/provider/contracts/${contract.id}`} 
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {contract.contract_number}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{contract.title}</td>
                      <td className="py-3 px-4 text-sm">
                        {contract.amount ? `${contract.amount.toLocaleString()} ${contract.currency}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge ${
                          contract.status === 'signed' || contract.status === 'active' ? 'badge-success' :
                          contract.status === 'sent' ? 'badge-warning' :
                          'badge-gray'
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

export default ProviderDashboard;
