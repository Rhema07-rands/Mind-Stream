import React, { useState } from 'react';
import { Upload as UploadIcon, AlertCircle, FileUp, Loader2, FolderUp, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Upload.css';

const UploadResource = () => {
  const { user } = useAuth();

  // ---- Single Upload State ----
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'document',
    course_code: '',
    academic_session: '2024/2025',
    semester: 'First',
    exam_type: ''
  });
  const [file, setFile] = useState(null);

  // ---- Bulk Upload State ----
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState([]);
  const [autoAssign, setAutoAssign] = useState(true);
  const [bulkForm, setBulkForm] = useState({
    resource_type: 'document',
    course_code: '',
    academic_session: '2024/2025',
    semester: 'First',
    exam_type: ''
  });

  // ---- Single Upload Handlers ----
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!file) {
      setErrorMsg("Please select a file to upload.");
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('resource_type', formData.resource_type);
    data.append('course_code', formData.course_code);
    data.append('academic_session', formData.academic_session);
    data.append('semester', formData.semester);

    if (formData.resource_type === 'past_question') {
      if (!formData.exam_type) {
        setErrorMsg("Exam type is required for past questions.");
        setLoading(false);
        return;
      }
      data.append('exam_type', formData.exam_type);
    }

    try {
      const res = await api.post('/resources', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.uploaded_count) {
        setSuccessMsg(`ZIP extracted! ${res.data.uploaded_count} file(s) uploaded successfully.${res.data.skipped_count > 0 ? ` ${res.data.skipped_count} unsupported file(s) skipped.` : ''}`);
      } else {
        setSuccessMsg("Resource uploaded successfully!");
      }
      setFormData({ ...formData, title: '', description: '' });
      setFile(null);
      document.getElementById('file-upload').value = '';
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to upload resource.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Bulk Upload Handlers ----
  const handleBulkFilesChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setBulkFiles(Array.from(e.target.files));
      setBulkResults([]);
    }
  };

  const extractCourseCode = (filename) => {
    const base = filename.replace(/\.[^.]+$/, '');
    const match = base.match(/^([A-Za-z]+\s*\d{3})/);
    return match ? match[1].replace(/\s+/g, '').toUpperCase() : base.split('-')[0].trim().toUpperCase();
  };

  const getFileTitle = (filename) => {
    const base = filename.replace(/\.[^.]+$/, '');
    return base.replace(/[_-]/g, ' ');
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (bulkFiles.length === 0) return;
    if (!autoAssign && !bulkForm.course_code.trim()) return;

    setBulkLoading(true);
    setBulkResults([]);
    const results = [];

    for (const f of bulkFiles) {
      const courseCode = autoAssign ? extractCourseCode(f.name) : bulkForm.course_code.trim().toUpperCase();
      const title = autoAssign ? courseCode : getFileTitle(f.name);
      const data = new FormData();
      data.append('file', f);
      data.append('title', title);
      data.append('description', '');
      data.append('resource_type', bulkForm.resource_type);
      data.append('course_code', courseCode);
      data.append('academic_session', bulkForm.academic_session);
      data.append('semester', bulkForm.semester);
      if (bulkForm.resource_type === 'past_question' && bulkForm.exam_type) {
        data.append('exam_type', bulkForm.exam_type);
      }

      try {
        const res = await api.post('/resources', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const count = res.data.uploaded_count || 1;
        results.push({ name: f.name, courseCode, status: 'success', count });
      } catch (err) {
        results.push({ name: f.name, courseCode, status: 'error', message: err.response?.data?.detail || 'Failed' });
      }
      setBulkResults([...results]);
    }

    setBulkLoading(false);
    setBulkFiles([]);
    if (document.getElementById('bulk-file-upload')) {
      document.getElementById('bulk-file-upload').value = '';
    }
  };

  if (user?.role === 'student') {
    return (
      <div className="glass-panel access-denied">
        <AlertCircle size={48} className="denied-icon" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Students are not permitted to upload resources.</p>
      </div>
    );
  }

  return (
    <div className="upload-container animate-slide-up" style={{ maxWidth: '64rem' }}>
      <div className="upload-header">
        <h1 className="upload-title">
          <div className="title-icon-wrapper">
            <UploadIcon size={24} />
          </div>
          Upload Resource
        </h1>
        <p className="upload-subtitle">Add course materials, videos, or past questions to MindStream.</p>
      </div>

      <div className="upload-sections-grid">
        {/* ===== SINGLE UPLOAD SECTION ===== */}
        <div className="glass-panel upload-panel">
          <div className="upload-section-header">
            <FileUp size={20} />
            <h2>Single File Upload</h2>
          </div>
          <p className="upload-section-desc">Upload one file at a time with a custom title and description.</p>

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-grid">
              <div className="form-group mb-0">
                <label className="form-label">Resource Type</label>
                <select name="resource_type" className="form-control" value={formData.resource_type} onChange={handleChange} required>
                  <option value="document">Course Material (PDF, DOC, PPT)</option>
                  <option value="video">Video Lecture (MP4, WEBM)</option>
                  <option value="audio">Audio Resource (MP3, WAV)</option>
                  <option value="past_question">Past Question (PDF, DOC)</option>
                </select>
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Course Code</label>
                <input type="text" name="course_code" className="form-control" value={formData.course_code} onChange={handleChange} placeholder="e.g. CSC101" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} placeholder="e.g. Chapter 1: Introduction to Programming" required />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea name="description" className="form-control" style={{ minHeight: '80px' }} value={formData.description} onChange={handleChange} placeholder="Brief summary..."></textarea>
            </div>

            <div className="form-grid">
              <div className="form-group mb-0">
                <label className="form-label">Academic Session</label>
                <input type="text" name="academic_session" className="form-control" value={formData.academic_session} onChange={handleChange} required />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Semester</label>
                <select name="semester" className="form-control" value={formData.semester} onChange={handleChange} required>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
            </div>

            {formData.resource_type === 'past_question' && (
              <div className="form-group animate-fade-in">
                <label className="form-label" style={{ color: 'var(--accent)' }}>Exam Type</label>
                <select name="exam_type" className="form-control" style={{ borderColor: 'var(--accent)' }} value={formData.exam_type} onChange={handleChange} required>
                  <option value="">Select Exam Type...</option>
                  <option value="Exam">Final Exam</option>
                  <option value="Test">Mid-Semester Test</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">File</label>
              <div className="upload-dropzone">
                <input id="file-upload" type="file" onChange={handleFileChange} className="dropzone-input" required />
                <div className="dropzone-content">
                  <FileUp size={32} className={`dropzone-icon ${file ? 'active' : ''}`} />
                  <p className="dropzone-text">{file ? file.name : "Click or drag file to upload"}</p>
                  <p className="dropzone-hint">Max: 100MB</p>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <Loader2 size={18} className="animate-spin" /> Uploading...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <UploadIcon size={18} /> Upload
                </span>
              )}
            </button>
          </form>
        </div>

        {/* ===== BULK UPLOAD SECTION ===== */}
        <div className="glass-panel upload-panel">
          <div className="upload-section-header">
            <FolderUp size={20} />
            <h2>Bulk Upload</h2>
          </div>
          <p className="upload-section-desc">Upload multiple files or ZIP folders at once.</p>

          <form onSubmit={handleBulkSubmit} className="upload-form">
            <div className="form-grid">
              <div className="form-group mb-0">
                <label className="form-label">Resource Type</label>
                <select className="form-control" value={bulkForm.resource_type} onChange={e => setBulkForm({ ...bulkForm, resource_type: e.target.value })}>
                  <option value="document">Course Material (PDF, DOC, PPT, ZIP, HTML)</option>
                  <option value="video">Video Lecture (MP4, WEBM)</option>
                  <option value="audio">Audio Resource (MP3, WAV)</option>
                  <option value="past_question">Past Question (PDF, DOC, ZIP, HTML)</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Semester</label>
                <select className="form-control" value={bulkForm.semester} onChange={e => setBulkForm({ ...bulkForm, semester: e.target.value })}>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
            </div>

            {/* Auto-assign toggle */}
            <div className="auto-assign-toggle" onClick={() => setAutoAssign(!autoAssign)}>
              <div className={`toggle-switch ${autoAssign ? 'on' : ''}`}>
                <div className="toggle-knob" />
              </div>
              <div>
                <span className="toggle-label">Auto-assign course codes from filenames</span>
                <span className="toggle-hint">{autoAssign ? 'Course codes will be extracted from file names (e.g. CSC421)' : 'All files go to one course code you specify'}</span>
              </div>
            </div>

            {!autoAssign && (
              <div className="form-group animate-fade-in">
                <label className="form-label">Course Code (for all files)</label>
                <input type="text" className="form-control" value={bulkForm.course_code} onChange={e => setBulkForm({ ...bulkForm, course_code: e.target.value })} placeholder="e.g. CSC421" required />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Academic Session</label>
              <input type="text" className="form-control" value={bulkForm.academic_session} onChange={e => setBulkForm({ ...bulkForm, academic_session: e.target.value })} required />
            </div>

            {bulkForm.resource_type === 'past_question' && (
              <div className="form-group animate-fade-in">
                <label className="form-label" style={{ color: 'var(--accent)' }}>Exam Type</label>
                <select className="form-control" style={{ borderColor: 'var(--accent)' }} value={bulkForm.exam_type} onChange={e => setBulkForm({ ...bulkForm, exam_type: e.target.value })} required>
                  <option value="">Select Exam Type...</option>
                  <option value="Exam">Final Exam</option>
                  <option value="Test">Mid-Semester Test</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Files</label>
              <div className="upload-dropzone">
                <input id="bulk-file-upload" type="file" onChange={handleBulkFilesChange} className="dropzone-input" multiple />
                <div className="dropzone-content">
                  <FolderUp size={32} className={`dropzone-icon ${bulkFiles.length > 0 ? 'active' : ''}`} />
                  <p className="dropzone-text">
                    {bulkFiles.length > 0 ? `${bulkFiles.length} file(s) selected` : "Click to select files"}
                  </p>
                  <p className="dropzone-hint">PDFs, DOCs, ZIPs, videos, audio — any supported format</p>
                </div>
              </div>
            </div>

            {/* Preview of selected files */}
            {bulkFiles.length > 0 && (
              <div className="bulk-preview">
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Files to upload:</label>
                {bulkFiles.map((f, i) => (
                  <div key={i} className="bulk-preview-item">
                    <span className="bulk-preview-code">{autoAssign ? extractCourseCode(f.name) : bulkForm.course_code.toUpperCase() || '—'}</span>
                    <span className="bulk-preview-name">{f.name}</span>
                    <span className="bulk-preview-size">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upload results */}
            {bulkResults.length > 0 && (
              <div className="bulk-results">
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Upload Results:</label>
                {bulkResults.map((r, i) => (
                  <div key={i} className={`bulk-result-item ${r.status}`}>
                    {r.status === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span className="bulk-result-code">{r.courseCode}</span>
                    <span className="bulk-result-msg">
                      {r.status === 'success' ? `${r.count} file(s) uploaded` : r.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={bulkLoading || bulkFiles.length === 0}>
              {bulkLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <Loader2 size={18} className="animate-spin" /> Processing {bulkResults.length}/{bulkFiles.length + bulkResults.length}...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <FolderUp size={18} /> Upload All
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadResource;
