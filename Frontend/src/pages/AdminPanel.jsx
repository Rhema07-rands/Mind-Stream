import React, { useState, useEffect } from 'react';
import { Shield, Users, BookOpen, Building, Check, X, Loader2, Key, Trash2, MessageCircle } from 'lucide-react';
import api from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [passwordModal, setPasswordModal] = useState({ open: false, userId: null, newPassword: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCourses, resDepts, resUsers, resQuestions] = await Promise.allSettled([
        api.get('/courses'),
        api.get('/departments'),
        api.get('/users'),
        api.get('/questions')
      ]);

      if (resCourses.status === 'fulfilled') setCourses(resCourses.value.data);
      if (resDepts.status === 'fulfilled') setDepartments(resDepts.value.data);
      if (resUsers.status === 'fulfilled') setUsers(resUsers.value.data);
      if (resQuestions.status === 'fulfilled') setQuestions(resQuestions.value.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleCourseStatus = async (id, currentStatus) => {
    try {
      await api.put(`/courses/${id}`, { is_active: !currentStatus });
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? All their uploaded resources will be unassigned.")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete user");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${passwordModal.userId}/password`, { password: passwordModal.newPassword });
      alert("Password updated successfully");
      setPasswordModal({ open: false, userId: null, newPassword: '' });
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update password");
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this question?")) return;
    try {
      await api.delete(`/questions/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete question");
    }
  };

  const deleteAnswer = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this answer?")) return;
    try {
      await api.delete(`/answers/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete answer");
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="admin-header">
        <h1 className="admin-title">
          <div className="admin-title-icon">
            <Shield size={24} />
          </div>
          Admin Dashboard
        </h1>
        <p className="admin-subtitle">Manage courses, departments, users, and system moderation.</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={16}/> Courses
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          <Building size={16}/> Departments
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16}/> Users
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'qa' ? 'active' : ''}`}
          onClick={() => setActiveTab('qa')}
        >
          <MessageCircle size={16}/> Q&A Forum
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        ) : activeTab === 'courses' ? (
          <div>
            <div className="admin-content-header">
              <h2 className="admin-content-title">Manage Courses</h2>
              <button className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>Add Course</button>
            </div>
            
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Level</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td className="table-code">{course.code}</td>
                      <td>{course.title}</td>
                      <td className="table-dept">{course.department_name}</td>
                      <td>{course.level}</td>
                      <td>
                        <span className={`status-badge ${course.is_active ? 'status-active' : 'status-inactive'}`}>
                          {course.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => toggleCourseStatus(course.id, course.is_active)}
                          className={`action-btn ${course.is_active ? 'action-deactivate' : 'action-activate'}`}
                          title={course.is_active ? "Deactivate" : "Activate"}
                        >
                          {course.is_active ? <X size={16} /> : <Check size={16} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>No courses found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'departments' ? (
          <div>
            <div className="admin-content-header">
              <h2 className="admin-content-title">Manage Departments</h2>
              <button className="btn btn-primary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>Add Department</button>
            </div>
            
            <div className="dept-grid">
              {departments.map(dept => (
                <div key={dept.id} className="dept-card">
                  <div className="dept-code">{dept.code}</div>
                  <div className="dept-name">{dept.name}</div>
                  <div className="dept-actions">
                    <button className="dept-edit-btn">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div>
            <div className="admin-content-header">
              <h2 className="admin-content-title">Manage Users</h2>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{fontWeight: 500}}>{u.full_name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`status-badge ${u.role === 'admin' ? 'status-active' : 'status-inactive'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.department_name || 'N/A'}</td>
                      <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          className="action-btn action-edit"
                          title="Change Password"
                          onClick={() => setPasswordModal({ open: true, userId: u.id, newPassword: '' })}
                        >
                          <Key size={16} />
                        </button>
                        <button 
                          className="action-btn action-deactivate"
                          title="Delete User"
                          onClick={() => deleteUser(u.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="admin-content-header">
              <h2 className="admin-content-title">Q&A Moderation</h2>
            </div>
            <div className="flex flex-col gap-4">
              {questions.map(q => (
                <div key={q.id} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{q.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        By {q.author_name} ({q.author_role}) in {q.course_code} • {new Date(q.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`status-badge ${q.is_active ? 'status-active' : 'status-inactive'}`}>
                        {q.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {q.is_active && (
                        <button 
                          className="action-btn action-deactivate" 
                          onClick={() => deleteQuestion(q.id)}
                          title="Deactivate Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>{q.body}</p>
                  
                  {q.answers && q.answers.length > 0 && (
                    <div style={{ marginLeft: '1.5rem', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Answers</h4>
                      {q.answers.map(a => (
                        <div key={a.id} className="flex justify-between items-start" style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                          <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{a.body}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              By {a.author_name} ({a.author_role}) • {new Date(a.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {a.is_active && (
                            <button 
                              className="action-btn action-deactivate" 
                              onClick={() => deleteAnswer(a.id)}
                              title="Deactivate Answer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {questions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)' }}>No questions posted yet.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {passwordModal.open && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Change User Password</h3>
              <button className="action-btn" onClick={() => setPasswordModal({ open: false, userId: null, newPassword: '' })}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="form-group mb-4">
                <label className="form-label" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. password1"
                  value={passwordModal.newPassword}
                  onChange={(e) => setPasswordModal({...passwordModal, newPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn btn-secondary" onClick={() => setPasswordModal({ open: false, userId: null, newPassword: '' })}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
