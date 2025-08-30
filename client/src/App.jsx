// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/auth/AuthPage';
import AdminDashboard from './pages/admin/dashboard'
import CitizenDashboard from './pages/citizen/dashboard';
import WorkerDashboard from './pages/worker/dashboard';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dashboard Components (Temporary)
// const CitizenDashboard = () => (
//   <div style={{ padding: '20px', textAlign: 'center' }}>
//     <h1>🏠 Citizen Dashboard</h1>
//     <p>Welcome to your citizen dashboard!</p>
//     <p>Here you can post local issues and manage your submissions.</p>
//     <LogoutButton />
//   </div>
// );

// const WorkerDashboard = () => (
//   <div style={{ padding: '20px', textAlign: 'center' }}>
//     <h1>🔧 Worker Dashboard</h1>
//     <p>Welcome to your worker dashboard!</p>
//     <p>Here you can browse and apply for jobs.</p>
//     <LogoutButton />
//   </div>
// );

// const AdminDashboard = () => (
//   <div style={{ padding: '20px', textAlign: 'center' }}>
//     <h1>👨‍💼 Admin Dashboard</h1>
//     <p>Welcome to your admin panel!</p>
//     <p>Here you can manage users, review applications, and oversee the platform.</p>
//     <LogoutButton />
//   </div>
// );

const LogoutButton = () => {
  const { logout, user } = useAuth();
  
  return (
    <div style={{ marginTop: '20px' }}>
      <p>Logged in as: <strong>{user?.name}</strong> ({user?.user_type})</p>
      <button 
        onClick={() => {
          logout();
          window.location.href = '/auth';
        }}
        style={{
          padding: '10px 20px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
};

const UnauthorizedPage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>🚫 Unauthorized</h1>
    <p>You don't have permission to access this page.</p>
    <LogoutButton />
  </div>
);

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated()) {
    // Redirect to appropriate dashboard
    const userType = user?.user_type;
    return <Navigate to={`/${userType}`} replace />;
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>🔧 LocalFix</h1>
      <h2>Welcome to LocalFix! 🏠</h2>
      <p>Platform to fix local community issues</p>
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => window.location.href = '/auth'}
          style={{ 
            margin: '10px', 
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4aed88',
                },
              },
              error: {
                duration: 4000,
                theme: {
                  primary: '#f56565',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/citizen" 
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker" 
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;