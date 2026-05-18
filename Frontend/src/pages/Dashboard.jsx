import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, HelpCircle, Video, Headphones, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="glass-panel stat-card">
    <div>
      <p className="stat-title">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
    <div className={`stat-icon-wrapper ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    materials: 0,
    pastQuestions: 0,
    videos: 0,
    audios: 0,
  });
  const [recentResources, setRecentResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resRecent, resStats] = await Promise.all([
          api.get('/resources', { params: { per_page: 5 } }),
          api.get('/resources/stats'),
        ]);
        setRecentResources(resRecent.data);
        
        setStats({
          materials: resStats.data.documents,
          pastQuestions: resStats.data.past_questions,
          videos: resStats.data.videos,
          audios: resStats.data.audios,
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="animate-slide-up">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {user?.full_name?.split(' ')[0]}! 👋</h1>
          <p className="dashboard-subtitle">
            {user?.role === 'student' 
              ? `You are in the ${user?.department_name || 'Department'} department, ${user?.level} Level.` 
              : `You are logged in as a ${user?.role}.`}
          </p>
        </div>
        <div className="dashboard-session">
          <div className="session-label">Academic Session</div>
          <div className="session-value">2024/2025</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="Course Materials" 
          value={stats.materials} 
          icon={BookOpen} 
          colorClass="icon-blue"
        />
        <StatCard 
          title="Past Questions" 
          value={stats.pastQuestions} 
          icon={HelpCircle} 
          colorClass="icon-purple"
        />
        <StatCard 
          title="Video Lectures" 
          value={stats.videos} 
          icon={Video} 
          colorClass="icon-red"
        />
        <StatCard 
          title="Audio Resources" 
          value={stats.audios} 
          icon={Headphones} 
          colorClass="icon-emerald"
        />
      </div>

      <div className="dashboard-grid">
        {/* Recent Resources */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header">
            <h2 className="section-title">Recently Added Resources</h2>
            <Link to="/materials" className="view-all-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          {loading ? (
            <div className="resource-list">
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 2s infinite' }}></div>
              ))}
            </div>
          ) : recentResources.length > 0 ? (
            <div className="resource-list">
              {recentResources.map((resource) => (
                <div key={resource.id} className="resource-item">
                  <div className={`stat-icon-wrapper resource-icon ${
                    resource.resource_type === 'document' ? 'icon-blue' :
                    resource.resource_type === 'video' ? 'icon-red' :
                    resource.resource_type === 'audio' ? 'icon-emerald' :
                    'icon-purple'
                  }`}>
                    {resource.resource_type === 'document' && <BookOpen size={20} />}
                    {resource.resource_type === 'video' && <Video size={20} />}
                    {resource.resource_type === 'past_question' && <HelpCircle size={20} />}
                  </div>
                  <div className="resource-info">
                    <h4 className="resource-title">{resource.title}</h4>
                    <p className="resource-meta">
                      <span className="resource-badge">{resource.file_extension}</span>
                      <span>{resource.course_code || 'General'}</span>
                      <span>•</span>
                      <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                      {resource.uploader_name && (
                        <>
                          <span>•</span>
                          <span>{resource.uploader_name}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <BookOpen size={48} className="empty-icon" />
              <p>No resources found for your department yet.</p>
            </div>
          )}
        </div>

        {/* Quick Links / Announcements */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 className="section-title">Quick Links</h2>
            <div className="quick-links">
              <Link to="/qa" className="quick-link-item">
                <div className="quick-link-icon">
                  <HelpCircle size={18} />
                </div>
                <div>
                  <div className="quick-link-title">Course Q&A</div>
                  <div className="quick-link-desc">Ask questions and discuss</div>
                </div>
              </Link>
              <Link to="/past-questions" className="quick-link-item">
                <div className="quick-link-icon">
                  <Clock size={18} />
                </div>
                <div>
                  <div className="quick-link-title">Past Questions</div>
                  <div className="quick-link-desc">Prepare for your exams</div>
                </div>
              </Link>
            </div>
          </div>
          
          <div className="glass-panel promo-box" style={{ padding: '1.5rem' }}>
            <h2 className="promo-title">Need Help?</h2>
            <p className="promo-desc">If you cannot find a specific course material, you can request it in the Q&A forum.</p>
            <Link to="/qa" className="btn btn-secondary promo-btn">
              Go to Forums
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
