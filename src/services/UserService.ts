import { BaseHttpService } from './BaseHttpService';

const BASE_URL = 'http://localhost:8082';

class UserService extends BaseHttpService {
    constructor() {
        super(BASE_URL);
    }

    getAllUsers(token: string) {
        return this.get<UserResponse[]>('/users', token);
    }

    getUserByEmail(email: string, token: string) {
        return this.get<UserResponse>(`/users/${email}`, token);
    }
}

export const userService = new UserService();

export interface UserResponse {
    email: string;
    enabled: boolean;
    roles: string[];
}
