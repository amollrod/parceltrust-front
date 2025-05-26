import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from 'preact/compat';
import { User } from 'oidc-client-ts';
import oidcClient from '../services/oidcClient';

interface OIDCProfile {
    sub: string;
    roles?: string[];
    capabilities?: string[];
    [key: string]: unknown;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    hasCapability: (cap: string) => boolean;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const token = user?.access_token || null;
    const isAuthenticated = !!user;

    const login = () => {
        oidcClient.signinRedirect();
    };

    const logout = () => {
        oidcClient.signoutRedirect();
    };

    const hasCapability = (cap: string) =>
        ((user?.profile as OIDCProfile)?.capabilities ?? []).includes(cap);

    const hasRole = (role: string) =>
        ((user?.profile as OIDCProfile)?.roles ?? []).includes(role);

    useEffect(() => {
        oidcClient.getUser().then((loadedUser) => {
            if (loadedUser) {
                const nowInSeconds = Math.floor(Date.now() / 1000);
                const tokenExpires = loadedUser.expires_at || 0;

                if (tokenExpires < nowInSeconds) {
                    console.warn('Access token expired, logging out.');
                    oidcClient.removeUser();
                    setUser(null);
                } else {
                    setUser(loadedUser);
                }
            }
            setIsLoading(false);
        });

        oidcClient.events.addUserLoaded((u) => {
            setUser(u);
            setIsLoading(false);
        });

        oidcClient.events.addUserUnloaded(() => {
            setUser(null);
            setIsLoading(false);
        });

        return () => {
            oidcClient.events.removeUserLoaded(setUser);
            oidcClient.events.removeUserUnloaded(() => setUser(null));
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isLoading,
                login,
                logout,
                hasCapability,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export { AuthContext };
