/**
 * Parses the JWT from the `medgraph_token` cookie (client-readable, httpOnly=false).
 * Returns the decoded payload or null if missing/invalid.
 */
export function parseJwtFromCookie(): Record<string, any> | null {
    try {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('medgraph_token='))
            ?.split('=')[1]

        if (!token) return null

        // JWT payload is base64url-encoded in the middle segment
        const payloadB64 = token.split('.')[1]
        if (!payloadB64) return null

        const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
        const parsed = JSON.parse(json)

        // Check expiry
        const now = Math.floor(Date.now() / 1000)
        if (parsed.exp && parsed.exp < now) return null

        return parsed
    } catch {
        return null
    }
}

/**
 * Returns the raw JWT string from the cookie, or null.
 */
export function getRawJwt(): string | null {
    return (
        document.cookie
            .split('; ')
            .find(row => row.startsWith('medgraph_token='))
            ?.split('=')[1] ?? null
    )
}

/**
 * Clears the auth cookie.
 */
export function clearAuthCookie() {
    document.cookie = 'medgraph_token=; Max-Age=0; path=/'
}
