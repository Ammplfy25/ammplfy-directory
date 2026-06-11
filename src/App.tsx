import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import Header from './components/Header'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import DirectoryPage from './pages/DirectoryPage'
import ListingDetailPage from './pages/ListingDetailPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import SubmitPage from './pages/SubmitPage'
import BlogPage from './pages/BlogPage'
import PostPage from './pages/PostPage'


function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes with header */}
        <Route path="/" element={<PublicLayout><DirectoryPage /></PublicLayout>} />
        <Route path="/listings/:slug" element={<PublicLayout><ListingDetailPage /></PublicLayout>} />
        <Route path="/submit" element={<PublicLayout><SubmitPage /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><PostPage /></PublicLayout>} />

        {/* Admin routes — no public header */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
