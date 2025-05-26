import { render, screen } from '@testing-library/preact';
import { test, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';

test('renderiza el spinner con rol status y texto accesible', () => {
    render(<LoadingSpinner />);

    // Comprueba que hay un elemento con role="status"
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();

    // Comprueba que incluye el texto accesible "Cargando..."
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
});
