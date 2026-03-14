import {
    Routes,
    Route,
    Navigate
} from 'react-router-dom'
import {
    useAuthStore
} from './store/authStore'

// Pages
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import ContentApproval from './pages/admin/ContentApproval'
import UserManagement from './pages/admin/UserManagement'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import DonorDashboard from './pages/donor/DonorDashboard'
import NotFound from './pages/NotFound'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

export default function App() {
    const {
        user,
        isAuthenticated
    } = useAuthStore()

    const getDefaultRoute = () => {
        if (!isAuthenticated) return '/login'
        switch (user?.role) {
        case 'SCHOOL_ADMIN':
        case 'SUPER_ADMIN': return '/admin'
        case 'TEACHER': return '/teacher'
        case 'DONOR': return '/donor'
        default: return '/login'
        }
    }

    return (
        <Routes>
            <Route path="/login" element={
                isAuthenticated ? <Navigate to={getDefaultRoute()} replace />: <LoginPage />
                } />

            <Route path="/register" element={<RegisterPage />} />

            {/* Admin routes */}
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}>
                    <Layout />
                </ProtectedRoute>
                }>
                <Route index element={<AdminDashboard />} />
                <Route path="content-approval" element={<ContentApproval />} />
                <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Teacher routes */}
            <Route path="/teacher" element={
                <ProtectedRoute allowedRoles={['TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN']}>
                    <Layout />
                </ProtectedRoute>
                }>
                <Route index element={<TeacherDashboard />} />
            </Route>

            {/* Donor routes */}
            <Route path="/donor" element={
                <ProtectedRoute allowedRoles={['DONOR', 'SUPER_ADMIN']}>
                    <Layout />
                </ProtectedRoute>
                }>
                <Route index element={<DonorDashboard />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={
                isAuthenticated ? <Navigate to={getDefaultRoute()} replace />: <LandingPage />
                } />
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}