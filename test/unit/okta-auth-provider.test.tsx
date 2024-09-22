import { OktaAuth } from "@okta/okta-auth-js";
import { createAuthProvider } from "../../src/providers/auth-provider";

jest.mock("@okta/okta-auth-js", () => {
    return {
        OktaAuth: jest.fn().mockImplementation(() => ({
            signInWithRedirect: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn(),
            setOriginalUri: jest.fn(),
        })),
    };
});

describe("Okta Auth Provider", () => {
    let oktaAuth: jest.Mocked<OktaAuth>;
    let authProvider: ReturnType<typeof createAuthProvider>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create the mocked instance of OktaAuth
        oktaAuth = new OktaAuth({
            issuer: "https://your-okta-domain.okta.com/oauth2/default",
            clientId: "your-client-id",
            redirectUri: window.location.origin + "/callback",
        }) as jest.Mocked<OktaAuth>;

        // Inject the mocked OktaAuth instance into the authProvider
        authProvider = createAuthProvider(oktaAuth);
    });

    test("should successfully login with default parameters", async () => {
        oktaAuth.signInWithRedirect.mockResolvedValueOnce(undefined);

        const response = await authProvider.login({});

        expect(oktaAuth.signInWithRedirect).toHaveBeenCalledWith({
            scopes: ['openid', 'offline_access'],
            responseType: ['token', 'id_token'],
            state: expect.any(String), // Ensure state is a string
        });
        expect(response).toEqual({ success: true });
    });

    test("should successfully login with custom parameters", async () => {
        oktaAuth.signInWithRedirect.mockResolvedValueOnce(undefined);

        const customState = "customState";
        const response = await authProvider.login({
            redirectPath: "/dashboard",
            scopes: ["openid", "profile"],
            responseType: ["code"],
            state: customState,
        });

        expect(oktaAuth.setOriginalUri).toHaveBeenCalledWith("/dashboard");
        expect(oktaAuth.signInWithRedirect).toHaveBeenCalledWith({
            scopes: ["openid", "profile"],
            responseType: ["code"],
            state: customState, // Ensure the custom state is used
        });
        expect(response).toEqual({ success: true });
    });

    test("should handle error during login", async () => {
        const error = new Error("Login failed");
        oktaAuth.signInWithRedirect.mockRejectedValueOnce(error);

        const response = await authProvider.login({});

        expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
        expect(response).toEqual({
            success: false,
            error: new Error("Login failed: " + error.message),
        });
    });

    test("should handle unknown error during login", async () => {
        const error = { message: "Unknown error" };
        oktaAuth.signInWithRedirect.mockRejectedValueOnce(error);

        const response = await authProvider.login({});

        expect(oktaAuth.signInWithRedirect).toHaveBeenCalled();
        expect(response).toEqual({
            success: false,
            error: new Error("Login failed: Unknown error"),
        });
    });
});