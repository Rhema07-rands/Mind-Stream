import React, { useState, useEffect } from 'react';
import { Shield, Users, BookOpen, Building, Check, X, Loader2 } from 'lucide-react';
import api from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCourses, resDepts] = await Promise.all([
        api.get('/courses'),
        api.get('/departments')
      ]);
      setCourses(resCourses.data);
      setDepartments(resDepts.data);
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
          className="admin-tab-btn"
          disabled
          title="Coming soon"
        >
          <Users size={16}/> Users (WIP)
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
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
