import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'preact/compat';

interface GuardProps {
    capability: string;
    children: ReactNode;
    showErrorMessage?: boolean;
    fallback?: ReactNode;
}

export default function Guard({ capability, children, showErrorMessage = false, fallback = null }: GuardProps) {
    const { hasCapability } = useAuth();

    if (!hasCapability(capability)) {
        if (fallback) {
            return <>{fallback}</>;
        }
        if (showErrorMessage) {
            return (
                <div className="container mt-5">
                    <p className="text-danger">No tienes permiso para acceder a esta sección.</p>
                </div>
            );
        }
        return null;
    }

    return <>{children}</>;
}
