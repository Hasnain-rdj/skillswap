import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import ProtectedRoute from './ProtectedRoute';
import ReviewSection from './components/clientfeatures/ReviewSection';
import FreelancerSearch from './components/clientfeatures/FreelancerSearch';
import ProjectManager from './components/clientfeatures/ProjectManager';
import AnalyticsDashboard from './components/clientfeatures/AnalyticsDashboard';
import ClientDashboard from './components/clientfeatures/ClientDashboard';
import FreelancerProfile from './components/freelancerfeatures/FreelancerProfile';
import BidManager from './components/freelancerfeatures/BidManager';
import ProjectManagerFreelancer from './components/freelancerfeatures/ProjectManager';
import FreelancerDashboard from './components/freelancerfeatures/FreelancerDashboard';
import FreelancerChats from './components/freelancerfeatures/FreelancerChats';
import OffersPage from './components/freelancerfeatures/OffersPage';
import AdminDashboard from './components/adminfeatures/AdminDashboard';
import AdminVerification from './components/AdminVerification';
import AdminAnalytics from './components/adminfeatures/AdminAnalytics';
import AdminNotifications from './components/adminfeatures/AdminNotifications';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client/dashboard" element={
          <ProtectedRoute role="client">
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/client/freelancers" element={
          <ProtectedRoute role="client">
            <FreelancerSearch />
          </ProtectedRoute>
        } />
        <Route path="/client/reviews" element={
          <ProtectedRoute role="client">
            <ReviewSection />
          </ProtectedRoute>
        } />
        <Route path="/client/projects" element={
          <ProtectedRoute role="client">
            <ProjectManager />
          </ProtectedRoute>
        } />
        <Route path="/client/analytics" element={
          <ProtectedRoute role="client">
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/freelancer/profile" element={
          <ProtectedRoute role="freelancer">
            <FreelancerProfile freelancerId={localStorage.getItem('userId')} />
          </ProtectedRoute>
        } />
        <Route path="/freelancer/bids" element={
          <ProtectedRoute role="freelancer">
            <BidManager freelancerId={localStorage.getItem('userId')} />
          </ProtectedRoute>
        } />
        <Route path="/freelancer/projects" element={
          <ProtectedRoute role="freelancer">
            <ProjectManagerFreelancer />
          </ProtectedRoute>
        } />
        <Route path="/freelancer/dashboard" element={
          <ProtectedRoute role="freelancer">
            <FreelancerDashboard user={{ name: localStorage.getItem('userName') }} />
          </ProtectedRoute>
        } />
        <Route path="/freelancer/chats" element={<FreelancerChats />} />
        <Route path="/freelancer/offers" element={
          <ProtectedRoute role="freelancer">
            <OffersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/verification" element={
          <ProtectedRoute role="admin">
            <AdminVerification />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute role="admin">
            <AdminAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/notifications" element={
          <ProtectedRoute role="admin">
            <AdminNotifications />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
