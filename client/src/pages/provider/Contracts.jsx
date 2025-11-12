import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { providerAPI } from '../../lib/api';
import { toast } from 'sonner';

function ProviderContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadContracts();
  }, [statusFilter]);

  const loadContracts = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const { data } = await providerAPI.getContracts(params);
      setContracts(data.contracts);
    } catch (err) {
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract =>
    search === '' ||
    contract.contract_number.toLowerCase().includes(search.toLowerCase()) ||
    contract.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader title="My Contracts" subtitle="View and manage your contracts" />

        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search contracts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select md:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="sent">Pending</option>
              <option value="signed">Signed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="card">
          <DataTable
            columns={[
              { header: 'Contract #', key: 'contract_number', render: (c) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">{c.contract_number}</span>
              ) },
              { header: 'Title', key: 'title' },
              { header: 'Amount', key: 'amount', render: (c) => (c.amount ? `${c.amount.toLocaleString()} ${c.currency}` : '-'), cellClassName: 'text-sm' },
              { header: 'Period', key: 'period', render: (c) => (
                c.start_date && c.end_date ? `${new Date(c.start_date).toLocaleDateString()} - ${new Date(c.end_date).toLocaleDateString()}` : '-'
              ), cellClassName: 'text-sm' },
              { header: 'Status', key: 'status', render: (c) => (<StatusBadge status={c.status} />) },
              { header: 'Actions', key: 'actions', render: (c) => (
                <Link 
                  to={`/provider/contracts/${c.id}`} 
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View →
                </Link>
              ) }
            ]}
            data={filteredContracts}
            rowKey="id"
            loading={loading}
            empty={{
              title: 'No contracts found',
              subtitle: "You don't have any contracts assigned.",
            }}
            maxHeight="28rem"
          />
        </div>
      </div>
    </Layout>
  );
}

export default ProviderContracts;
