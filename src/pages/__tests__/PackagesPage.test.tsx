import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { vi, test, expect, beforeEach } from 'vitest';
import PackagesPage from '../PackagesPage';
import { AuthContext } from '../../context/AuthContext';
import { packageService } from '../../services/PackageService';
import { type User } from 'oidc-client-ts';

vi.stubGlobal('alert', vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

vi.mock('../../services/PackageService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../services/PackageService')>();
    return {
        ...actual,
        packageService: {
            ...actual.packageService,
            searchPackages: vi.fn(),
        },
    };
});

const createMockUser = (capabilities: string[]): User => ({
    access_token: 'mock-token',
    token_type: 'Bearer',
    expires_at: Date.now() + 3600,
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
        exp: Date.now() + 3600,
        iat: Date.now(),
    },
});

const mockPackage = {
    id: 'PKG001',
    status: 'CREATED' as const,
    origin: 'Madrid',
    destination: 'Barcelona',
    currentLocation: 'Madrid',
    createdAt: new Date().toISOString(),
    lastLocation: 'Madrid',
    lastTimestamp: Date.now(),
};

const createMockResponse = (packages = [mockPackage]) => ({
    content: packages,
    totalElements: packages.length,
    totalPages: 1,
    size: 10,
    number: 0,
    last: true,
    first: true,
    numberOfElements: packages.length,
    empty: packages.length === 0,
    pageable: {
        sort: { sorted: false, unsorted: true, empty: true },
        pageNumber: 0,
        pageSize: 10,
        offset: 0,
        paged: true,
        unpaged: false,
    },
    sort: { sorted: false, unsorted: true, empty: true },
});

const renderPage = (
    capabilities = ['SEARCH_PACKAGES', 'CREATE_PACKAGE', 'VIEW_HISTORY'],
    packages = [mockPackage]
) => {
    vi.mocked(packageService.searchPackages).mockResolvedValue(createMockResponse(packages));

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
            <PackagesPage />
        </AuthContext.Provider>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
});

test('Carga inicial de paquetes', async () => {
    renderPage();
    expect(await screen.findByText('PKG001')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'CREATED' })).toBeInTheDocument();
});

test('Aplica filtros y busca', async () => {
    renderPage();

    await screen.findByText('PKG001');

    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects[0];
    fireEvent.change(statusSelect, { target: { value: 'DELIVERED' } });

    const originInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(originInput, { target: { value: 'Madrid' } });

    fireEvent.click(screen.getByText('Buscar'));

    await waitFor(() => {
        expect(packageService.searchPackages).toHaveBeenCalled();
    });
});

test('Crear paquete abre modal', async () => {
    renderPage();

    fireEvent.click(await screen.findByText('Crear Paquete'));

    expect(await screen.findByRole('heading', { name: 'Crear Paquete' })).toBeInTheDocument();
    expect(screen.getByLabelText('Origen', { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
});

test('Muestra mensaje si no hay paquetes', async () => {
    renderPage(['SEARCH_PACKAGES'], []);
    expect(await screen.findByText('No hay paquetes disponibles.')).toBeInTheDocument();
});

test('Muestra mensaje si no se tiene permiso', async () => {
    renderPage([]);
    expect(await screen.findByText('No tienes permiso para acceder a esta sección.')).toBeInTheDocument();
});

test('Muestra error si falla searchPackages', async () => {
    vi.mocked(packageService.searchPackages).mockRejectedValueOnce(new Error('fetch failed'));
    renderPage(['SEARCH_PACKAGES']);
    expect(await screen.findByText(/fetch failed/i)).toBeInTheDocument();
});

test('Botones no aparecen sin permiso de creación', async () => {
    renderPage(['SEARCH_PACKAGES']);
    expect(await screen.findByText('PKG001')).toBeInTheDocument();
    expect(screen.queryByText('Crear Paquete')).not.toBeInTheDocument();
});
