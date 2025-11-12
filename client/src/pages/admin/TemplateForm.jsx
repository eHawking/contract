import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { templatesAPI, aiAPI } from '../../lib/api';
import { toast } from 'sonner';

function AdminTemplateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [aiLoading, setAiLoading] = useState(false);
  const [ai, setAi] = useState({
    description: '',
    placeholders: '',
    tone: 'professional',
    language: 'English'
  });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    content: '',
    status: 'active'
  });

  useEffect(() => {
    if (isEdit) loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      const { data } = await templatesAPI.getById(id);
      setFormData({
        name: data.template.name,
        description: data.template.description || '',
        category: data.template.category || '',
        content: data.template.content,
        status: data.template.status
      });
    } catch (err) {
      toast.error('Failed to load template');
      navigate('/admin/templates');
    } finally {
      setLoadingData(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!ai.description || ai.description.length < 10) {
      return toast.error('Enter a short description (min 10 chars)');
    }
    setAiLoading(true);
    try {
      const placeholders = ai.placeholders
        ? ai.placeholders.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const { data } = await aiAPI.generateTemplate({
        description: ai.description,
        placeholders,
        tone: ai.tone,
        language: ai.language
      });
      setFormData(fd => ({ ...fd, content: data.content || fd.content }));
      toast.success('Template content generated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await templatesAPI.update(id, formData);
        toast.success('Template updated successfully');
      } else {
        await templatesAPI.create(formData);
        toast.success('Template created successfully');
      }
      navigate('/admin/templates');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save template');
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

        <PageHeader title={isEdit ? 'Edit Template' : 'Create New Template'} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Service, Construction, Supply"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="textarea"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the template..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Template Content *</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Generation
              </label>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="textarea"
                    rows="3"
                    value={ai.description}
                    onChange={(e) => setAi({ ...ai, description: e.target.value })}
                    placeholder="Enter a short description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placeholders (comma separated)
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={ai.placeholders}
                    onChange={(e) => setAi({ ...ai, placeholders: e.target.value })}
                    placeholder="e.g., provider_name, amount, start_date"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={aiLoading}
                className="btn btn-secondary"
                onClick={handleGenerateAI}
              >
                {aiLoading ? <Loader2 size={20} className="animate-spin" /> : 'Generate'}
              </button>
            </div>
            <textarea
              required
              className="textarea font-mono text-sm"
              rows="20"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter template content (supports HTML)..."
            />
            <p className="text-sm text-gray-500 mt-2">
              You can use placeholders like {'{{provider_name}}, {{amount}}, {{start_date}}'} etc.
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>{isEdit ? 'Update Template' : 'Create Template'}</span>
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default AdminTemplateForm;
