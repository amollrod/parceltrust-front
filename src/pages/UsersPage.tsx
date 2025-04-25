import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'preact/hooks';
import { userService, UserResponse, CreateUserRequest, UpdateUserRequest } from '../services/UserService';
import LoadingSpinner from '../components/LoadingSpinner';
import PermissionGuard from '../components/PermissionGuard';
import UserModal from '../components/UserModal';

export default function UsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState<UserResponse | null>(null);
    const [mode, setMode] = useState<'create' | 'edit'>('create');

    const fetchUsers = () => {
        if (!token) return;

        setLoading(true);
        userService.getAllUsers(token)
            .then(setUsers)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleCreate = () => {
        setMode('create');
        setEditUser(null);
        setShowModal(true);
    };

    const handleEdit = (user: UserResponse) => {
        setMode('edit');
        setEditUser(user);
        setShowModal(true);
    };

    const handleDelete = (email: string) => {
        if (!confirm(`¿Seguro que quieres eliminar al usuario ${email}?`)) return;
        if (!token) return;

        userService.deleteUser(email, token)
            .then(() => {
                fetchUsers();
            })
            .catch(err => alert('Error eliminando usuario: ' + err.message));
    };

    const handleSave = (data: CreateUserRequest | UpdateUserRequest) => {
        if (!token) return;

        if (mode === 'create') {
            userService.createUser(data as CreateUserRequest, token)
                .then(() => {
                    setShowModal(false);
                    fetchUsers();
                })
                .catch(err => alert('Error creando usuario: ' + err.message));
        } else if (mode === 'edit' && editUser) {
            userService.updateUser(editUser.email, data as UpdateUserRequest, token)
                .then(() => {
                    setShowModal(false);
                    fetchUsers();
                })
                .catch(err => alert('Error actualizando usuario: ' + err.message));
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container mt-5 text-danger">Error: {error}</div>;

    return (
        <PermissionGuard capability="VIEW_USERS">
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Usuarios del sistema</h2>
                    <button className="btn btn-primary" onClick={handleCreate}>
                        Nuevo Usuario
                    </button>
                </div>

                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        <th>Email</th>
                        <th>Habilitado</th>
                        <th>Roles</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.email}>
                            <td>{user.email}</td>
                            <td>{user.enabled ? 'Activo' : 'Inactivo'}</td>
                            <td>{user.roles.join(', ')}</td>
                            <td className="d-flex gap-2">
                                <button className="btn btn-sm btn-warning" onClick={() => handleEdit(user)}>Editar</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.email)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <UserModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    initialData={editUser || undefined}
                    mode={mode}
                />
            </div>
        </PermissionGuard>
    );
}
