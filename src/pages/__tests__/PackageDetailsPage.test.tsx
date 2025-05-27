import { render, screen } from '@testing-library/preact';
import { vi, test, expect, beforeEach, afterEach } from 'vitest';
import PackageDetailsPage from '../PackageDetailsPage';
import { AuthContext } from '../../context/AuthContext';
import { packageService, PackageHistoryResponse } from '../../services/PackageService';
import { type User } from 'oidc-client-ts';

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useParams: () => ({ id: 'PKG001' }),
    };
});

vi.mock('../../services/PackageService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../services/PackageService')>();
    return {
        ...actual,
        packageService: {
            ...actual.packageService,
            findPackage: vi.fn(),
            getPackageHistory: vi.fn(),
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
    lastTimestamp: Math.floor(Date.now() / 1000),
};

const baseTime = Math.floor(Date.now() / 1000);
const mockHistory: PackageHistoryResponse[] = [
    { status: 'IN_TRANSIT', location: 'Zaragoza', timestamp: baseTime + 100 },
    { status: 'CREATED', location: 'Madrid', timestamp: baseTime },
];

const renderPage = (capabilities = ['VIEW_HISTORY', 'UPDATE_STATUS']) => {
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
            <PackageDetailsPage />
        </AuthContext.Provider>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

test('Renderiza correctamente los detalles y el historial', async () => {
    vi.mocked(packageService.findPackage).mockResolvedValueOnce(mockPackage);
    vi.mocked(packageService.getPackageHistory).mockResolvedValueOnce(mockHistory);

    renderPage();

    expect(await screen.findByText(/Detalles del Paquete/)).toBeInTheDocument();
    expect(screen.getByText('PKG001')).toBeInTheDocument();

    const madridNodes = await screen.findAllByText('Madrid');
    expect(madridNodes.length).toBeGreaterThanOrEqual(2);
});

test('Muestra error si falla findPackage', async () => {
    vi.mocked(packageService.findPackage).mockRejectedValueOnce(new Error('fetch failed'));
    vi.mocked(packageService.getPackageHistory).mockResolvedValueOnce(mockHistory);

    renderPage();
    expect(await screen.findByText(/Error al cargar los detalles/i)).toBeInTheDocument();
});

test('Muestra error si falla getPackageHistory', async () => {
    vi.mocked(packageService.findPackage).mockResolvedValueOnce(mockPackage);
    vi.mocked(packageService.getPackageHistory).mockRejectedValueOnce(new Error('historial error'));

    renderPage();
    expect(await screen.findByText(/Error al cargar el historial/i)).toBeInTheDocument();
});

test('Muestra "Fecha desconocida" si timestamp es inválido', async () => {
    vi.mocked(packageService.findPackage).mockResolvedValueOnce(mockPackage);
    vi.mocked(packageService.getPackageHistory).mockResolvedValueOnce([
        { status: 'CREATED', location: 'Madrid', timestamp: 0 },
    ]);

    renderPage();
    expect(await screen.findByText('Fecha desconocida')).toBeInTheDocument();
});

test('Oculta formulario si no tiene UPDATE_STATUS', async () => {
    vi.mocked(packageService.findPackage).mockResolvedValueOnce(mockPackage);
    vi.mocked(packageService.getPackageHistory).mockResolvedValueOnce(mockHistory);

    renderPage(['VIEW_HISTORY']);
    expect(await screen.findByText('PKG001')).toBeInTheDocument();
    expect(screen.queryByText('Actualizar Estado')).not.toBeInTheDocument();
});