import { BaseHttpService } from './BaseHttpService';

const BASE_URL = 'http://localhost:8082';

class RoleService extends BaseHttpService {
    constructor() {
        super(BASE_URL);
    }

    getAllRoles(token: string) {
        return this.get<RoleResponse[]>('/roles', token);
    }
}

export const roleService = new RoleService();

export interface RoleResponse {
    name: string;
    capabilities: string[];
}
