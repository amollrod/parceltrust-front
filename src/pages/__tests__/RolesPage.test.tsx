import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { vi, test, expect, beforeEach } from 'vitest';
import RolesPage from '../RolesPage';
import { AuthContext } from '../../context/AuthContext';
import { roleService } from '../../services/RoleService';
import { type User } from 'oidc-client-ts';

vi.stubGlobal('alert', vi.fn());
vi.stubGlobal('confirm', vi.fn(() => true));

vi.mock('../../services/RoleService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../services/RoleService')>();
    return {
        ...actual,
        roleService: {
            ...actual.roleService,
            getAllRoles: vi.fn(),
            getAllCapabilities: vi.fn().mockResolvedValue([]),
            createRole: vi.fn(),
            updateRole: vi.fn(),
            deleteRole: vi.fn(),
        },
    };
});

const createMockUser = (capabilities: string[]): User => ({
    access_token: 'mock-token',
    token_type: 'Bearer',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    expired: false,
    scope: 'openid',
    scopes: ['openid'],
    session_state: 'xyz',
    state: null,
    toStorageString: () => '{}',
    profile: {
        sub: 'admin@example.com',
        capabilities,
        iss: 'http://localhost',
        aud: 'test',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
    },
});

const mockRole = {
    name: 'ADMIN',
    description: 'Administrador del sistema',
    capabilities: ['CAN_EDIT', 'CAN_DELETE'],
};

const renderPage = (
    capabilities = ['VIEW_ROLES', 'CREATE_ROLE', 'UPDATE_ROLE', 'DELETE_ROLE'],
    roles = [mockRole]
) => {
    vi.mocked(roleService.getAllRoles).mockResolvedValue(roles);

    const context = {
        user: createMockUser(capabilities),
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        hasCapability: vi.fn((cap) => capabilities.includes(cap)),
        hasRole: vi.fn(),
    };

    return render(
        <AuthContext.Provider value={context}>
            <RolesPage />
        </AuthContext.Provider>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
});

test('Renderiza roles', async () => {
    renderPage();
    expect(await screen.findByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('CAN_EDIT')).toBeInTheDocument();
    expect(screen.getByText('CAN_DELETE')).toBeInTheDocument();
});

test('Crear rol abre el modal en modo create', async () => {
    renderPage();
    fireEvent.click(await screen.findByText('Nuevo Rol'));
    expect(await screen.findByText('Crear Rol')).toBeInTheDocument();
});

test('Editar rol abre el modal con datos', async () => {
    renderPage();
    fireEvent.click(await screen.findByText('Editar'));
    expect(await screen.findByText('Editar Rol')).toBeInTheDocument();
});

test('Eliminar rol llama a deleteRole si se confirma', async () => {
    vi.mocked(roleService.deleteRole).mockResolvedValueOnce();
    renderPage();
    fireEvent.click(await screen.findByText('Eliminar'));
    await waitFor(() => {
        expect(roleService.deleteRole).toHaveBeenCalledWith('ADMIN', 'mock-token');
    });
});

test('Botones no aparecen sin permisos', async () => {
    renderPage(['VIEW_ROLES']); // sin permisos de edición
    expect(await screen.findByText('ADMIN')).toBeInTheDocument();
    expect(screen.queryByText('Nuevo Rol')).not.toBeInTheDocument();
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
});

test('Muestra mensaje si no se tiene VIEW_ROLES', async () => {
    renderPage([]); // sin permisos
    expect(await screen.findByText('No tienes permiso para acceder a esta sección.')).toBeInTheDocument();
});

test('Muestra mensaje si getAllRoles falla', async () => {
    vi.mocked(roleService.getAllRoles).mockRejectedValueOnce(new Error('fetch failed'));
    renderPage(['VIEW_ROLES']);
    expect(await screen.findByText(/fetch failed/i)).toBeInTheDocument();
});
