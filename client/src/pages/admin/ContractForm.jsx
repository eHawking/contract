import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Send, Loader2, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import { contractsAPI, templatesAPI, usersAPI, aiAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminContractForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [templates, setTemplates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReq, setAiReq] = useState({ requirements: '' });
  const [formData, setFormData] = useState({
    provider_id: '',
    template_id: '',
    title: '',
    content: '',
    start_date: '',
    end_date: '',
    amount: '',
    currency: 'SAR',
    notes: ''
  });

  useEffect(() => {
    loadOptions();
    if (isEdit) loadContract();
  }, [id]);

  const loadOptions = async () => {
    try {
      const [templatesRes, providersRes] = await Promise.all([
        templatesAPI.getAll({ status: 'active' }),
        usersAPI.getAll({ role: 'provider', status: 'active' })
      ]);
      setTemplates(templatesRes.data.templates);
      setProviders(providersRes.data.users);
    } catch (err) {
      toast.error('Failed to load options');
    }
  };

  const handleAIContract = async () => {
    setAiLoading(true);
    try {
      const variables = {
        provider_name: providers.find(p => p.id === Number(formData.provider_id))?.name,
        provider_company: providers.find(p => p.id === Number(formData.provider_id))?.company_name,
        amount: formData.amount,
        start_date: formData.start_date,
        end_date: formData.end_date,
        currency: formData.currency,
        title: formData.title
      };
      const templateSummary = templates.find(t => t.id === Number(formData.template_id))?.description || '';
      const { data } = await aiAPI.generateContract({ templateSummary, variables, requirements: aiReq.requirements });
      setFormData(fd => ({ ...fd, content: data.content || fd.content }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const loadContract = async () => {
    try {
      const { data } = await contractsAPI.getById(id);
      setFormData({
        provider_id: data.contract.provider_id,
        template_id: data.contract.template_id || '',
        title: data.contract.title,
        content: data.contract.content,
        start_date: data.contract.start_date || '',
        end_date: data.contract.end_date || '',
        amount: data.contract.amount || '',
        currency: data.contract.currency || 'SAR',
        notes: data.contract.notes || ''
      });
    } catch (err) {
      toast.error('Failed to load contract');
      navigate('/admin/contracts');
    } finally {
      setLoadingData(false);
    }
  };

  const handleTemplateChange = async (templateId) => {
    if (!templateId) {
      setFormData({ ...formData, template_id: '', content: '' });
      return;
    }

    try {
      const { data } = await templatesAPI.getById(templateId);
      setFormData({
        ...formData,
        template_id: templateId,
        content: data.template.content,
        title: formData.title || data.template.name
      });
      toast.success('Template loaded');
    } catch (err) {
      toast.error('Failed to load template');
    }
  };

  const handleSubmit = async (e, sendToProvider = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await contractsAPI.update(id, formData);
        if (sendToProvider) {
          await contractsAPI.send(id);
          toast.success('Contract updated and sent to provider');
        } else {
          toast.success('Contract updated successfully');
        }
      } else {
        const { data } = await contractsAPI.create(formData);
        if (sendToProvider) {
          await contractsAPI.send(data.contract.id);
          toast.success('Contract created and sent to provider');
        } else {
          toast.success('Contract created successfully');
        }
      }
      navigate('/admin/contracts');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save contract');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEdit ? 'Edit Contract' : 'Create New Contract'}
        </h1>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Provider *
                </label>
                <select
                  required
                  className="select"
                  value={formData.provider_id}
                  onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                >
                  <option value="">Select Provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.company_name} - {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template (Optional)
                </label>
                <select
                  className="select"
                  value={formData.template_id}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="">Select Template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Title *
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="input"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (SAR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Content *</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Assist (optional)</label>
              <div className="grid md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    className="input"
                    placeholder="Extra requirements or details to include..."
                    value={aiReq.requirements}
                    onChange={(e)=>setAiReq({ requirements: e.target.value })}
                  />
                </div>
                <button type="button" className="btn btn-secondary" disabled={aiLoading} onClick={handleAIContract}>
                  {aiLoading ? <Loader2 size={20} className="animate-spin" /> : 'Generate with AI'}
                </button>
              </div>
            </div>
            <textarea
              required
              className="textarea font-mono text-sm"
              rows="20"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter contract content (supports HTML)..."
            />
            <p className="text-sm text-gray-500 mt-2">
              You can use HTML formatting in the content
            </p>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes (Internal)</h2>
            <textarea
              className="textarea"
              rows="4"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Internal notes (not visible to provider)..."
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              <span>Save as Draft</span>
            </button>
            
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e, true)}
              className="btn btn-outline"
            >
              <Send size={20} />
              <span>Save & Send to Provider</span>
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AdminContractForm;
