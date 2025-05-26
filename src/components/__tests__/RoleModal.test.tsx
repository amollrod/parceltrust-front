import { render, screen, fireEvent } from '@testing-library/preact';
import { test, expect, vi, beforeEach } from 'vitest';
import RoleModal from '../RoleModal';
import { AuthContext } from '../../context/AuthContext';

vi.mock('../../services/RoleService', async () => ({
    roleService: {
        getAllCapabilities: vi.fn().mockResolvedValue([
            { name: 'CAN_EDIT', description: 'Puede editar' },
            { name: 'CAN_DELETE', description: 'Puede borrar' },
        ]),
    },
}));

const mockContext = {
    user: null,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    hasCapability: vi.fn(),
    hasRole: vi.fn(),
};

const renderModal = (props = {}) =>
    render(
        <AuthContext.Provider value={mockContext}>
            <RoleModal
                show={true}
                mode="create"
                onClose={vi.fn()}
                onSave={vi.fn()}
                {...props}
            />
        </AuthContext.Provider>
    );

beforeEach(() => {
    vi.clearAllMocks();
});

test('renderiza correctamente en modo creación', async () => {
    renderModal();

    expect(await screen.findByText('Crear Rol')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del rol')).toBeInTheDocument();
    expect(screen.getByText('CAN_EDIT')).toBeInTheDocument();
});

test('no renderiza nada si show=false', () => {
    const { container } = renderModal({ show: false });
    expect(container).toBeEmptyDOMElement();
});

test('marca una capacidad al hacer clic', async () => {
    renderModal();
    const cap = await screen.findByText('CAN_EDIT');
    fireEvent.click(cap);
    expect(cap).toHaveClass('bg-primary');
});

test('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.click(await screen.findByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
});

test('llama a onSave con los datos correctos al hacer submit', async () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.input(screen.getByLabelText('Nombre del rol'), {
        target: { value: 'Admin' },
    });

    const cap = await screen.findByText('CAN_EDIT');
    fireEvent.click(cap);

    fireEvent.click(screen.getByText('Guardar'));

    expect(onSave).toHaveBeenCalledWith({
        name: 'Admin',
        capabilities: ['CAN_EDIT'],
    });
});
