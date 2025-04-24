import { useEffect } from 'preact/hooks';
import { useNavigate } from 'react-router-dom';
import oidcClient from '../services/oidcClient';

export default function CallbackPage() {
    const navigate = useNavigate();

    useEffect(() => {
        oidcClient
            .signinRedirectCallback()
            .then(() => {
                navigate('/');
            })
            .catch((err) => {
                console.error('Error processing callback:', err);
                navigate('/login');
            });
    }, []);

    return (
        <div className="container mt-5">
            <h1>Procesando autenticación...</h1>
        </div>
    );
}
