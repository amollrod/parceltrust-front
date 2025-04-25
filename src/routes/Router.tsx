import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { ComponentChildren } from 'preact';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import CallbackPage from '../pages/CallbackPage';
import Navbar from '../components/Navbar';
import LoadingSpinner from "../components/LoadingSpinner.tsx";

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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/callback" element={<CallbackPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
