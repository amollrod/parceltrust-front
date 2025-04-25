import { useFetch } from './useFetch';
import { useAuth } from '../context/AuthContext';

export function useAuthenticatedFetch<T = any>(url: string, options: RequestInit = {}) {
    const { token } = useAuth();

    const authOptions: RequestInit = {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    return useFetch<T>(url, authOptions);
}
