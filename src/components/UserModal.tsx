import { useEffect, useState } from 'preact/hooks';
import { CreateUserRequest, UpdateUserRequest } from '../services/UserService';
import { RoleResponse, roleService } from '../services/RoleService';
import { useAuth } from '../context/AuthContext';

interface UserModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (data: CreateUserRequest | UpdateUserRequest) => void;
    initialData?: CreateUserRequest | UpdateUserRequest;
    mode: 'create' | 'edit';
}

export default function UserModal({ show, onClose, onSave, initialData, mode }: UserModalProps) {
    const { token } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [enabled, setEnabled] = useState(true);
    const [rolesAvailable, setRolesAvailable] = useState<RoleResponse[]>([]);

    useEffect(() => {
        if (initialData) {
            setEmail((initialData as any).email || '');
            setSelectedRoles((initialData as any).roles || []);
            setEnabled((initialData as any).enabled ?? true);
        }
    }, [initialData]);

    useEffect(() => {
        if (!token) return;
        roleService.getAllRoles(token)
            .then(setRolesAvailable)
            .catch(err => console.error('Error loading roles:', err.message));
    }, [token]);

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        const data: any = { roles: selectedRoles };

        if (mode === 'create') {
            data.email = email;
            data.password = password;
        }
        if (mode === 'edit') {
            data.enabled = enabled;
            if (password) data.password = password;
        }

        onSave(data);
    };

    const toggleRole = (roleName: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={handleSubmit as any}>
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {mode === 'create' && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={email}
                                            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            name="new-password"
                                            autoComplete="new-password"
                                            className="form-control"
                                            value={password}
                                            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                                            required
                                        />
                                    </div>
                                </>
                            )}
                            {mode === 'edit' && (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label">Password (nuevo opcional)</label>
                                        <input
                                            type="password"
                                            name="new-password"
                                            autoComplete="new-password"
                                            className="form-control"
                                            value={password}
                                            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
                                        />
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="enabledCheck"
                                            checked={enabled}
                                            onChange={(e) => setEnabled((e.target as HTMLInputElement).checked)}
                                        />
                                        <label className="form-check-label" htmlFor="enabledCheck">
                                            Habilitado
                                        </label>
                                    </div>
                                </>
                            )}

                            <div className="mb-3">
                                <label className="form-label">Roles</label>
                                {rolesAvailable.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2">
                                        {rolesAvailable.map(role => {
                                            const isSelected = selectedRoles.includes(role.name);
                                            return (
                                                <span
                                                    key={role.name}
                                                    className={`badge rounded-pill ${isSelected ? 'bg-primary' : 'bg-secondary'} text-white p-2`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => toggleRole(role.name)}
                                                >
                          {role.name}
                        </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-muted">Cargando roles...</p>
                                )}
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
