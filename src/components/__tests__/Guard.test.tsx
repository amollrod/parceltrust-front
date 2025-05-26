import { render, screen } from '@testing-library/preact';
import { vi, test, expect, describe } from 'vitest';
import Guard from '../Guard';
import { AuthContext } from '../../context/AuthContext';

describe('Guard', () => {
    const setup = (hasCap: boolean, props: Partial<Parameters<typeof Guard>[0]> = {}) => {
        const mockContext = {
            user: null,
            token: null,
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            hasCapability: vi.fn().mockReturnValue(hasCap),
            hasRole: vi.fn(),
        };

        return render(
            <AuthContext.Provider value={mockContext}>
                <Guard capability="CAN_EDIT" {...props}>
                    <p>Contenido protegido</p>
                </Guard>
            </AuthContext.Provider>
        );
    };

    test('renderiza los children si el usuario tiene la capability', () => {
        setup(true);
        expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
    });

    test('renderiza el fallback si el usuario NO tiene la capability', () => {
        setup(false, { fallback: <p>No autorizado</p> });
        expect(screen.getByText('No autorizado')).toBeInTheDocument();
    });

    test('renderiza el mensaje de error si showErrorMessage es true y no tiene capability', () => {
        setup(false, { showErrorMessage: true });
        expect(screen.getByText(/no tienes permiso/i)).toBeInTheDocument();
    });

    test('no renderiza nada si no tiene capability y no se pasa fallback ni error', () => {
        const { container } = setup(false);
        expect(container).toBeEmptyDOMElement();
    });
});
