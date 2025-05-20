import { BaseHttpService } from './BaseHttpService';

const BASE_URL = 'http://auth.localtest.me:8082';
const USERS_RESOURCE = '/users';

class UserService extends BaseHttpService {
    constructor() {
        super(BASE_URL);
    }

    getAllUsers(token: string) {
        return this.get<UserResponse[]>(USERS_RESOURCE, token);
    }

    getUserByEmail(email: string, token: string) {
        return this.get<UserResponse>(`${USERS_RESOURCE}/${encodeURIComponent(email)}`, token);
    }

    createUser(data: CreateUserRequest, token: string) {
        return this.post<UserResponse>(USERS_RESOURCE, token, data);
    }

    updateUser(email: string, data: UpdateUserRequest, token: string) {
        return this.put<UserResponse>(`${USERS_RESOURCE}/${encodeURIComponent(email)}`, token, data);
    }

    deleteUser(email: string, token: string) {
        return this.delete<void>(`${USERS_RESOURCE}/${encodeURIComponent(email)}`, token);
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
