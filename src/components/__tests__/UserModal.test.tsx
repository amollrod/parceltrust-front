import { render, screen, fireEvent } from '@testing-library/preact';
import { vi, test, expect, beforeEach } from 'vitest';
import UserModal from '../UserModal';
import { AuthContext } from '../../context/AuthContext';

vi.mock('../../services/RoleService', async () => ({
    roleService: {
        getAllRoles: vi.fn().mockResolvedValue([
            { name: 'ADMIN', description: 'Admin' },
            { name: 'USER', description: 'User' },
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
            <UserModal
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

test('renderiza correctamente en modo create', async () => {
    renderModal();
    expect(await screen.findByText('Crear Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
});

test('no renderiza nada con show=false', () => {
    const { container } = renderModal({ show: false });
    expect(container).toBeEmptyDOMElement();
});

test('marca y desmarca roles al hacer clic', async () => {
    renderModal();
    const role = await screen.findByText('ADMIN');
    fireEvent.click(role); // selecciona
    expect(role).toHaveClass('bg-primary');
    fireEvent.click(role); // deselecciona
    expect(role).toHaveClass('bg-secondary');
});

test('envía el formulario correctamente en modo create', async () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.input(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' },
    });
    fireEvent.input(screen.getByLabelText('Password'), {
        target: { value: 'secret' },
    });

    const role = await screen.findByText('ADMIN');
    fireEvent.click(role);

    fireEvent.click(screen.getByText('Guardar'));

    expect(onSave).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'secret',
        roles: ['ADMIN'],
    });
});

test('renderiza correctamente el modo edit y cambia habilitado', async () => {
    renderModal({
        mode: 'edit',
        initialData: {
            email: 'edit@example.com',
            roles: ['USER'],
            enabled: false,
        },
    });

    expect(await screen.findByText('Editar Usuario')).toBeInTheDocument();
    const checkbox = screen.getByLabelText('Habilitado') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
});

test('llama a onClose al hacer clic en Cancelar', async () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(await screen.findByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
});
