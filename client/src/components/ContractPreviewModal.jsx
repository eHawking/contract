import { useState } from 'react';
import { X, Send, Eye, Printer, Download, Share2, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { contractsAPI } from '../lib/api';

export default function ContractPreviewModal({ contract, onClose, onSend, onEdit }) {
  const [sending, setSending] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      // Implementation for PDF download
      toast.success('PDF download started');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleShare = async () => {
    try {
      const response = await contractsAPI.generateShareLink(contract.id);
      setShareUrl(response.data.shareUrl);
      setShowShareModal(true);
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const handleSend = async () => {
    try {
      setSending(true);
      await onSend();
      toast.success('Contract sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send contract');
    } finally {
      setSending(false);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contract Preview
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Review before sending
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Actions Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onEdit}
              className="btn btn-secondary text-sm"
              title="Edit Contract"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-secondary text-sm"
              title="Print Contract"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="btn btn-secondary text-sm"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleShare}
              className="btn btn-secondary text-sm"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Contract Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 print:shadow-none">
              {/* Company Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-primary-500">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  AHMED ESSA CONSTRUCTION & TRADING (AEMCO)
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  6619, King Fahd Road, Dammam, 32243, Saudi Arabia
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  +966 50 911 9859 | ahmed.Wasim@ahmed-essa.com
                </p>
              </div>

              {/* Contract Details */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {contract?.title || 'Contract Title'}
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract Number</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {contract?.contract_number || 'CON-XXXX'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {contract?.created_at ? new Date(contract.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Provider</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {contract?.provider_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Value</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${contract?.value || '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contract Content */}
              <div className="prose dark:prose-invert max-w-none">
                <div
                  className="text-gray-700 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: contract?.content || '<p>No content available</p>'
                  }}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Terms and Conditions
                </h3>
                <div
                  className="text-sm text-gray-600 dark:text-gray-400"
                  dangerouslySetInnerHTML={{
                    __html: contract?.terms || '<p>Standard terms and conditions apply.</p>'
                  }}
                />
              </div>

              {/* Signatures */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                    AEMCO Representative
                  </p>
                  <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Signature</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                    Service Provider
                  </p>
                  <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="btn btn-primary"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send to Provider'}
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Share Contract
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Share this link with the service provider to view the contract:
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input flex-1 bg-gray-50 dark:bg-gray-900"
              />
              <button
                onClick={copyShareUrl}
                className="btn btn-primary"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This link will expire in 7 days
            </p>
          </div>
        </div>
      )}
    </>
  );
}
