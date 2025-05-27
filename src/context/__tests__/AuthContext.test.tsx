import {fireEvent, render, screen, waitFor} from '@testing-library/preact';
import { test, vi, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { type User } from 'oidc-client-ts';

vi.mock('../../services/oidcClient', async () => ({
    default: {
        getUser: vi.fn(),
        signinRedirect: vi.fn(),
        signoutRedirect: vi.fn(),
        removeUser: vi.fn(),
        events: {
            addUserLoaded: vi.fn(),
            addUserUnloaded: vi.fn(),
            removeUserLoaded: vi.fn(),
            removeUserUnloaded: vi.fn(),
        },
    },
}));

import oidcClient from '../../services/oidcClient';

const createMockUser = (overrides: Partial<User> = {}): User => ({
    access_token: 'mock-token',
    token_type: 'Bearer',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    expired: false,
    scope: 'openid',
    scopes: ['openid'],
    session_state: 'xyz',
    profile: {
        sub: 'test@example.com',
        capabilities: ['CAN_VIEW'],
        roles: ['ADMIN'],
        iss: 'http://localhost',
        aud: 'test',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
    },
    state: null,
    toStorageString: () => '{}',
    ...overrides,
});

const ConsumerComponent = () => {
    const { isAuthenticated, user, token, login, logout, hasCapability, hasRole } = useAuth();

    return (
        <>
            <p>isAuthenticated: {String(isAuthenticated)}</p>
            <p>token: {token}</p>
            <p>hasCapability: {String(hasCapability('CAN_VIEW'))}</p>
            <p>hasRole: {String(hasRole('ADMIN'))}</p>
            <button onClick={login}>login</button>
            <button onClick={logout}>logout</button>
            <p>{user?.profile?.sub}</p>
        </>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
});

test('renderiza el contexto con usuario cargado', async () => {
    vi.mocked(oidcClient.getUser).mockResolvedValue(createMockUser());

    render(
        <AuthProvider>
            <ConsumerComponent />
        </AuthProvider>
    );

    await waitFor(() => {
        expect(screen.getByText('isAuthenticated: true')).toBeInTheDocument();
        expect(screen.getByText('token: mock-token')).toBeInTheDocument();
        expect(screen.getByText('hasCapability: true')).toBeInTheDocument();
        expect(screen.getByText('hasRole: true')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
});

test('llama a login y logout correctamente', async () => {
    vi.mocked(oidcClient.getUser).mockResolvedValue(null);

    render(
        <AuthProvider>
            <ConsumerComponent />
        </AuthProvider>
    );

    fireEvent.click(screen.getByText('login'));
    fireEvent.click(screen.getByText('logout'));

    expect(oidcClient.signinRedirect).toHaveBeenCalled();
    expect(oidcClient.signoutRedirect).toHaveBeenCalled();
});
