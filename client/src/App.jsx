import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import ExpenseHistory from './pages/ExpenseHistory';
import ExpenseDetail from './pages/ExpenseDetail';
import Layout from './components/Layout';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-dark-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={
            <PublicRoute><AuthPage /></PublicRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/add-expense" element={
            <ProtectedRoute><Layout><AddExpense /></Layout></ProtectedRoute>
          } />
          <Route path="/expenses" element={
            <ProtectedRoute><Layout><ExpenseHistory /></Layout></ProtectedRoute>
          } />
          <Route path="/expenses/:id" element={
            <ProtectedRoute><Layout><ExpenseDetail /></Layout></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
