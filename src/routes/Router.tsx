import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { ComponentChildren } from 'preact';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import Navbar from '../components/Navbar';
import LoginPage from '../pages/LoginPage';
import CallbackPage from '../pages/CallbackPage';
import SilentRenewPage from "../pages/SilentRenewPage.tsx";
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';

const ProtectedRoute = ({ children }: { children: ComponentChildren }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/login" element={ <LoginPage /> } />
                <Route path="/callback" element={ <CallbackPage /> } />
                <Route path="/silent-renew" element={<SilentRenewPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <UsersPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
