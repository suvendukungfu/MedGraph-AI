/**
 * Parses the JWT from the `medgraph_token` cookie (client-readable, httpOnly=false).
 * Returns the decoded payload or null if missing/invalid.
 */
export type JwtCookiePayload = {
    sub?: string
    email?: string
    name?: string
    role?: string
    tenant_id?: string
    picture?: string
    exp?: number
}

const toJwtPayload = (value: unknown): JwtCookiePayload => {
    if (!value || typeof value !== 'object') return {}
    const obj = value as Record<string, unknown>

    return {
        sub: typeof obj.sub === 'string' ? obj.sub : undefined,
        email: typeof obj.email === 'string' ? obj.email : undefined,
        name: typeof obj.name === 'string' ? obj.name : undefined,
        role: typeof obj.role === 'string' ? obj.role : undefined,
        tenant_id: typeof obj.tenant_id === 'string' ? obj.tenant_id : undefined,
        picture: typeof obj.picture === 'string' ? obj.picture : undefined,
        exp: typeof obj.exp === 'number' ? obj.exp : undefined,
    }
}

export function parseJwtFromCookie(): JwtCookiePayload | null {
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
        const parsed = toJwtPayload(JSON.parse(json))

        // Check expiry
        const now = Math.floor(Date.now() / 1000)
        const exp = parsed.exp
        if (typeof exp === 'number' && exp < now) return null

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
