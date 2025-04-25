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
        <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
            <Link className="navbar-brand" to="/">
                ParcelTrust
            </Link>

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
                            className="btn btn-outline-secondary dropdown-toggle"
                            type="button"
                            id="userDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            {user?.profile?.sub}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                            <li><button className="dropdown-item" onClick={logout}>Cerrar sesión</button></li>
                        </ul>
                    </div>
                ) : (
                    <button className="btn btn-outline-primary" onClick={login}>
                        Iniciar sesión
                    </button>
                )}
            </div>
        </nav>
    );
}
