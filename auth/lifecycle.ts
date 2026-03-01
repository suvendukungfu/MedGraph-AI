import { handleOauthCallback } from './oauth_service';
import { createSession, getCurrentUser, logout as baseLogout } from './session_manager';
import { handleAuthError } from './error_handler';
import { validateToken, UserSession } from './token_validator';
import { getProfileByEmail } from './profiles';

/**
 * Silently exchange authorization code and create a session.
 * 
 * @param sessionId Unique identifier for the client session
 * @param authCode Authorization code returned by Google
 * @param state State parameter returned by Google
 */
export async function processOauthCallback(sessionId: string, authCode: string, state: string): Promise<void> {
    try {
        const userInfo = await handleOauthCallback(sessionId, authCode, state);

        // Role-based logic: Lookup existing profile
        const profile = getProfileByEmail(userInfo.email);

        if (!profile) {
            console.warn(`Unauthorized login attempt: ${userInfo.email}`);
            throw new Error(`Access Denied: No profile exists for ${userInfo.email}. Please contact the administrator.`);
        }

        // Enrich session with role and tenant info from the existing profile
        userInfo.role = profile.role;
        userInfo.tenantId = profile.tenantId;
        userInfo.name = profile.name;

        createSession(sessionId, userInfo);
    } catch (e) {
        handleAuthError(e);
        throw e;
    }
}

/**
 * Safe logout handling.
 * Clears session, removes tokens, resets lifecycle state.
 * 
 * @param sessionId Unique identifier for the client session
 */
export function logoutUser(sessionId: string): void {
    try {
        baseLogout(sessionId);
    } catch (e) {
        handleAuthError(e);
    }
}

/**
 * Optional Authentication Access.
 * Returns user object OR null. Never throws errors.
 * Automatically validates tokens and safely logs out if invalid.
 * 
 * @param sessionId Unique identifier for the client session
 */
export function getOptionalUser(sessionId: string): UserSession | null {
    try {
        const user = getCurrentUser(sessionId);
        if (!user) {
            return null;
        }

        if (!validateToken(user)) {
            logoutUser(sessionId);
            return null;
        }

        return user;
    } catch (e) {
        handleAuthError(e, () => logoutUser(sessionId));
        return null;
    }
}
