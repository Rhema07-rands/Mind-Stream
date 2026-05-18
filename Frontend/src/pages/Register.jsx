import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, UserPlus, AlertCircle, ChevronDown } from 'lucide-react';
import api from '../services/api';
import './Login.css';

const LEVELS = [100, 200, 300, 400, 500];

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    matric_number: '',
    department_id: '',
    level: ''
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Department dropdown states
  const [deptSearchTerm, setDeptSearchTerm] = useState('');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const deptDropdownRef = useRef(null);

  // Level dropdown states
  const [showLevelDropdown, setShowLevelDropdown] = useState(false);
  const levelDropdownRef = useRef(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setShowDeptDropdown(false);
      }
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target)) {
        setShowLevelDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments');
        setDepartments(response.data);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const filteredDepartments = departments.filter(dept => 
    dept.code.toLowerCase().includes(deptSearchTerm.toLowerCase()) || 
    (dept.name && dept.name.toLowerCase().includes(deptSearchTerm.toLowerCase()))
  );

  const handleDeptSelect = (dept) => {
    setFormData({ ...formData, department_id: dept.id });
    setDeptSearchTerm(`${dept.code} - ${dept.name}`);
    setShowDeptDropdown(false);
  };

  const handleLevelSelect = (level) => {
    setFormData({ ...formData, level: level });
    setShowLevelDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!formData.department_id) {
      setError('Please select a department.');
      return;
    }
    if (formData.role === 'student' && !formData.level) {
      setError('Please select your level.');
      return;
    }

    setIsLoading(true);

    const payload = { ...formData };
    
    if (payload.department_id) payload.department_id = parseInt(payload.department_id);
    if (payload.level) payload.level = parseInt(payload.level);
    
    if (payload.role !== 'student') {
      delete payload.matric_number;
      delete payload.level;
    }

    try {
      const result = await register(payload);
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Handle error - could be a string or an array of validation errors
        const err = result.error;
        if (Array.isArray(err)) {
          setError(err.map(e => e.msg || e.message || JSON.stringify(e)).join('. '));
        } else if (typeof err === 'object') {
          setError(JSON.stringify(err));
        } else {
          setError(err || 'Registration failed.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  const selectedLevelLabel = formData.level ? `${formData.level} Level` : 'Select Level...';

  return (
    <div className="login-container">
      <div className="login-bg-shape shape-1"></div>
      <div className="login-bg-shape shape-2"></div>
      <div className="login-bg-shape shape-3"></div>

      <div className="login-card" style={{ maxWidth: '540px', margin: '2rem 0', padding: '2rem' }}>
        <div className="login-header" style={{ marginBottom: '1.5rem' }}>
          <div className="login-logo-container" style={{ width: '60px', height: '60px', marginBottom: '1rem' }}>
            <BookOpen size={28} strokeWidth={1.5} />
          </div>
          <h1 className="login-title" style={{ fontSize: '1.5rem' }}>Create Account</h1>
          <p className="login-subtitle">Join the MindStream</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{String(error)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="role-toggle">
            <button
              type="button"
              className={`role-toggle-btn ${formData.role === 'student' ? 'active-student' : 'inactive'}`}
              onClick={() => setFormData({...formData, role: 'student'})}
            >
              Student
            </button>
            <button
              type="button"
              className={`role-toggle-btn ${formData.role === 'lecturer' ? 'active-lecturer' : 'inactive'}`}
              onClick={() => setFormData({...formData, role: 'lecturer'})}
            >
              Lecturer
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="login-form-group" style={{ marginBottom: '0', flex: 1 }}>
              <label className="login-label" htmlFor="full_name">Full Name</label>
              <div className="login-input-wrapper">
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  className="login-input"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="login-form-group" style={{ marginBottom: '0', flex: 1 }}>
              <label className="login-label" htmlFor="email">Email</label>
              <div className="login-input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="login-input"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@biu.edu.ng"
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="login-form-group" style={{ marginBottom: '0', flex: 1 }}>
              <label className="login-label" htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="login-input"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Custom Department Dropdown */}
            <div className="login-form-group" style={{ marginBottom: '0', flex: 1, position: 'relative' }} ref={deptDropdownRef}>
              <label className="login-label" htmlFor="department_search">Department</label>
              <div className="login-input-wrapper" style={{ position: 'relative' }}>
                <input
                  id="department_search"
                  type="text"
                  className="login-input"
                  style={{ paddingLeft: '1rem', paddingRight: '2.5rem' }}
                  value={deptSearchTerm}
                  onChange={(e) => {
                    setDeptSearchTerm(e.target.value);
                    setShowDeptDropdown(true);
                    setFormData({ ...formData, department_id: '' });
                  }}
                  onFocus={() => setShowDeptDropdown(true)}
                  placeholder="Search department..."
                  autoComplete="off"
                />
                <ChevronDown 
                  size={16} 
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: showDeptDropdown ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
                    color: '#64748b', pointerEvents: 'none', transition: 'transform 0.2s ease'
                  }}
                />
                
                {showDeptDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    marginTop: '4px', background: '#0f1d32', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    maxHeight: '200px', overflowY: 'auto'
                  }}>
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map(dept => (
                        <div
                          key={dept.id}
                          onClick={() => handleDeptSelect(dept)}
                          style={{
                            padding: '0.625rem 1rem', cursor: 'pointer',
                            transition: 'background 0.15s ease', fontSize: '0.875rem',
                            color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <span style={{ fontWeight: 600, color: '#D4AF37' }}>{dept.code}</span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.65 }}>{dept.name}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                        No departments found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {formData.role === 'student' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="login-form-group" style={{ marginBottom: '0', flex: 2 }}>
                <label className="login-label" htmlFor="matric_number">Matric Number</label>
                <div className="login-input-wrapper">
                  <input
                    id="matric_number"
                    name="matric_number"
                    type="text"
                    className="login-input"
                    style={{ paddingLeft: '1rem' }}
                    value={formData.matric_number}
                    onChange={handleChange}
                    placeholder="e.g. MS/2023/1234"
                    required
                  />
                </div>
              </div>
              
              {/* Custom Level Dropdown */}
              <div className="login-form-group" style={{ marginBottom: '0', flex: 1, position: 'relative' }} ref={levelDropdownRef}>
                <label className="login-label">Level</label>
                <div
                  className="login-input"
                  onClick={() => setShowLevelDropdown(!showLevelDropdown)}
                  style={{
                    paddingLeft: '1rem', paddingRight: '2.5rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', position: 'relative',
                    color: formData.level ? '#f8fafc' : '#475569',
                    userSelect: 'none'
                  }}
                >
                  {selectedLevelLabel}
                  <ChevronDown 
                    size={16} 
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: showLevelDropdown ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
                      color: '#64748b', transition: 'transform 0.2s ease'
                    }}
                  />
                </div>

                {showLevelDropdown && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    marginTop: '4px', background: '#0f1d32', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden'
                  }}>
                    {LEVELS.map(level => (
                      <div
                        key={level}
                        onClick={() => handleLevelSelect(level)}
                        style={{
                          padding: '0.625rem 1rem', cursor: 'pointer',
                          transition: 'all 0.15s ease', fontSize: '0.875rem',
                          color: formData.level === level ? '#D4AF37' : '#e2e8f0',
                          background: formData.level === level ? 'rgba(212,175,55,0.1)' : 'transparent',
                          fontWeight: formData.level === level ? 600 : 400,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => { 
                          if (formData.level !== level) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.background = formData.level === level ? 'rgba(212,175,55,0.1)' : 'transparent'; 
                        }}
                      >
                        <span>{level} Level</span>
                        {formData.level === level && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            style={{ marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Creating Account...</span>
            ) : (
              <>
                <UserPlus size={20} />
                Register
              </>
            )}
          </button>
        </form>

        <p className="login-footer" style={{ marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" className="login-link">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

