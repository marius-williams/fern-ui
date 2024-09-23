interface Config {
    OKTA_ISSUER: string;
    OKTA_CLIENT_ID: string;
    OKTA_REDIRECT_URI: string;
}

const oktaConfig: Config = {
    OKTA_ISSUER: process.env.FERN_UI_OKTA_ISSUER || 'https://default-okta-issuer.com',
    OKTA_CLIENT_ID: process.env.FERN_UI_OKTA_CLIENT_ID || 'default-client-id',
    OKTA_REDIRECT_URI: process.env.FERN_UI_OKTA_REDIRECT_URI || 'http://localhost:3000/callback',
};

export default oktaConfig;
