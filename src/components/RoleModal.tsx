import { useEffect, useState } from 'preact/hooks';
import { RoleResponse, roleService, CapabilityResponse } from '../services/RoleService';
import { useAuth } from '../context/AuthContext';

interface RoleModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (data: { name: string; capabilities: string[] }) => void;
    initialData?: RoleResponse;
    mode: 'create' | 'edit';
}

export default function RoleModal({ show, onClose, onSave, initialData, mode }: RoleModalProps) {
    const { token } = useAuth();
    const [name, setName] = useState('');
    const [capabilities, setCapabilities] = useState<string[]>([]);
    const [availableCapabilities, setAvailableCapabilities] = useState<CapabilityResponse[]>([]);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setCapabilities(initialData.capabilities);
        } else {
            setName('');
            setCapabilities([]);
        }
    }, [initialData, show]);

    useEffect(() => {
        if (!token || !show) return;
        roleService.getAllCapabilities(token)
            .then(res => setAvailableCapabilities(res))
            .catch(err => console.error('Error loading capabilities:', err.message));
    }, [token, show]);

    const toggleCapability = (cap: string) => {
        setCapabilities(prev =>
            prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
        );
    };

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        onSave({ name, capabilities });
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={handleSubmit as any}>
                        <div className="modal-header">
                            <h5 className="modal-title">{mode === 'create' ? 'Crear Rol' : 'Editar Rol'}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {mode === 'create' && (
                                <div className="mb-3">
                                    <label htmlFor="role-name" className="form-label">Nombre del rol</label>
                                    <input
                                        id="role-name"
                                        type="text"
                                        className="form-control"
                                        value={name}
                                        onInput={(e) => setName((e.target as HTMLInputElement).value)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label">Capacidades</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {availableCapabilities.map(({ name: cap, description }) => {
                                        const selected = capabilities.includes(cap);
                                        return (
                                            <span
                                                key={cap}
                                                className={`badge rounded-pill ${selected ? 'bg-primary' : 'bg-secondary'} text-white p-2`}
                                                style={{ cursor: 'pointer' }}
                                                title={description}
                                                onClick={() => toggleCapability(cap)}
                                            >
                                                {cap}
                                            </span>
                                        );
                                    })}
                                    {availableCapabilities.length === 0 && (
                                        <p className="text-muted">Cargando capacidades...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
