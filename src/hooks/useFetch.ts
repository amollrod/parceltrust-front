import { useEffect, useState, useCallback } from 'preact/hooks';

export function useFetch<T = any>(url: string, options: RequestInit = {}) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        fetch(url, options)
            .then(async (res) => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                const json = await res.json();
                setData(json);
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, [url, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, retry: fetchData };
}
