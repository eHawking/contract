import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, Printer, Share2, Edit3, Loader2 } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { contractsAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminContractView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const { data } = await contractsAPI.getById(id);
      setContract(data.contract);
    } catch (err) {
      toast.error('Failed to load contract');
      navigate('/admin/contracts');
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = useMemo(() => `${window.location.origin}/admin/contracts/${id}/view`, [id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleOpenPdf = async () => {
    try {
      setDownloading(true);
      const { data } = await contractsAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Failed to open PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const { data } = await contractsAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${contract.contract_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) return;
      const styles = `
        <style>
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Helvetica, Arial; color: #111827; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          .meta { color: #6B7280; font-size: 12px; margin-bottom: 16px; }
          .content { border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; }
        </style>
      `;
      const html = `
        <html>
          <head><title>Contract ${contract?.contract_number}</title>${styles}</head>
          <body>
            <h1>${contract?.title || ''}</h1>
            <div class="meta">Contract # ${contract?.contract_number || ''}</div>
            <div class="content">${contract?.content || ''}</div>
            <script>window.onload = () => { window.focus(); window.print(); }</script>
          </body>
        </html>`;
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch {
      toast.error('Print failed');
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
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-4">
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <PageHeader
          title={contract.title}
          subtitle={`Contract # ${contract.contract_number}`}
          actions={(
            <div className="flex flex-wrap gap-2">
              <Link to={`/admin/contracts/${id}/edit`} className="btn btn-outline">
                <Edit3 size={16} />
                <span>Edit</span>
              </Link>
              <button onClick={handlePrint} className="btn btn-secondary">
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button onClick={handleOpenPdf} className="btn btn-secondary" disabled={downloading}>
                <ExternalLink size={16} />
                <span>View PDF</span>
              </button>
              <button onClick={handleDownloadPdf} className="btn btn-primary" disabled={downloading}>
                <Download size={16} />
                <span>Download PDF</span>
              </button>
              <button onClick={handleCopyLink} className="btn btn-outline">
                <Share2 size={16} />
                <span>Copy Link</span>
              </button>
            </div>
          )}
        />

        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Provider: {contract.provider_company || contract.provider_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Period: {contract.start_date && contract.end_date ? `${new Date(contract.start_date).toLocaleDateString()} - ${new Date(contract.end_date).toLocaleDateString()}` : 'Not specified'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Value: {contract.amount ? `${contract.amount.toLocaleString()} ${contract.currency}` : 'Not specified'}</p>
            </div>
            <StatusBadge status={contract.status} />
          </div>

          <div className="prose max-w-none">
            <div
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900"
              dangerouslySetInnerHTML={{ __html: contract.content }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AdminContractView;
