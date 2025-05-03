import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'preact/hooks';
import { packageService, PACKAGE_STATUSES, PackageResponse, PackageStatus } from '../services/PackageService';
import LoadingSpinner from '../components/LoadingSpinner';
import Guard from '../components/Guard';
import { useNavigate } from 'react-router-dom';

export default function PackagesPage() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [packages, setPackages] = useState<PackageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const [status, setStatus] = useState<PackageStatus | ''>('');
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [location, setLocation] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const fetchPackages = () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        packageService
            .searchPackages(
                {
                    page,
                    size,
                    status: status || undefined,
                    origin: origin || undefined,
                    destination: destination || undefined,
                    location: location || undefined,
                    fromDate: fromDate ? new Date(fromDate) : undefined,
                    toDate: toDate ? new Date(toDate) : undefined,
                },
                token
            )
            .then(res => {
                setPackages(res.content ?? []);
                setTotalPages(res.totalPages ?? 1);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (token) fetchPackages();
    }, [token, page, size]);

    const handleSearch = (e: Event) => {
        e.preventDefault();
        setPage(0);
        fetchPackages();
    };

    const resetFilters = () => {
        setStatus('');
        setOrigin('');
        setDestination('');
        setLocation('');
        setFromDate('');
        setToDate('');
        setPage(0);
    };

    const handleViewHistory = (id: string) => {
        navigate(`/packages/${id}`);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container mt-5 text-danger">Error: {error}</div>;

    return (
        <Guard capability="SEARCH_PACKAGES" showErrorMessage>
            <div className="container mt-5">
                <h2 className="mb-4">Buscar Paquetes</h2>
                <form className="row row-cols-lg-auto g-2 align-items-end mb-4" onSubmit={handleSearch}>
                    <div className="col">
                        <label className="form-label">Estado</label>
                        <select className="form-select" value={status}
                                onChange={e => setStatus(e.currentTarget.value as PackageStatus | '')}>
                            <option value="">Todos</option>
                            {PACKAGE_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col">
                        <label className="form-label">Origen</label>
                        <input className="form-control" value={origin}
                               onChange={e => setOrigin(e.currentTarget.value)}/>
                    </div>
                    <div className="col">
                        <label className="form-label">Destino</label>
                        <input className="form-control" value={destination}
                               onChange={e => setDestination(e.currentTarget.value)}/>
                    </div>
                    <div className="col">
                        <label className="form-label">Ubicación</label>
                        <input className="form-control" value={location}
                               onChange={e => setLocation(e.currentTarget.value)}/>
                    </div>
                    <div className="col">
                        <label className="form-label">Desde</label>
                        <input type="datetime-local" className="form-control" value={fromDate}
                               onChange={e => setFromDate(e.currentTarget.value)}/>
                    </div>
                    <div className="col">
                        <label className="form-label">Hasta</label>
                        <input type="datetime-local" className="form-control" value={toDate}
                               onChange={e => setToDate(e.currentTarget.value)}/>
                    </div>
                    <div className="col">
                        <label className="form-label">Items por página</label>
                        <select className="form-select" value={size}
                                onChange={e => setSize(Number(e.currentTarget.value))}>
                            {[10, 25, 50].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col d-flex gap-2">
                        <button className="btn btn-primary" type="submit">Buscar</button>
                        <button type="button" className="btn btn-secondary" onClick={resetFilters}>Limpiar</button>
                    </div>
                </form>

                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Origen</th>
                        <th>Destino</th>
                        <th>Estado</th>
                        <th>Última ubicación</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {packages.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-muted">
                                No hay paquetes disponibles.
                            </td>
                        </tr>
                    ) : (
                        packages.map(pkg => (
                            <tr key={pkg.id}>
                                <td>{pkg.id}</td>
                                <td>{pkg.origin}</td>
                                <td>{pkg.destination}</td>
                                <td>{pkg.status}</td>
                                <td>{pkg.lastLocation}</td>
                                <td>
                                    <Guard capability="VIEW_HISTORY">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleViewHistory(pkg.id)}
                                        >
                                            Ver Historial
                                        </button>
                                    </Guard>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>

                <div className="d-flex justify-content-between mt-3">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 0 || totalPages === 0}
                    >
                        Anterior
                    </button>
                    <span>Página {page + 1} de {totalPages}</span>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page + 1 >= totalPages || totalPages === 0}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </Guard>
    );
}
