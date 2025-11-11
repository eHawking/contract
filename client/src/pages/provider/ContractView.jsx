import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, X, Download, Loader2 } from 'lucide-react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import { providerAPI } from '../../lib/api';
import { toast } from 'sonner';

function ProviderContractView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    loadContract();
  }, [id]);

  const loadContract = async () => {
    try {
      const { data } = await providerAPI.getContract(id);
      setContract(data.contract);
    } catch (err) {
      toast.error('Failed to load contract');
      navigate('/provider/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!confirm('Are you sure you want to sign this contract? This action cannot be undone.')) return;
    
    setSigning(true);
    try {
      await providerAPI.signContract(id);
      toast.success('Contract signed successfully');
      loadContract();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejecting this contract:');
    if (!reason) return;
    
    try {
      await providerAPI.rejectContract(id, reason);
      toast.success('Contract rejected');
      navigate('/provider/contracts');
    } catch (err) {
      toast.error('Failed to reject contract');
    }
  };

  const handleDownload = async () => {
    try {
      const { data } = await providerAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${contract.contract_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download contract');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-6">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{contract.title}</h1>
              <p className="text-gray-600">Contract # {contract.contract_number}</p>
            </div>
            <StatusBadge status={contract.status} />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Contract Period</p>
              <p className="font-medium">
                {contract.start_date && contract.end_date ? (
                  <>
                    {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                  </>
                ) : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Contract Value</p>
              <p className="font-medium">
                {contract.amount ? `${contract.amount.toLocaleString()} ${contract.currency}` : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Signed Date</p>
              <p className="font-medium">
                {contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : 'Not signed yet'}
              </p>
            </div>
          </div>

          {contract.status === 'sent' && (
            <div className="flex gap-4">
              <button
                onClick={handleSign}
                disabled={signing}
                className="btn btn-primary"
              >
                {signing ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                <span>Sign Contract</span>
              </button>
              <button onClick={handleReject} className="btn btn-danger">
                <X size={20} />
                <span>Reject</span>
              </button>
            </div>
          )}

          {contract.signed_by_provider && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle size={20} />
                <span className="font-medium">Contract Signed</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You signed this contract on {new Date(contract.signed_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Contract Details</h2>
            <button onClick={handleDownload} className="btn btn-secondary">
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>

          <div className="prose max-w-none">
            <div 
              className="border border-gray-200 rounded-lg p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: contract.content }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProviderContractView;
