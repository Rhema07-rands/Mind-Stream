import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Plus, Send, User, ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import api from '../services/api';
import './QAForum.css';

const QAForum = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Input states
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', body: '' });
  const [replyText, setReplyText] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const params = {};
        if (user?.role === 'student') params.level = user.level;
        if (user?.role === 'lecturer') params.lecturer_id = user.id;
        const res = await api.get('/courses', { params });
        setCourses(res.data);
        if (res.data.length > 0) {
          setSelectedCourse(res.data[0]);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
        setLoading(false);
      }
    };
    if (user) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (!selectedCourse) return;
    
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${selectedCourse.id}/questions`);
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to fetch questions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedCourse]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/courses/${selectedCourse.id}/questions`, newQuestion);
      setQuestions([res.data, ...questions]);
      setShowAskModal(false);
      setNewQuestion({ title: '', body: '' });
    } catch (err) {
      alert("Failed to post question. Ensure you are a student in this department.");
    }
  };

  const handlePostReply = async (questionId) => {
    if (!replyText[questionId]?.trim()) return;
    try {
      const res = await api.post(`/questions/${questionId}/answers`, { body: replyText[questionId] });
      
      const updatedQuestions = questions.map(q => {
        if (q.id === questionId) {
          return { ...q, answers: [...(q.answers || []), res.data] };
        }
        return q;
      });
      setQuestions(updatedQuestions);
      setReplyText({ ...replyText, [questionId]: '' });
    } catch (err) {
      alert("Failed to post reply.");
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-slide-up">
      <div className="resource-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="resource-page-title">
            <div className="title-icon-wrapper">
              <MessageSquare size={24} />
            </div>
            Course Q&A Forum
          </h1>
          <p className="resource-page-subtitle">Ask questions and discuss topics with your peers and lecturers.</p>
        </div>
        
        {user?.role === 'student' && selectedCourse && (
          <button onClick={() => setShowAskModal(true)} className="btn btn-primary">
            <Plus size={18} /> Ask Question
          </button>
        )}
      </div>

      <div className="qa-layout">
        {/* Course Sidebar */}
        <div className="qa-sidebar">
          <div className="glass-panel" style={{ padding: '1rem', position: 'sticky', top: '1.5rem' }}>
            <h3 style={{ fontWeight: '700', fontSize: '1.125rem', marginBottom: '1rem' }}>Your Courses</h3>
            <div className="course-list">
              {courses.map(course => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`course-btn ${selectedCourse?.id === course.id ? 'active' : ''}`}
                >
                  <div className="course-code">{course.code}</div>
                  <div className="course-title">{course.title}</div>
                </button>
              ))}
              {courses.length === 0 && (
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>No courses available.</div>
              )}
            </div>
          </div>
        </div>

        {/* Q&A Thread Area */}
        <div className="qa-main">
          {selectedCourse && !loading && (
            <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="search-form" style={{ flex: 1, position: 'relative' }}>
                <Search size={18} className="search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder={`Search questions in ${selectedCourse.code}...`}
                  className="form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="glass-panel" style={{ padding: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Loader2 className="animate-spin text-gold" size={40} />
            </div>
          ) : !selectedCourse ? (
             <div className="glass-panel empty-state">
               <MessageSquare size={48} className="empty-icon" />
               <p>Select a course to view or participate in its Q&A forum.</p>
             </div>
          ) : filteredQuestions.length === 0 ? (
             <div className="glass-panel empty-state">
               <MessageSquare size={48} className="empty-icon" />
               <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>No questions found</h3>
               <p>{searchQuery ? `No results for "${searchQuery}".` : `Be the first to ask a question for ${selectedCourse.code}.`}</p>
             </div>
          ) : (
            <div className="questions-list">
              {filteredQuestions.map(question => (
                <div key={question.id} className="question-item">
                  {/* Question Header */}
                  <div 
                    className="question-header"
                    onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                  >
                    <div className="question-title-row">
                      <h3 className="question-title">{question.title}</h3>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {expandedQuestion === question.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                    <p className={`question-body ${expandedQuestion === question.id ? '' : 'collapsed'}`}>
                      {question.body}
                    </p>
                    <div className="question-meta">
                      <div className="author-info">
                        <User size={14} />
                        <span style={{ fontWeight: '500' }}>{question.author_name}</span>
                        <span className="author-role">{question.author_role}</span>
                      </div>
                      <div className="meta-stats">
                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                        <span className="replies-count">{question.answers?.length || 0} replies</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Replies Area */}
                  {expandedQuestion === question.id && (
                    <div className="replies-area">
                      <h4 className="replies-title">Replies</h4>
                      
                      <div className="replies-list">
                        {question.answers?.length > 0 ? (
                          question.answers.map(answer => (
                            <div key={answer.id} className="reply-item">
                              <p className="reply-body">{answer.body}</p>
                              <div className="reply-meta">
                                <div className="reply-author">
                                  <span className={`role-dot ${answer.author_role}`}></span>
                                  <span className={`author-name ${answer.author_role}`}>
                                    {answer.author_name} ({answer.author_role})
                                  </span>
                                </div>
                                <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No replies yet.</div>
                        )}
                      </div>

                      {/* Reply Input */}
                      <div className="reply-input-wrapper">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          className="form-control reply-input"
                          value={replyText[question.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [question.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePostReply(question.id);
                          }}
                        />
                        <button 
                          onClick={() => handlePostReply(question.id)}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 1rem' }}
                          disabled={!replyText[question.id]?.trim()}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <h2 className="modal-title">Ask a Question for {selectedCourse?.code}</h2>
            <form onSubmit={handleAskQuestion}>
              <div className="form-group">
                <label className="form-label">Question Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                  required
                  placeholder="Summarize your question..."
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Details</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  value={newQuestion.body}
                  onChange={(e) => setNewQuestion({...newQuestion, body: e.target.value})}
                  required
                  placeholder="Provide more context or specifics..."
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAskModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAForum;
