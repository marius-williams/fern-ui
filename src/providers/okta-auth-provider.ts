import { AuthActionResponse, AuthProvider, CheckResponse, OnErrorResponse } from "@refinedev/core";
import { OktaAuth } from "@okta/okta-auth-js";

export const createAuthProvider = (oktaAuth: OktaAuth): AuthProvider => ({
    login: async (params: any): Promise<AuthActionResponse> => {
        try {
            // Function to generate a cryptographically secure state value
            const generateSecureState = (length = 16) => {
                const array = new Uint8Array(length);
                crypto.getRandomValues(array);
                return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
            };

            // Save the redirect path if provided
            if (params?.redirectPath) {
                oktaAuth.setOriginalUri(params.redirectPath);
            }

            // Customize the sign-in request with the state and other options
            const signInOptions = {
                scopes: params?.scopes || ['openid', 'offline_access'],
                responseType: params?.responseType || ['token', 'id_token'],
                state: params?.state || generateSecureState(),
            };

            // Initiate the login redirect with custom options
            await oktaAuth.signInWithRedirect(signInOptions);

            return { success: true };
        } catch (error) {
            // Handle errors during the sign-in process
            console.error("Login failed:", error);
            if (error instanceof Error) {
                return { success: false, error: new Error("Login failed: " + error.message) };
            } else {
                return { success: false, error: new Error("Login failed: Unknown error") };
            }
        }
    },
    logout: async (params: any): Promise<AuthActionResponse> => {
        try {
            await oktaAuth.signOut();
            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: new Error("Logout failed"),
            };
        }
    },
    check(params: any): Promise<CheckResponse> {
        return Promise.resolve({
            authenticated: false,
            redirectTo: "/login",
            error: new Error("User is not authenticated"),
        });
    },
    onError(error: any): Promise<OnErrorResponse> {
        return Promise.resolve({
            status: 500,
            error: new Error("An unexpected error occurred"),
            redirectTo: "/error-page",
        });
    },
    getPermissions: async () => {
        const user = await oktaAuth.getUser();
        return user?.groups || [];
    },
});

// Default instance for normal usage
export const oktaAuthProvider = createAuthProvider(
    new OktaAuth({
        issuer: "https://your-okta-domain.okta.com/oauth2/default",
        clientId: "your-client-id",
        redirectUri: window.location.origin + "/callback",
    })
);
