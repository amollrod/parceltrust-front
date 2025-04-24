import { render } from 'preact';
import 'bootstrap/dist/css/bootstrap.min.css';
import { App } from './app';
import { AuthProvider } from './context/AuthContext';

render(
    <AuthProvider>
        <App />
    </AuthProvider>,
    document.getElementById('app')!
);
