import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'preact/hooks';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserService, UserResponse } from '../services/UserService';
import PermissionGuard from '../components/PermissionGuard';

export default function UsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        UserService.getAllUsers(token)
            .then(setUsers)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <LoadingSpinner />;
    if (error) return (
        <div className="container mt-5">
            <p className="text-danger">Error: {error}</p>
        </div>
    );

    return (
        <PermissionGuard capability="VIEW_USERS">
            <div className="container mt-5">
                <h2>Usuarios del sistema</h2>
                <table className="table table-bordered table-hover mt-4">
                    <thead className="table-light">
                    <tr>
                        <th>Email</th>
                        <th>Habilitado</th>
                        <th>Roles</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.email}>
                            <td>{user.email}</td>
                            <td>{user.enabled ? 'Activo' : 'Inactivo'}</td>
                            <td>{user.roles.join(', ')}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </PermissionGuard>
    );
}
