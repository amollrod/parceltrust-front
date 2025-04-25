import { useEffect } from 'preact/hooks';
import oidcClient from '../services/oidcClient';

export default function SilentRenewPage() {
    useEffect(() => {
        oidcClient.signinSilentCallback();
    }, []);

    return <div>Procesando renovación silenciosa...</div>;
}
