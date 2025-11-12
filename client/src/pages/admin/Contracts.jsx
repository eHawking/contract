import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import { contractsAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminContracts() {
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
      
      const { data } = await contractsAPI.getAll(params);
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
    contract.title.toLowerCase().includes(search.toLowerCase()) ||
    contract.provider_company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Contracts"
          subtitle="Manage all contracts"
          actions={(
            <Link to="/admin/contracts/new" className="btn btn-primary">
              <Plus size={20} />
              <span>Create Contract</span>
            </Link>
          )}
        />

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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="signed">Signed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="card">
          <DataTable
            columns={[
              { header: 'Contract #', key: 'contract_number', render: (c) => (
                <Link to={`/admin/contracts/${c.id}/edit`} className="text-primary-600 hover:text-primary-700 font-medium">{c.contract_number}</Link>
              ) },
              { header: 'Title', key: 'title' },
              { header: 'Provider', key: 'provider', render: (c) => (c.provider_company || c.provider_name), cellClassName: 'text-sm' },
              { header: 'Amount', key: 'amount', render: (c) => (c.amount ? `${c.amount.toLocaleString()} ${c.currency}` : '-'), cellClassName: 'text-sm' },
              { header: 'Status', key: 'status', render: (c) => (<StatusBadge status={c.status} />) },
              { header: 'Date', key: 'created_at', render: (c) => new Date(c.created_at).toLocaleDateString(), cellClassName: 'text-sm text-gray-600 dark:text-gray-400' }
            ]}
            data={filteredContracts}
            rowKey="id"
            loading={loading}
            empty={{
              title: 'No contracts found',
              subtitle: 'Create your first contract to get started.',
              action: (<Link to="/admin/contracts/new" className="btn btn-primary">Create Contract</Link>)
            }}
            maxHeight="28rem"
          />
        </div>
      </div>
    </Layout>
  );
}

export default AdminContracts;
