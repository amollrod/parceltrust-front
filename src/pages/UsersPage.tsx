import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'preact/hooks';
import { userService, UserResponse } from '../services/UserService';
import LoadingSpinner from '../components/LoadingSpinner';
import PermissionGuard from '../components/PermissionGuard';

export default function UsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        userService.getAllUsers(token)
            .then(setUsers)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container mt-5 text-danger">Error: {error}</div>;

    return (
        <PermissionGuard capability="VIEW_USERS">
            <div className="container mt-5">
                <h2>Usuarios del sistema</h2>
                <table className="table table-bordered mt-4">
                    <thead><tr><th>Email</th><th>Habilitado</th><th>Roles</th></tr></thead>
                    <tbody>
                    {users.map(u => (
                        <tr key={u.email}>
                            <td>{u.email}</td>
                            <td>{u.enabled ? 'Activo' : 'Inactivo'}</td>
                            <td>{u.roles.join(', ')}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </PermissionGuard>
    );
}
