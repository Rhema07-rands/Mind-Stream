import React, { useState, useEffect, useRef } from 'react';
import { Download, Search, Filter, Loader2, BookOpen, HelpCircle, Video, Headphones, FileText, ChevronDown, X, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ResourceList.css';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const formatViews = (views) => {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
  return views;
};

const ResourceList = ({ resourceType, title, subtitle, icon: Icon }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [semester, setSemester] = useState('');
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const { user } = useAuth();

  // Course dropdown states
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const courseDropdownRef = useRef(null);

  // Video player state
  const [playingVideo, setPlayingVideo] = useState(null);

  // Edit/Delete state
  const [editingResource, setEditingResource] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setShowCourseDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {
        resource_type: resourceType,
        ...(search && { search }),
        ...(level && { level }),
        ...(semester && { semester }),
        ...(courseId && { course_id: courseId })
      };
      const res = await api.get('/resources', { params });
      setResources(res.data);
    } catch (err) {
      console.error(`Failed to fetch ${resourceType}`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [resourceType, level, semester, courseId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleDownload = async (resourceId, filename) => {
    try {
      const res = await api.get(`/resources/${resourceId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download file");
    }
  };

  const handleEdit = (resource) => {
    setEditForm({ title: resource.title, description: resource.description || '' });
    setEditingResource(resource);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/resources/${editingResource.id}`, editForm);
      setEditingResource(null);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update resource');
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete "${resource.title}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/resources/${resource.id}`);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete resource');
    }
  };

  const canManage = (resource) => {
    return user?.role === 'admin' || (user?.role === 'lecturer' && resource.uploaded_by === user?.id);
  };

  const filteredCourses = courses.filter(c =>
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    (c.title && c.title.toLowerCase().includes(courseSearch.toLowerCase()))
  );

  const handleCourseSelect = (course) => {
    setCourseId(course.id);
    setCourseSearch(course.code);
    setShowCourseDropdown(false);
  };

  const clearCourseFilter = () => {
    setCourseId('');
    setCourseSearch('');
  };

  return (
    <div className="animate-slide-up">
      <div className="resource-header">
        <div>
          <h1 className="resource-page-title">
            <div className="title-icon-wrapper">
              <Icon size={24} />
            </div>
            {title}
          </h1>
          <p className="resource-page-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search by title..." 
            className="form-control search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        
        <div className="filter-controls">
          <select 
            className="form-control filter-select"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            {[100, 200, 300, 400, 500].map(l => <option key={l} value={l}>{l}L</option>)}
          </select>
          
          <select 
            className="form-control filter-select"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            <option value="First">First Semester</option>
            <option value="Second">Second Semester</option>
          </select>

          {/* Custom Course Dropdown */}
          <div className="course-dropdown-wrapper" ref={courseDropdownRef}>
            <div className="course-search-box">
              <input
                type="text"
                className="form-control filter-select"
                placeholder="All Courses"
                value={courseSearch}
                onChange={(e) => {
                  setCourseSearch(e.target.value);
                  setCourseId('');
                  setShowCourseDropdown(true);
                }}
                onFocus={() => setShowCourseDropdown(true)}
                autoComplete="off"
              />
              {courseId ? (
                <X
                  size={14}
                  className="course-dropdown-icon course-clear-icon"
                  onClick={clearCourseFilter}
                />
              ) : (
                <ChevronDown
                  size={14}
                  className="course-dropdown-icon"
                  style={{ transform: showCourseDropdown ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}
                />
              )}
            </div>

            {showCourseDropdown && (
              <div className="course-dropdown-list">
                <div
                  className="course-dropdown-item"
                  onClick={() => { clearCourseFilter(); setShowCourseDropdown(false); }}
                  style={{ color: !courseId ? '#D4AF37' : '#e2e8f0', fontWeight: !courseId ? 600 : 400 }}
                >
                  All Courses
                </div>
                {filteredCourses.map(c => (
                  <div
                    key={c.id}
                    className={`course-dropdown-item ${courseId === c.id ? 'selected' : ''}`}
                    onClick={() => handleCourseSelect(c)}
                  >
                    <span className="course-code">{c.code}</span>
                    <span className="course-name">{c.title}</span>
                  </div>
                ))}
                {filteredCourses.length === 0 && courseSearch && (
                  <div className="course-dropdown-empty">No courses match "{courseSearch}"</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resource List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <Icon size={64} className="empty-icon" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.5rem' }}>No {title.toLowerCase()} found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          resourceType === 'video' ? (
            <div className="video-grid">
              {resources.map((resource) => (
                <div key={resource.id} className="video-card">
                  <div 
                    className="video-thumbnail-wrapper"
                    onClick={() => setPlayingVideo(resource)}
                  >
                    {resource.thumbnail_url ? (
                      <img src={resource.thumbnail_url} alt={resource.title} className="video-thumbnail" />
                    ) : (
                      <div className="video-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>
                        <Video size={48} color="#64748b" />
                      </div>
                    )}
                    <span className="video-duration">{resource.duration || "10:00"}</span>
                  </div>
                  <div className="video-info-wrapper">
                    <div className="video-avatar">
                      {resource.uploader_name ? resource.uploader_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="video-details">
                      <h3 
                        className="video-title" 
                        title={resource.title}
                        onClick={() => setPlayingVideo(resource)}
                        style={{ cursor: 'pointer' }}
                      >
                        {resource.title}
                      </h3>
                      <div className="video-channel">{resource.uploader_name || 'Unknown Channel'}</div>
                      <div className="video-meta">
                        <span>{resource.course_code}</span>
                        <span style={{ margin: '0 4px' }}>•</span>
                        <span>{timeAgo(resource.created_at)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {canManage(resource) && (
                        <>
                          <button
                            onClick={() => handleEdit(resource)}
                            className="video-download-btn"
                            title="Edit"
                            style={{ color: 'var(--accent)' }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(resource)}
                            className="video-download-btn"
                            title="Delete"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDownload(resource.id, resource.file_name)}
                        className="video-download-btn"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cards-grid">
              {resources.map((resource) => (
                <div key={resource.id} className="resource-card">
                  <div className="card-header">
                    <div className={`stat-icon-wrapper ${
                      resourceType === 'document' ? 'icon-blue' :
                      resourceType === 'video' ? 'icon-red' :
                      resourceType === 'audio' ? 'icon-emerald' :
                      'icon-purple'
                    }`}>
                      {resourceType === 'document' ? <FileText size={24} /> :
                       resourceType === 'video' ? <Video size={24} /> :
                       resourceType === 'audio' ? <Headphones size={24} /> :
                       <HelpCircle size={24} />}
                    </div>
                    <span className="card-badge">
                      {resource.file_extension}
                    </span>
                  </div>
                  
                  <h3 className="card-title" title={resource.title}>
                    {resource.title}
                  </h3>
                  <p className="card-course">{resource.course_code}</p>
                  
                  {resource.description && (
                    <p className="card-desc">
                      {resource.description}
                    </p>
                  )}
                  
                  <div className="card-footer">
                    <div className="card-meta">
                      <div>{resource.uploader_name}</div>
                      <div>{new Date(resource.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {canManage(resource) && (
                        <>
                          <button
                            onClick={() => handleEdit(resource)}
                            className="download-btn"
                            title="Edit"
                            style={{ color: 'var(--accent)' }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(resource)}
                            className="download-btn"
                            title="Delete"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleDownload(resource.id, resource.file_name)}
                        className="download-btn"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="video-modal-overlay" onClick={() => setPlayingVideo(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3 className="video-modal-title" title={playingVideo.title}>{playingVideo.title}</h3>
              <button className="video-modal-close" onClick={() => setPlayingVideo(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="video-player-wrapper">
              <video 
                className="video-player" 
                controls 
                autoPlay 
                src={`${api.defaults.baseURL}/resources/${playingVideo.id}/download?token=${localStorage.getItem('token')}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {editingResource && (
        <div className="video-modal-overlay" onClick={() => setEditingResource(null)}>
          <div className="video-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="video-modal-header">
              <h3 className="video-modal-title">Edit Resource</h3>
              <button className="video-modal-close" onClick={() => setEditingResource(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.6rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setEditingResource(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceList;

