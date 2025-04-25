const BASE_URL = 'http://localhost:8082';

export const UserService = {
    async getAllUsers(token: string): Promise<UserResponse[]> {
        const res = await fetch(`${BASE_URL}/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Error fetching users: ${res.status}`);
        }

        return res.json();
    },

    async getUserByEmail(email: string, token: string): Promise<UserResponse> {
        const res = await fetch(`${BASE_URL}/users/${email}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Error fetching user: ${res.status}`);
        }

        return res.json();
    },
};

export interface UserResponse {
    email: string;
    enabled: boolean;
    roles: string[];
}
