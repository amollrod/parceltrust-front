import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const oidcClient = new UserManager({
    authority: 'http://localhost:8082',
    client_id: 'parceltrust-client',
    redirect_uri: 'http://localhost:5173/callback',
    response_type: 'code',
    scope: 'openid',
    post_logout_redirect_uri: 'http://localhost:5173/',
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage })
});

export default oidcClient;
