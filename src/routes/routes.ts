export interface AppRoute {
    name: string;
    path: string;
    //  null o undefined si es pública; en caso contrario poner la capability requerida
    requireCapability?: string;
}

export const appRoutes: AppRoute[] = [
    {
        name: 'Inicio',
        path: '/',
        requireCapability: undefined,
    },
    {
        name: 'Paquetes',
        path: '/packages',
        requireCapability: 'SEARCH_PACKAGES',
    },
    {
        name: 'Usuarios',
        path: '/users',
        requireCapability: 'VIEW_USERS',
    },
    {
        name: 'Roles',
        path: '/roles',
        requireCapability: 'VIEW_ROLES',
    },
];
