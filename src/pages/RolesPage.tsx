import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'preact/hooks';
import { roleService, RoleResponse } from '../services/RoleService';
import LoadingSpinner from '../components/LoadingSpinner';
import Guard from '../components/Guard';
import RoleModal from '../components/RoleModal';

export default function RolesPage() {
    const { token } = useAuth();
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editRole, setEditRole] = useState<RoleResponse | null>(null);
    const [mode, setMode] = useState<'create' | 'edit'>('create');

    const fetchRoles = () => {
        if (!token) return;
        setLoading(true);
        roleService.getAllRoles(token)
            .then(setRoles)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchRoles();
    }, [token]);

    const handleCreate = () => {
        setMode('create');
        setEditRole(null);
        setShowModal(true);
    };

    const handleEdit = (role: RoleResponse) => {
        setMode('edit');
        setEditRole(role);
        setShowModal(true);
    };

    const handleDelete = (name: string) => {
        if (!confirm(`¿Eliminar el rol "${name}"?`)) return;
        if (!token) return;
        roleService.deleteRole(name, token)
            .then(fetchRoles)
            .catch(err => alert('Error eliminando rol: ' + err.message));
    };

    const handleSave = (data: { name: string; capabilities: string[] }) => {
        if (!token) return;
        const action =
            mode === 'create'
                ? roleService.createRole(data, token)
                : roleService.updateRole(editRole!.name, { capabilities: data.capabilities }, token);

        action
            .then(() => {
                setShowModal(false);
                fetchRoles();
            })
            .catch(err => alert(`Error ${mode === 'create' ? 'creando' : 'actualizando'} rol: ${err.message}`));
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container mt-5 text-danger">Error: {error}</div>;

    return (
        <Guard capability="VIEW_ROLES" showErrorMessage>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Roles del sistema</h2>
                    <Guard capability="CREATE_ROLE">
                        <button className="btn btn-primary" onClick={handleCreate}>Nuevo Rol</button>
                    </Guard>
                </div>

                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        <th>Nombre</th>
                        <th>Capacidades</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {roles.map(role => (
                        <tr key={role.name}>
                            <td>{role.name}</td>
                            <td>
                                {role.capabilities.map(cap => (
                                    <span key={cap} className="badge bg-secondary me-1">{cap}</span>
                                ))}
                            </td>
                            <td className="d-flex gap-2">
                                <Guard capability="UPDATE_ROLE">
                                    <button className="btn btn-sm btn-warning" onClick={() => handleEdit(role)}>Editar</button>
                                </Guard>
                                <Guard capability="DELETE_ROLE">
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(role.name)}>Eliminar</button>
                                </Guard>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <RoleModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    initialData={editRole || undefined}
                    mode={mode}
                />
            </div>
        </Guard>
    );
}
