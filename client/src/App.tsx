/**
 * App root — sets up routing and restores the user session on first load.
 * Only the Homepage is fully built (Milestone 2); other routes show a friendly
 * placeholder until their milestone lands, so navigation never dead-ends.
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ListingDetailPage from './pages/ListingDetailPage';
import ShortlistPage from './pages/ShortlistPage';
import SharedShortlistPage from './pages/SharedShortlistPage';
import PostListingPage from './pages/PostListingPage';
import DashboardPage from './pages/DashboardPage';
import DealerProfilePage from './pages/DealerProfilePage';
import MessagesPage from './pages/MessagesPage';
import AdminPage from './pages/AdminPage';
import ToolsPage from './pages/ToolsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Placeholder from './pages/Placeholder';
import AuthModal from './components/auth/AuthModal';
import { useAuthStore } from './store/authStore';
import { useSavedStore } from './store/savedStore';

export default function App() {
  const loadSession = useAuthStore((s) => s.loadSession);
  const user = useAuthStore((s) => s.user);
  const loadSaved = useSavedStore((s) => s.load);
  const clearSaved = useSavedStore((s) => s.clear);

  // Restore session from the httpOnly cookie once when the app mounts.
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Keep the shortlist in sync with who's logged in.
  useEffect(() => {
    if (user) loadSaved();
    else clearSaved();
  }, [user, loadSaved, clearSaved]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route path="/dealers/:id" element={<DealerProfilePage />} />
        <Route path="/post-listing" element={<PostListingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/shortlist" element={<ShortlistPage />} />
        <Route path="/shortlist/shared" element={<SharedShortlistPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
      {/* Global auth modal — can be opened from anywhere via the UI store. */}
      <AuthModal />
    </BrowserRouter>
  );
}
