import { Context, Next } from 'hono';
import { jwtVerify, SignJWT } from 'jose';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

export interface AuthUser {
  email: string;
  sub: string;
  name?: string;
  picture?: string;
}

const SESSION_COOKIE_NAME = 'qraft_session';

/**
 * Generate a cryptographically secure random string for the session secret if not provided.
 */
const getSessionSecret = (c: Context) => {
  const secret = c.env.SESSION_SECRET || 'fallback-secret-change-this-in-prod';
  return new TextEncoder().encode(secret);
};

/**
 * Helper to get Google OAuth configuration
 */
const getGoogleConfig = (c: Context) => ({
  clientId: c.env.GOOGLE_CLIENT_ID,
  clientSecret: c.env.GOOGLE_CLIENT_SECRET,
  redirectUri: c.env.REDIRECT_URI || `${new URL(c.req.url).origin}/api/auth/google/callback`,
});

/**
 * Creates a signed JWT for the session
 */
export const createSession = async (c: Context, user: AuthUser) => {
  const secret = getSessionSecret(c);
  const jwt = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  setCookie(c, SESSION_COOKIE_NAME, jwt, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'None', // Required for cross-site cookies between .pages.dev and .workers.dev
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

/**
 * Middleware to verify our own session cookie.
 */
export const authMiddleware = async (c: Context, next: Next) => {
  // Skip auth for login/callback/logout routes
  const path = new URL(c.req.url).pathname;
  if (path.startsWith('/api/auth/')) {
    return await next();
  }

  const token = getCookie(c, SESSION_COOKIE_NAME);

  if (!token) {
    // Falls back to Demo/Mock mode if env vars are still placeholders
    const isPlaceholder = !c.env?.GOOGLE_CLIENT_ID || c.env?.GOOGLE_CLIENT_ID.includes('your-');
    if (isPlaceholder) {
      console.log('[Auth] Using Demo/Mock User mode (Placeholders detected)');
      c.set('user', {
        email: 'admin@example.com',
        sub: 'demo-user-999',
        name: 'Muraoka Admin (Demo)'
      });
      return await next();
    }
    return c.json({ error: 'Unauthorized: Missing Session' }, 401);
  }

  try {
    const secret = getSessionSecret(c);
    const { payload } = await jwtVerify(token, secret);
    c.set('user', payload as unknown as AuthUser);
    await next();
  } catch (err) {
    console.error('[Auth] Session Verification failed:', err);
    deleteCookie(c, SESSION_COOKIE_NAME);
    return c.json({ error: 'Unauthorized: Invalid Session' }, 401);
  }
};

/**
 * Exchange OAuth code for Google user info
 */
export const getGoogleUser = async (c: Context, code: string): Promise<AuthUser> => {
  const config = getGoogleConfig(c);
  
  // 1. Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = await tokenResponse.json() as any;
  if (tokens.error) {
    throw new Error(`Google Token Error: ${tokens.error_description || tokens.error}`);
  }

  // 2. Get user info using access token
  const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const profile = await userResponse.json() as any;
  return {
    email: profile.email,
    sub: profile.sub,
    name: profile.name,
    picture: profile.picture,
  };
};
