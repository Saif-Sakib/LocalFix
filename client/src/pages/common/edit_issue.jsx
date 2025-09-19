import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import '../../styles/common/edit_issue.css';

const EditIssueModal = ({ isOpen, onClose, issueId, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
  });

  useEffect(() => {
    if (!isOpen || !issueId) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/issues/${issueId}`);
        const issue = res.data?.issue || {};
        setForm({
          title: issue.TITLE || '',
          description: issue.DESCRIPTION || '',
          category: issue.CATEGORY || '',
          priority: (issue.PRIORITY || 'medium').toLowerCase(),
        });
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load issue');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [isOpen, issueId]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await axios.put(`/api/issues/${issueId}`, {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
      });
      if (onUpdated) onUpdated();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="edit-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Edit issue dialog">
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h3>Edit Issue</h3>
          <button className="edit-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form className="edit-form" onSubmit={onSubmit}>
          {error && <div className="edit-error">{error}</div>}
          {loading ? (
            <div className="edit-loading">Loading…</div>
          ) : (
            <>
              <div className="edit-field">
                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={onChange} required />
              </div>
              <div className="edit-field">
                <label htmlFor="category">Category</label>
                <input id="category" name="category" value={form.category} onChange={onChange} required />
              </div>
              <div className="edit-field">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" value={form.priority} onChange={onChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="edit-field">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={6} value={form.description} onChange={onChange} />
              </div>
              <div className="edit-actions">
                <button type="button" className="edit-btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="edit-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditIssueModal;
