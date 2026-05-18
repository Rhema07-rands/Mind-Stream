import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, LogIn, AlertCircle, Mail, Lock } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    if (result.success) {
      // Check the returned user data from result or rely on useEffect?
      // Since useAuth login sets the user, the useEffect will trigger and redirect.
      // But we can also do it here explicitly to avoid flash.
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      {/* Animated Background Shapes */}
      <div className="login-bg-shape shape-1"></div>
      <div className="login-bg-shape shape-2"></div>
      <div className="login-bg-shape shape-3"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <BookOpen size={36} strokeWidth={1.5} />
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your MindStream account</p>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label" htmlFor="email">Email Address</label>
            <div className="login-input-wrapper">
              <Mail size={18} className="login-input-icon" />
              <input
                id="email"
                type="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@biu.edu.ng"
                required
              />
            </div>
          </div>
          
          <div className="login-form-group">
            <label className="login-label" htmlFor="password">Password</label>
            <div className="login-input-wrapper">
              <Lock size={18} className="login-input-icon" />
              <input
                id="password"
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Authenticating...</span>
            ) : (
              <>
                <LogIn size={20} />
                Sign In to Portal
              </>
            )}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <Link to="/register" className="login-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
