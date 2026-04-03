import { Context, Next } from 'hono';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Type for the user payload we'll store in the context
export interface AuthUser {
  email: string;
  sub: string;
  name?: string;
}

// Function to get the JWKS (JSON Web Key Set) from Cloudflare
const getJWKS = (teamDomain: string) => {
  return createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
};

/**
 * Middleware to verify Cloudflare Access JWT.
 * In local development, it mocks a user if environment variables are missing.
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const teamDomain = c.env.CF_TEAM_DOMAIN;
  const aud = c.env.CF_ACCESS_AUD;

  // --- Local Development / Mock Mode (or Demo Mode when placeholders are present) ---
  const isPlaceholder = !teamDomain || !aud || teamDomain.includes('your-team') || aud.includes('your-app-aud');
  const token = c.req.header('Cf-Access-Jwt-Assertion');

  if (isPlaceholder || !token) {
    console.log('[Auth] Using Demo/Mock User mode');
    const mockUser: AuthUser = {
      email: 'admin@example.com',
      sub: 'demo-user-999',
      name: 'Muraoka Admin (Demo)'
    };
    c.set('user', mockUser);
    return await next();
  }

  try {
    const JWKS = getJWKS(teamDomain);
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${teamDomain}`,
      audience: aud,
    });

    // Extract user info from payload
    const user: AuthUser = {
      email: (payload.email as string) || '',
      sub: payload.sub || '',
      name: (payload.name as string) || '',
    };

    c.set('user', user);
    await next();
  } catch (err) {
    console.error('[Auth] JWT Verification failed:', err);
    return c.json({ error: 'Unauthorized: Invalid Access Token', details: err instanceof Error ? err.message : 'Unknown error' }, 403);
  }
};
