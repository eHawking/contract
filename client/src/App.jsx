import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import useAuthStore from './store/useAuthStore';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminContracts from './pages/admin/Contracts';
import AdminContractForm from './pages/admin/ContractForm';
import AdminTemplates from './pages/admin/Templates';
import AdminTemplateForm from './pages/admin/TemplateForm';
import AdminUsers from './pages/admin/Users';
import AdminUserForm from './pages/admin/UserForm';
import AdminSettings from './pages/admin/Settings';

// Provider pages
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderContracts from './pages/provider/Contracts';
import ProviderContractView from './pages/provider/ContractView';

// Shared pages
import Profile from './pages/Profile';

// Protected route component
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  const { isAuthenticated, user } = useAuthStore();
  
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
        />
        
        {/* Root redirect based on role */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              user?.role === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/provider/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Admin routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/contracts" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminContracts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/contracts/new" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminContractForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/contracts/:id/edit" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminContractForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/templates" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTemplates />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/templates/new" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTemplateForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/templates/:id/edit" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminTemplateForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users/new" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUserForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Provider routes */}
        <Route 
          path="/provider/dashboard" 
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider/contracts" 
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderContracts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider/contracts/:id" 
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderContractView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/provider/profile" 
          element={
            <ProtectedRoute requiredRole="provider">
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
