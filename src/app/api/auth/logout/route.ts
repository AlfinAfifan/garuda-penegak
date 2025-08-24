import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/jwt';
import connect from '@/lib/db';
import User from '@/lib/modals/user';

export async function POST(req: NextRequest) {
  try {
    await connect();

    // Get access token from Authorization header
    const authHeader = req.headers.get('authorization');
    const accessToken = extractTokenFromHeader(authHeader);

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token tidak ditemukan' }, { status: 401 });
    }

    // Verify access token
    const payload = verifyAccessToken(accessToken);

    if (payload) {
      // Clear refresh token from database
      await User.findByIdAndUpdate(payload.id, {
        refresh_token: null,
      });
    }

    // Create response
    const response = NextResponse.json({
      message: 'Logout berhasil',
    });

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);

    // Even if there's an error, clear the cookie
    const response = NextResponse.json({
      message: 'Logout berhasil',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}
