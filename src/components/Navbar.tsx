import { appRoutes } from '../routes/routes';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const { isAuthenticated, user, hasCapability, logout, login } = useAuth();

    const filteredRoutes = appRoutes.filter(route => {
        if (!route.requireCapability) return true;
        return hasCapability(route.requireCapability);
    });

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
            <Link className="navbar-brand fw-bold text-info" to="/">
                ParcelTrust
            </Link>

            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarContent"
                aria-controls="navbarContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    {filteredRoutes.map(route => (
                        <li key={route.path} className="nav-item">
                            <Link className="nav-link" to={route.path}>
                                {route.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="d-flex align-items-center">
                    {isAuthenticated ? (
                        <div className="dropdown">
                            <button
                                className="btn btn-dark dropdown-toggle"
                                type="button"
                                id="userDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="bi bi-person-circle me-1"></i> {user?.profile?.sub}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="userDropdown">
                                <li>
                                    <button className="dropdown-item" onClick={logout}>
                                        Cerrar sesión
                                    </button>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <button className="btn btn-dark" onClick={login}>
                            Iniciar sesión
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
