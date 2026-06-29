import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import NotFound from './pages/NotFound';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import Analytics from './pages/Analytics';
import AppLayout from './components/AppLayout';


export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
        <Route path="/"                     element={<Home />} />
        <Route path="/login"                element={<Login />} />
        <Route path="/verify-email/:token"  element={<VerifyEmail />} />
        <Route path="/resend-verification"  element={<ResendVerification />} />

        <Route path="/auth/callback"        element={<AuthCallback />} />
        <Route path="/forgot-password"      element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

       <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/analytics" element={
            <AppLayout><Analytics /></AppLayout>
          } />

          <Route path="/billing" element={
            <AppLayout><Billing /></AppLayout>
          } />

          <Route path="/profile" element={
            <AppLayout><Profile /></AppLayout>
          } />
        </Route>

        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}