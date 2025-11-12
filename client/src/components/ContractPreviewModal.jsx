import React from 'react';
import { X, Download, Printer, Eye, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const ContractPreviewModal = ({ contract, isOpen, onClose, onSign, onDownload, onPrint }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !contract) return null;

  const shareUrl = `${window.location.origin}/contract/${contract.id}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Contract URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handlePrint = () => {
    window.print();
    if (onPrint) onPrint();
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Default download behavior
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(contract, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `contract-${contract.id}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="contract-preview w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="contract-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Contract Preview</h2>
              <p className="text-white/80 text-sm">Contract #{contract.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-white/80 p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="contract-content">
          {/* Contract Details */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{contract.title}</h3>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Contract Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID:</span> #{contract.id}</p>
                  <p><span className="font-medium">Status:</span>
                    <span className={`ml-2 badge ${
                      contract.status === 'signed' ? 'badge-success' :
                      contract.status === 'sent' ? 'badge-info' :
                      contract.status === 'draft' ? 'badge-pending' :
                      'badge-warning'
                    }`}>
                      {contract.status?.charAt(0).toUpperCase() + contract.status?.slice(1)}
                    </span>
                  </p>
                  <p><span className="font-medium">Created:</span> {new Date(contract.created_at).toLocaleDateString()}</p>
                  {contract.sent_date && (
                    <p><span className="font-medium">Sent:</span> {new Date(contract.sent_date).toLocaleDateString()}</p>
                  )}
                  {contract.signed_date && (
                    <p><span className="font-medium">Signed:</span> {new Date(contract.signed_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Parties Involved</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Client:</span> {contract.client_name}</p>
                  <p><span className="font-medium">Provider:</span> {contract.provider_name}</p>
                  {contract.provider_email && (
                    <p><span className="font-medium">Email:</span> {contract.provider_email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Content */}
          <div className="prose prose-gray max-w-none">
            <div className="bg-gray-50 p-6 rounded-lg border">
              {contract.content ? (
                <div dangerouslySetInnerHTML={{ __html: contract.content.replace(/\n/g, '<br>') }} />
              ) : (
                <div className="text-gray-500 italic">
                  Contract content will be displayed here once created.
                </div>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          {contract.terms && (
            <div className="mt-8">
              <h4 className="font-semibold text-gray-700 mb-3">Terms & Conditions</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div dangerouslySetInnerHTML={{ __html: contract.terms.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          )}

          {/* Signature Section */}
          {contract.status === 'signed' && contract.signature && (
            <div className="mt-8">
              <h4 className="font-semibold text-gray-700 mb-3">Digital Signature</h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 mb-2">
                  <Check size={16} className="inline mr-1" />
                  Signed by {contract.provider_name} on {new Date(contract.signed_date).toLocaleString()}
                </p>
                <div className="border-t pt-2">
                  <p className="text-xs text-gray-600">Signature: {contract.signature}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="contract-actions">
          <div className="flex flex-wrap gap-2">
            {/* Share URL */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Share:</span>
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="text-xs bg-gray-100 px-2 py-1 rounded border flex-1 min-w-0"
              />
              <button
                onClick={handleCopyUrl}
                className="btn btn-sm btn-ghost flex items-center gap-1"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              {/* Preview */}
              <button className="btn btn-sm btn-outline flex items-center gap-1">
                <Eye size={14} />
                Preview
              </button>

              {/* Print */}
              <button onClick={handlePrint} className="btn btn-sm btn-outline flex items-center gap-1">
                <Printer size={14} />
                Print
              </button>

              {/* Download */}
              <button onClick={handleDownload} className="btn btn-sm btn-outline flex items-center gap-1">
                <Download size={14} />
                Download PDF
              </button>

              {/* Sign (only for providers) */}
              {contract.status === 'sent' && onSign && (
                <button onClick={onSign} className="btn btn-sm btn-success flex items-center gap-1">
                  Sign Contract
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreviewModal;
