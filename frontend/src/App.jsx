import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/AppLayout';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import Scraps from './pages/Scraps/Scraps';
import Friends from './pages/Friends/Friends';
import Fans from './pages/Friends/Fans';
import Communities from './pages/Communities/Communities';
import CommunityDetail from './pages/Communities/CommunityDetail';
import CommunityMembers from './pages/Communities/CommunityMembers';
import TopicDetail from './pages/Communities/TopicDetail';
import Photos from './pages/Photos/Photos';
import Events from './pages/Events/Events';
import Videos from './pages/Videos/Videos';
import Messages from './pages/Messages/Messages';
import SearchResults from './pages/Search/SearchResults';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Carregando...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><AppLayout><Home /></AppLayout></ProtectedRoute>} />
          <Route path="/profile/:username?" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
          <Route path="/:username/scraps" element={<ProtectedRoute><AppLayout><Scraps /></AppLayout></ProtectedRoute>} />
          <Route path="/:username/friends" element={<ProtectedRoute><AppLayout><Friends /></AppLayout></ProtectedRoute>} />
          <Route path="/:username/photos" element={<ProtectedRoute><AppLayout><Photos /></AppLayout></ProtectedRoute>} />
          <Route path="/:username/videos" element={<ProtectedRoute><AppLayout><Videos /></AppLayout></ProtectedRoute>} />
          <Route path="/:username/communities" element={<ProtectedRoute><AppLayout><Communities /></AppLayout></ProtectedRoute>} />
          <Route path="/scraps" element={<ProtectedRoute><AppLayout><Scraps /></AppLayout></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><AppLayout><Friends /></AppLayout></ProtectedRoute>} />
          <Route path="/fans/:userId" element={<ProtectedRoute><AppLayout><Fans /></AppLayout></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><AppLayout><Communities /></AppLayout></ProtectedRoute>} />
          <Route path="/communities/:id" element={<ProtectedRoute><AppLayout><CommunityDetail /></AppLayout></ProtectedRoute>} />
          <Route path="/communities/:id/members" element={<ProtectedRoute><AppLayout><CommunityMembers /></AppLayout></ProtectedRoute>} />
          <Route path="/communities/:id/topics/:topicId" element={<ProtectedRoute><AppLayout><TopicDetail /></AppLayout></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><AppLayout><Events /></AppLayout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><AppLayout><Messages /></AppLayout></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><AppLayout><SearchResults /></AppLayout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
