import { render, screen, fireEvent, waitFor } from '@testing-library/preact';
import { vi, test, expect, beforeEach } from 'vitest';
import UpdateStatusForm from '../UpdateStatusForm';
import {packageService, PackageStatus} from '../../services/PackageService';

vi.mock('../../services/PackageService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../services/PackageService')>();
    return {
        ...actual,
        packageService: {
            updatePackageStatus: vi.fn(),
        },
    };
});

const defaultProps = {
    id: 'pkg123',
    token: 'fake-token',
    currentStatus: 'IN_TRANSIT' as PackageStatus,
    currentLocation: 'Valencia',
    onSuccess: vi.fn(),
};

beforeEach(() => {
    vi.clearAllMocks();
});

test('renderiza con estado inicial correcto', () => {
    render(<UpdateStatusForm {...defaultProps} />);
    expect(screen.getByDisplayValue('IN_TRANSIT')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Valencia')).toBeInTheDocument();
});

test('permite cambiar el estado y la ubicación', () => {
    render(<UpdateStatusForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Nuevo Estado'), {
        target: { value: 'DELIVERED' },
    });
    fireEvent.change(screen.getByLabelText('Ubicación'), {
        target: { value: 'Madrid' },
    });

    expect(screen.getByDisplayValue('DELIVERED')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Madrid')).toBeInTheDocument();
});

test('envía datos correctos y llama a onSuccess', async () => {
    const onSuccess = vi.fn();
    render(<UpdateStatusForm {...defaultProps} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText('Nuevo Estado'), {
        target: { value: 'DELIVERED' },
    });
    fireEvent.change(screen.getByLabelText('Ubicación'), {
        target: { value: 'Madrid' },
    });

    fireEvent.click(screen.getByText('Actualizar Estado'));

    await waitFor(() => {
        expect(packageService.updatePackageStatus).toHaveBeenCalledWith(
            'pkg123',
            'DELIVERED',
            'Madrid',
            'fake-token'
        );
        expect(onSuccess).toHaveBeenCalledWith('DELIVERED', 'Madrid');
    });
});

test('muestra mensaje de error si la llamada falla', async () => {
    vi.mocked(packageService.updatePackageStatus).mockRejectedValueOnce(new Error('Mock error en test'));

    render(<UpdateStatusForm {...defaultProps} />);

    fireEvent.click(screen.getByText('Actualizar Estado'));

    await waitFor(() => {
        expect(screen.getByText(/error al actualizar/i)).toBeInTheDocument();
    });
});

test('deshabilita los campos y el botón si disabled=true', () => {
    render(<UpdateStatusForm {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText('Nuevo Estado')).toBeDisabled();
    expect(screen.getByLabelText('Ubicación')).toBeDisabled();
    expect(screen.getByText('Actualizar Estado')).toBeDisabled();
});
