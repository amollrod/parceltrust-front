import { useState } from 'preact/hooks';
import { CreatePackageRequest, packageService } from '../services/PackageService';
import { useAuth } from '../context/AuthContext';

interface PackageModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PackageModal({ show, onClose, onSuccess }: PackageModalProps) {
    const { token } = useAuth();
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data: CreatePackageRequest = { origin, destination };
            await packageService.createPackage(data, token);
            onSuccess();
            onClose();
            setOrigin('');
            setDestination('');
        } catch (err: any) {
            setError(err.message ?? 'Error al crear paquete');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 className="modal-title">Crear Paquete</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <div className="mb-3">
                                <label className="form-label">Origen</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={origin}
                                    onChange={e => setOrigin(e.currentTarget.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Destino</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={destination}
                                    onChange={e => setDestination(e.currentTarget.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Creando...' : 'Crear'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
