import { useEffect, useState } from 'preact/hooks';
import { CreateUserRequest, UpdateUserRequest } from '../services/UserService';

interface UserModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (data: CreateUserRequest | UpdateUserRequest) => void;
    initialData?: CreateUserRequest | UpdateUserRequest;
    mode: 'create' | 'edit';
}

export default function UserModal({ show, onClose, onSave, initialData, mode }: UserModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roles, setRoles] = useState('');
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        if (initialData) {
            setEmail((initialData as any).email || '');
            setRoles((initialData as any).roles?.join(',') || '');
            setEnabled((initialData as any).enabled ?? true);
        }
    }, [initialData]);

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        const data: any = { roles: roles.split(',').map(r => r.trim()) };

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
                                <label className="form-label">Roles (separados por coma)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={roles}
                                    onInput={(e) => setRoles((e.target as HTMLInputElement).value)}
                                />
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
