import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { vi, test, expect, beforeEach } from 'vitest';
import UsersPage from '../UsersPage';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../services/UserService';
import { type User } from 'oidc-client-ts';

vi.stubGlobal('alert', vi.fn());
vi.stubGlobal('confirm', vi.fn(() => true)); // para eliminar

vi.mock('../../services/UserService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../services/UserService')>();
    return {
        ...actual,
        userService: {
            ...actual.userService,
            getAllUsers: vi.fn(),
            getUserByEmail: vi.fn(),
            createUser: vi.fn(),
            updateUser: vi.fn(),
            deleteUser: vi.fn(),
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
        sub: 'user@example.com',
        capabilities,
        iss: 'http://localhost',
        aud: 'test',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
    },
});

const mockUser = { email: 'user@example.com', enabled: true, roles: ['ADMIN'] };

const renderPage = (
    capabilities = ['VIEW_USERS', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER'],
    users = [mockUser]
) => {
    vi.mocked(userService.getAllUsers).mockResolvedValue(users);

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
            <UsersPage />
        </AuthContext.Provider>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
});

test('Renderiza usuarios', async () => {
    renderPage();
    expect(await screen.findByText('user@example.com')).toBeInTheDocument();
});

test('Busca por email', async () => {
    vi.mocked(userService.getUserByEmail).mockResolvedValueOnce(mockUser);
    renderPage();

    await screen.findByPlaceholderText('Buscar por email');
    fireEvent.input(screen.getByPlaceholderText('Buscar por email'), {
        target: { value: 'user@example.com' },
    });

    await waitFor(() => {
        expect(userService.getUserByEmail).toHaveBeenCalledWith('user@example.com', 'mock-token');
        expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });
});

test('Usuario no encontrado', async () => {
    vi.mocked(userService.getUserByEmail).mockRejectedValueOnce(new Error('Not found'));
    renderPage();

    await screen.findByPlaceholderText('Buscar por email');
    fireEvent.input(screen.getByPlaceholderText('Buscar por email'), {
        target: { value: 'unknown@example.com' },
    });

    await waitFor(() => {
        expect(screen.getByText('Usuario no encontrado.')).toBeInTheDocument();
    });
});

test('Crear usuario abre el modal en modo create', async () => {
    renderPage();
    await screen.findByPlaceholderText('Buscar por email');
    fireEvent.click(screen.getByText('Nuevo Usuario'));
    expect(await screen.findByText('Crear Usuario')).toBeInTheDocument();
});

test('Editar usuario abre el modal con datos', async () => {
    renderPage();

    await screen.findByText('Editar');
    fireEvent.click(screen.getByText('Editar'));

    expect(await screen.findByText('Editar Usuario')).toBeInTheDocument();
});

test('Eliminar usuario llama a deleteUser si se confirma', async () => {
    vi.mocked(userService.deleteUser).mockResolvedValueOnce();
    renderPage();

    await screen.findByText('Eliminar');
    fireEvent.click(screen.getByText('Eliminar'));

    await waitFor(() => {
        expect(userService.deleteUser).toHaveBeenCalledWith('user@example.com', 'mock-token');
    });
});

test('Botones no aparecen sin permisos', async () => {
    renderPage(['VIEW_USERS']); // puede ver, pero no crear, editar ni eliminar

    expect(await screen.findByPlaceholderText('Buscar por email')).toBeInTheDocument();
    expect(screen.queryByText('Nuevo Usuario')).not.toBeInTheDocument();
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
    expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
});

test('Sin permisos muestra mensaje de acceso denegado', async () => {
    renderPage([]); // sin permisos

    expect(await screen.findByText('No tienes permiso para acceder a esta sección.')).toBeInTheDocument();
});
