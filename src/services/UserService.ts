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
        return this.get<UserResponse>(`/users/${encodeURIComponent(email)}`, token);
    }

    createUser(data: CreateUserRequest, token: string) {
        return this.post<UserResponse>('/users', token, data);
    }

    updateUser(email: string, data: UpdateUserRequest, token: string) {
        return this.put<UserResponse>(`/users/${encodeURIComponent(email)}`, token, data);
    }

    deleteUser(email: string, token: string) {
        return this.delete<void>(`/users/${encodeURIComponent(email)}`, token);
    }
}

export const userService = new UserService();

export interface UserResponse {
    email: string;
    enabled: boolean;
    roles: string[];
}

export interface CreateUserRequest {
    email: string;
    password: string;
    roles?: string[];
}

export interface UpdateUserRequest {
    password?: string;
    enabled?: boolean;
    roles?: string[];
}
