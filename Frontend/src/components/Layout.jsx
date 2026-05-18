import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Mobile hamburger */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
        <Menu size={22} />
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
