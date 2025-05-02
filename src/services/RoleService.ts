import { BaseHttpService } from './BaseHttpService';

const BASE_URL = 'http://localhost:8082';

class RoleService extends BaseHttpService {
    constructor() {
        super(BASE_URL);
    }

    getAllRoles(token: string) {
        return this.get<RoleResponse[]>('/roles', token);
    }

    getRoleByName(name: string, token: string) {
        return this.get<RoleResponse>(`/roles/${encodeURIComponent(name)}`, token);
    }

    createRole(data: CreateRoleRequest, token: string) {
        return this.post<RoleResponse>('/roles', token, data);
    }

    updateRole(name: string, data: UpdateRoleRequest, token: string) {
        return this.put<RoleResponse>(`/roles/${encodeURIComponent(name)}`, token, data);
    }

    deleteRole(name: string, token: string) {
        return this.delete<void>(`/roles/${encodeURIComponent(name)}`, token);
    }
}

export const roleService = new RoleService();

export interface RoleResponse {
    name: string;
    capabilities: string[];
}

export interface CreateRoleRequest {
    name: string;
    capabilities?: string[];
}

export interface UpdateRoleRequest {
    capabilities: string[];
}
