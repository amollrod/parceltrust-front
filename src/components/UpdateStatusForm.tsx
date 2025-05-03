import { useState } from 'preact/hooks';
import { PackageStatus, PACKAGE_STATUSES, packageService } from '../services/PackageService';

interface Props {
    id: string;
    token: string;
    currentStatus: PackageStatus;
    currentLocation: string;
    onSuccess: () => void;
}

export default function UpdateStatusForm({ id, token, currentStatus, currentLocation, onSuccess }: Props) {
    const [status, setStatus] = useState<PackageStatus>(currentStatus);
    const [location, setLocation] = useState(currentLocation);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await packageService.updatePackageStatus(id, status, location, token);
            setSuccess(true);
            onSuccess();
        } catch (err: any) {
            setError('Error al actualizar el estado del paquete');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3">
            <div className="mb-3">
                <label className="form-label">Nuevo Estado</label>
                <select
                    className="form-select"
                    style={{ maxWidth: '300px' }}
                    value={status}
                    onChange={e => setStatus(e.currentTarget.value as PackageStatus)}
                >
                    {PACKAGE_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Ubicación</label>
                <input
                    className="form-control"
                    style={{ maxWidth: '300px' }}
                    value={location}
                    onChange={e => setLocation(e.currentTarget.value)}
                />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Estado'}
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {success && <div className="alert alert-success mt-3">¡Estado actualizado correctamente! Lo verás reflejado en unos instantes.</div>}
        </form>
    );
}
