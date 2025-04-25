import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'preact/hooks';
import {
    userService,
    UserResponse,
    CreateUserRequest,
    UpdateUserRequest
} from '../services/UserService';
import LoadingSpinner from '../components/LoadingSpinner';
import PermissionGuard from '../components/PermissionGuard';
import UserModal from '../components/UserModal';

export default function UsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState<UserResponse | null>(null);
    const [mode, setMode] = useState<'create' | 'edit'>('create');
    const [searchEmail, setSearchEmail] = useState('');
    const [notFound, setNotFound] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchUsers = () => {
        if (!token) return;
        setLoading(true);
        setNotFound(false);
        userService
            .getAllUsers(token)
            .then(setUsers)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const searchUser = (email: string) => {
        if (!token) return;
        if (!email.trim()) {
            fetchUsers();
            return;
        }

        setSearching(true);
        setNotFound(false);

        userService
            .getUserByEmail(email.trim(), token)
            .then(user => setUsers([user]))
            .catch(() => {
                setUsers([]);
                setNotFound(true);
            })
            .finally(() => setSearching(false));
    };

    const handleSearchInput = (value: string) => {
        setSearchEmail(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            searchUser(value);
        }, 400);
    };

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

        userService
            .deleteUser(email, token)
            .then(() => {
                fetchUsers();
            })
            .catch(err => alert('Error eliminando usuario: ' + err.message));
    };

    const handleSave = (data: CreateUserRequest | UpdateUserRequest) => {
        if (!token) return;

        const action = mode === 'create'
            ? userService.createUser(data as CreateUserRequest, token)
            : userService.updateUser(editUser!.email, data as UpdateUserRequest, token);

        action
            .then(() => {
                setShowModal(false);
                fetchUsers();
            })
            .catch(err =>
                alert(`Error ${mode === 'create' ? 'creando' : 'actualizando'} usuario: ` + err.message)
            );
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

                <div className="d-flex gap-2 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por email"
                        value={searchEmail}
                        onInput={(e) => handleSearchInput((e.target as HTMLInputElement).value)}
                    />
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                            setSearchEmail('');
                            fetchUsers();
                        }}
                    >
                        Reset
                    </button>
                </div>

                {searching && <p className="text-muted">Buscando usuario...</p>}

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
                    {notFound && (
                        <tr>
                            <td colSpan={4} className="text-center text-muted">
                                Usuario no encontrado.
                            </td>
                        </tr>
                    )}
                    {users.map(user => (
                        <tr key={user.email}>
                            <td>{user.email}</td>
                            <td>{user.enabled ? 'Activo' : 'Inactivo'}</td>
                            <td>{user.roles.join(', ')}</td>
                            <td className="d-flex gap-2">
                                <button className="btn btn-sm btn-warning" onClick={() => handleEdit(user)}>
                                    Editar
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.email)}>
                                    Eliminar
                                </button>
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
