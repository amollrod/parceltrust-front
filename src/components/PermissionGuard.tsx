import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'preact/compat';

interface PermissionGuardProps {
    capability?: string;
    children: ReactNode;
}

export default function PermissionGuard({ capability, children }: PermissionGuardProps) {
    const { hasCapability } = useAuth();

    if (!capability || hasCapability(capability)) {
        return <>{children}</>;
    }

    return (
        <div className="container mt-5">
            <p className="text-danger">No tienes permiso para acceder a esta sección.</p>
        </div>
    );
}
