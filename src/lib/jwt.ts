import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  institution_id?: string;
  institution_name?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Generate Access Token (15 minutes)
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
    issuer: 'garuda-scout',
    audience: 'garuda-scout-users',
  });
}

// Generate Refresh Token (7 days)
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
    issuer: 'garuda-scout',
    audience: 'garuda-scout-users',
  });
}

// Generate both tokens
export function generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// Verify Access Token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      issuer: 'garuda-scout',
      audience: 'garuda-scout-users',
    }) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Access token verification failed:', error);
    return null;
  }
}

// Verify Refresh Token
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET, {
      issuer: 'garuda-scout',
      audience: 'garuda-scout-users',
    }) as JWTPayload;
    return payload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Get token expiration time
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded.exp || null;
  } catch (error) {
    return null;
  }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return now >= exp;
}
