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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || !id) return;

        setLoading(true);
        setError(null);

        Promise.all([
            packageService.findPackage(id, token),
            packageService.getPackageHistory(id, token),
        ])
            .then(([details, history]) => {
                setDetails(details);
                setHistory(history.sort((a, b) => b.timestamp - a.timestamp)); // newest first
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, token]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-danger container mt-5">Error: {error}</div>;
    if (!details) return <div className="container mt-5">No se encontró el paquete.</div>;

    const currentTimestamp = history.length > 0 ? history[0].timestamp : null;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Detalles del Paquete</h2>
            <div className="mb-4">
                <p><strong>ID:</strong> {details.id}</p>
                <p><strong>Origen:</strong> {details.origin}</p>
                <p><strong>Destino:</strong> {details.destination}</p>
                <p><strong>Estado actual:</strong> {details.status}</p>
                <p><strong>Última ubicación:</strong> {details.lastLocation}</p>
                <p><strong>Última actualización:</strong> {new Date(details.lastTimestamp).toLocaleString()}</p>
            </div>

            <h4>Historial del Paquete</h4>
            <ul className="timeline">
                {history.map((event, i) => (
                    <li
                        key={i}
                        className={`timeline-item ${event.timestamp === currentTimestamp ? 'active' : ''}`}
                    >
                        <span className="timestamp">{new Date(event.timestamp).toLocaleString()}</span>
                        <div><strong>{event.status}</strong> en <i>{event.location}</i></div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
