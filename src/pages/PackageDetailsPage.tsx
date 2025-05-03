import { useEffect, useState } from 'preact/hooks';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { packageService, PackageResponse, PackageHistoryResponse, PackageStatus } from '../services/PackageService';
import LoadingSpinner from '../components/LoadingSpinner';
import Guard from '../components/Guard';
import UpdateStatusForm from '../components/UpdateStatusForm';
import './PackageDetailsPage.css';

export default function PackageDetailsPage() {
    const { token } = useAuth();
    const { id } = useParams();
    const [details, setDetails] = useState<PackageResponse | null>(null);
    const [history, setHistory] = useState<PackageHistoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [polling, setPolling] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchDetails = () => {
        if (!token || !id) return;
        setDetailsError(null);
        return packageService.findPackage(id, token)
            .then(setDetails)
            .catch(err => {
                console.error(err);
                setDetailsError('Error al cargar los detalles del paquete.');
            });
    };

    const fetchHistory = () => {
        if (!token || !id) return;
        setHistoryError(null);
        return packageService.getPackageHistory(id, token)
            .then(data => {
                const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
                setHistory(sorted);
            })
            .catch(err => {
                console.error(err);
                setHistoryError('Error al cargar el historial del paquete.');
            });
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchDetails(), fetchHistory()]).finally(() => setLoading(false));
    }, [id, token]);

    const formatUnixTimestamp = (timestampSeconds: number | null | undefined): string =>
        !timestampSeconds || timestampSeconds <= 0
            ? 'Fecha desconocida'
            : new Date(timestampSeconds * 1000).toLocaleString();

    const currentTimestamp = history.length > 0 ? history[0].timestamp : null;

    const handleSuccessUpdate = (newStatus: PackageStatus, newLocation: string) => {
        setPolling(true);
        setSuccessMessage('Transacción enviada. Esperando confirmación del nuevo estado...');
        setDetails(prev =>
            prev
                ? {
                    ...prev,
                    status: newStatus,
                    lastLocation: newLocation,
                }
                : prev
        );

        let attempts = 0;
        const interval = setInterval(() => {
            if (!token || !id) return;
            attempts++;
            packageService.getPackageHistory(id, token)
                .then(data => {
                    const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
                    setHistory(sorted);
                    const updated = sorted[0];
                    if (updated.status === newStatus && updated.location === newLocation) {
                        clearInterval(interval);
                        setSuccessMessage('¡Estado actualizado correctamente!');
                        fetchDetails();
                        setPolling(false);
                        setTimeout(() => setSuccessMessage(null), 3000);
                    } else if (attempts >= 20) {
                        clearInterval(interval);
                        setSuccessMessage('Estado actualizado, pero la confirmación puede tardar unos minutos.');
                        setPolling(false);
                    }
                })
                .catch(err => {
                    clearInterval(interval);
                    console.error(err);
                    setSuccessMessage('Error durante la verificación del estado actualizado.');
                    setPolling(false);
                });
        }, 3000);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mt-5">
            {detailsError && <div className="alert alert-warning">{detailsError}</div>}
            {historyError && <div className="alert alert-warning">{historyError}</div>}
            {successMessage && <div className="alert alert-info">{successMessage}</div>}

            <h2>Detalles del Paquete</h2>

            {details ? (
                <>
                    <p className="mb-4">Información del último estado conocido del paquete.</p>
                    <p><strong>ID:</strong> {details.id}</p>
                    <p><strong>Origen:</strong> {details.origin}</p>
                    <p><strong>Destino:</strong> {details.destination}</p>
                    <p><strong>Estado actual:</strong> {details.status}</p>
                    <p><strong>Última ubicación:</strong> {details.lastLocation}</p>
                    <p><strong>Última actualización:</strong> {formatUnixTimestamp(details.lastTimestamp)}</p>

                    <Guard capability="UPDATE_STATUS">
                        <h2 className="mt-5">Actualizar Estado</h2>
                        <p>Introduce los datos para el nuevo estado.</p>
                        <UpdateStatusForm
                            id={details.id}
                            token={token!}
                            currentStatus={details.status}
                            currentLocation={details.lastLocation}
                            onSuccess={handleSuccessUpdate}
                            disabled={polling}
                        />
                    </Guard>
                </>
            ) : (
                <p className="text-muted">No se pudo cargar la información del paquete.</p>
            )}

            <h2 className="mt-5">Historial del Paquete</h2>

            {history.length > 0 ? (
                <>
                    <p className="mb-4">Timeline de la traza del paquete.</p>
                    <ul className="timeline">
                        {history.map((event, i) => (
                            <li
                                key={i}
                                className={`timeline-item ${event.timestamp === currentTimestamp ? 'active' : ''}`}
                            >
                                <span className="timestamp">{formatUnixTimestamp(event.timestamp)}</span>
                                <div><strong>{event.status}</strong> en <i>{event.location}</i></div>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p className="text-muted">No hay historial disponible.</p>
            )}
        </div>
    );
}
