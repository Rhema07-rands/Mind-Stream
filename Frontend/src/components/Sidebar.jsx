import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Home, 
  FileText, 
  HelpCircle, 
  Video, 
  Headphones, 
  Upload, 
  Shield, 
  LogOut,
  User as UserIcon,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after clicking a link
    onClose?.();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Course Materials', path: '/materials', icon: FileText, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Past Questions', path: '/past-questions', icon: HelpCircle, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Videos', path: '/videos', icon: Video, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Audio Resources', path: '/audio', icon: Headphones, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Q&A Forum', path: '/qa', icon: BookOpen, roles: ['student', 'lecturer', 'admin'] },
    { name: 'Upload Resource', path: '/upload', icon: Upload, roles: ['lecturer', 'admin'] },
    { name: 'Admin Panel', path: '/admin', icon: Shield, roles: ['admin'] },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-top-row">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <BookOpen size={24} />
          </div>
          <div className="sidebar-logo-text">
            <h2>Mind</h2>
            <span>STREAM</span>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.filter(item => item.roles.includes(user?.role)).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <UserIcon size={18} />
          </div>
          <div className="user-info">
            <div className="user-name">{user?.full_name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
