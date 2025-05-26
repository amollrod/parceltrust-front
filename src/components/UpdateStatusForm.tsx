import { useState } from 'preact/hooks';
import { PackageStatus, PACKAGE_STATUSES, packageService } from '../services/PackageService';

interface Props {
    id: string;
    token: string;
    currentStatus: PackageStatus;
    currentLocation: string;
    onSuccess: (newStatus: PackageStatus, newLocation: string) => void;
    disabled?: boolean;
}

export default function UpdateStatusForm({ id, token, currentStatus, currentLocation, onSuccess, disabled }: Props) {
    const [status, setStatus] = useState<PackageStatus>(currentStatus);
    const [location, setLocation] = useState(currentLocation);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await packageService.updatePackageStatus(id, status, location, token);
            onSuccess(status, location);
        } catch (err: any) {
            setError('Error al actualizar el estado del paquete');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3" style={{ maxWidth: '350px' }}>
            <div className="mb-3">
                <label htmlFor="status" className="form-label">Nuevo Estado</label>
                <select
                    id="status"
                    className="form-select"
                    value={status}
                    disabled={disabled}
                    onChange={e => setStatus(e.currentTarget.value as PackageStatus)}
                >
                    {PACKAGE_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="location" className="form-label">Ubicación</label>
                <input
                    id="location"
                    className="form-control"
                    value={location}
                    disabled={disabled}
                    onChange={e => setLocation(e.currentTarget.value)}
                />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading || disabled}>
                {loading ? 'Actualizando...' : 'Actualizar Estado'}
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>
    );
}
