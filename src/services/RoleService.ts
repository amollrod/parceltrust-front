import { BaseHttpService } from './BaseHttpService';

const BASE_URL = 'http://localhost:8082';
const ROLES_RESOURCE = '/roles';
const CAPABILITIES_RESOURCE = '/capabilities';

class RoleService extends BaseHttpService {
    constructor() {
        super(BASE_URL);
    }

    getAllRoles(token: string) {
        return this.get<RoleResponse[]>(ROLES_RESOURCE, token);
    }

    getAllCapabilities(token: string): Promise<CapabilityResponse[]> {
        return this.get<CapabilityResponse[]>(CAPABILITIES_RESOURCE, token);
    }

    getRoleByName(name: string, token: string) {
        return this.get<RoleResponse>(`${ROLES_RESOURCE}/${encodeURIComponent(name)}`, token);
    }

    createRole(data: CreateRoleRequest, token: string) {
        return this.post<RoleResponse>(ROLES_RESOURCE, token, data);
    }

    updateRole(name: string, data: UpdateRoleRequest, token: string) {
        return this.put<RoleResponse>(`${ROLES_RESOURCE}/${encodeURIComponent(name)}`, token, data);
    }

    deleteRole(name: string, token: string) {
        return this.delete<void>(`${ROLES_RESOURCE}/${encodeURIComponent(name)}`, token);
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

export interface CapabilityResponse {
    name: string;
    description: string;
}
