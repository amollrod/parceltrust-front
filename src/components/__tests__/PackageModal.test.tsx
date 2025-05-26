import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { vi, test, expect, beforeEach } from 'vitest';
import PackageModal from '../PackageModal';
import { AuthContext } from '../../context/AuthContext';
import { packageService } from '../../services/PackageService';

vi.mock('../../services/PackageService', async () => {
    return {
        packageService: {
            createPackage: vi.fn(),
        },
    };
});

const mockToken = 'mock-token';

const renderModal = (props = {}) => {
    const defaultProps = {
        show: true,
        onClose: vi.fn(),
        onSuccess: vi.fn(),
    };

    const context = {
        user: null,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        hasCapability: vi.fn(),
        hasRole: vi.fn(),
    };

    return render(
        <AuthContext.Provider value={context}>
            <PackageModal {...defaultProps} {...props} />
        </AuthContext.Provider>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
});

test('renderiza correctamente con show=true', () => {
    renderModal();
    expect(screen.getByText('Crear Paquete')).toBeInTheDocument();
});

test('no renderiza nada con show=false', () => {
    const { container } = renderModal({ show: false });
    expect(container).toBeEmptyDOMElement();
});

test('llama a onClose al hacer clic en "Cancelar"', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
});

test('envía los datos al backend al hacer submit', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    renderModal({ onSuccess, onClose });

    fireEvent.input(screen.getByLabelText('Origen'), {
        target: { value: 'Madrid' },
    });
    fireEvent.input(screen.getByLabelText('Destino'), {
        target: { value: 'Barcelona' },
    });

    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => {
        expect(packageService.createPackage).toHaveBeenCalledWith(
            { origin: 'Madrid', destination: 'Barcelona' },
            mockToken
        );
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
});

test('muestra un mensaje de error si el backend falla', async () => {
    vi.mocked(packageService.createPackage).mockRejectedValueOnce(new Error('Error de red'));

    renderModal();

    fireEvent.input(screen.getByLabelText('Origen'), {
        target: { value: 'Madrid' },
    });
    fireEvent.input(screen.getByLabelText('Destino'), {
        target: { value: 'Barcelona' },
    });

    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => {
        expect(screen.getByText(/error de red/i)).toBeInTheDocument();
    });
});
