import { useEffect, useState } from 'preact/hooks';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { packageService, PackageResponse, PackageHistoryResponse } from '../services/PackageService';
import LoadingSpinner from '../components/LoadingSpinner';
import './PackageDetailsPage.css';

export default function PackageDetailsPage() {
    const { token } = useAuth();
    const { id } = useParams();
    const [details, setDetails] = useState<PackageResponse | null>(null);
    const [history, setHistory] = useState<PackageHistoryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [historyError, setHistoryError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || !id) return;

        setLoading(true);
        setDetailsError(null);
        setHistoryError(null);

        // Fetch details
        packageService.findPackage(id, token)
            .then(setDetails)
            .catch(err => {
                console.error(err);
                setDetailsError('Error al cargar los detalles del paquete.');
            });

        // Fetch history (newest first)
        packageService.getPackageHistory(id, token)
            .then(data => {
                const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
                setHistory(sorted);
            })
            .catch(err => {
                console.error(err);
                setHistoryError('Error al cargar el historial del paquete.');
            })
            .finally(() => setLoading(false));
    }, [id, token]);

    function formatUnixTimestamp(timestampSeconds: number | null | undefined): string {
        if (!timestampSeconds || timestampSeconds <= 0) return 'Fecha desconocida';
        return new Date(timestampSeconds * 1000).toLocaleString();
    }

    const currentTimestamp = history.length > 0 ? history[0].timestamp : null;

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mt-5">

            {detailsError && <div className="alert alert-warning">{detailsError}</div>}
            {historyError && <div className="alert alert-warning">{historyError}</div>}

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
