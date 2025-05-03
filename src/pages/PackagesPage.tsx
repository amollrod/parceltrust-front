import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'preact/hooks';
import { packageService, PackageResponse } from '../services/PackageService';
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
    const [totalPages, setTotalPages] = useState(0);

    const fetchPackages = () => {
        if (!token) return;
        setLoading(true);
        setError(null);

        packageService
            .searchPackages({ page, size: 10 }, token)
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
    }, [token, page]);

    const handleNext = () => {
        if (page + 1 < totalPages) setPage(p => p + 1);
    };

    const handlePrevious = () => {
        if (page > 0) setPage(p => p - 1);
    };

    const handleViewDetails = (id: string) => {
        navigate(`/packages/${id}`);
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="container mt-5 text-danger">Error: {error}</div>;

    return (
        <Guard capability="SEARCH_PACKAGES" showErrorMessage>
            <div className="container mt-5">
                <h2 className="mb-4">Paquetes del sistema</h2>

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
                                            onClick={() => handleViewDetails(pkg.id)}
                                        >
                                            Ver Detalles
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
                        onClick={handlePrevious}
                        disabled={page === 0 || totalPages === 0}
                    >
                        Anterior
                    </button>
                    <span>Página {page + 1} de {totalPages}</span>
                    <button
                        className="btn btn-outline-primary"
                        onClick={handleNext}
                        disabled={page + 1 >= totalPages || totalPages === 0}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </Guard>
    );
}
