import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const oidcClient = new UserManager({
    authority: "http://auth.localtest.me:8082",
    client_id: 'parceltrust-client',
    redirect_uri: "http://parceltrust.localtest.me/callback",
    silent_redirect_uri: "http://parceltrust.localtest.me/silent-renew",
    response_type: 'code',
    scope: 'openid',
    post_logout_redirect_uri: "http://parceltrust.localtest.me/",
    automaticSilentRenew: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
});

export default oidcClient;
