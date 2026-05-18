import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CourseMaterials from './pages/CourseMaterials';
import PastQuestions from './pages/PastQuestions';
import Videos from './pages/Videos';
import Audio from './pages/Audio';
import QAForum from './pages/QAForum';
import UploadResource from './pages/UploadResource';
import AdminPanel from './pages/AdminPanel';

// Loading Screen
const LoadingScreen = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#0a1628]">
    <Loader2 className="animate-spin text-[#D4AF37]" size={48} />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  
  if (!user) return <Navigate to="/" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />; // Redirect unauthorized to home
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes inside Layout */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/materials" element={<CourseMaterials />} />
              <Route path="/past-questions" element={<PastQuestions />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/audio" element={<Audio />} />
              <Route path="/qa" element={<QAForum />} />
              <Route path="/upload" element={<UploadResource />} />
              
              {/* Admin Only Route */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
