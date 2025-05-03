export class BaseHttpService {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    protected get<T>(path: string, token: string): Promise<T> {
        return this.request<T>('GET', path, token);
    }

    protected post<T>(path: string, token: string, body?: any): Promise<T> {
        return this.request<T>('POST', path, token, body);
    }

    protected put<T>(path: string, token: string, body?: any): Promise<T> {
        return this.request<T>('PUT', path, token, body);
    }

    protected delete<T>(path: string, token: string): Promise<T> {
        return this.request<T>('DELETE', path, token);
    }

    protected patch<T>(path: string, token: string, body?: any): Promise<T> {
        return this.request<T>('PATCH', path, token, body);
    }

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        path: string,
        token: string,
        body?: any
    ): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
            const contentType = res.headers.get('content-type');
            const errorPayload = contentType?.includes('application/json')
                ? await res.json()
                : await res.text();
            throw new Error(`HTTP ${res.status}: ${JSON.stringify(errorPayload)}`);
        }

        if (res.status === 204 || res.headers.get('content-length') === '0') {
            return undefined as T;
        }

        return res.json();
    }
}
