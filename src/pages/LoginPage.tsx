import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();

    const handleLogin = () => {
        // Esto redirige al Authorization Server (OAuth2)
        login();
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '500px' }}>
            <h2 className="mb-4">Iniciar sesión</h2>
            <p className="mb-3">
                Serás redirigido al servidor de autenticación para iniciar sesión.
            </p>
            <button onClick={handleLogin} className="btn btn-primary w-100">
                Iniciar sesión
            </button>
        </div>
    );
}
