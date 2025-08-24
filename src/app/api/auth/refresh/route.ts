import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokenPair } from '@/lib/jwt';
import connect from '@/lib/db';
import User from '@/lib/modals/user';
import Institution from '@/lib/modals/institution';

export async function POST(req: NextRequest) {
  try {
    await connect();

    // Get refresh token from cookie
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token tidak ditemukan' }, { status: 401 });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json({ error: 'Refresh token tidak valid' }, { status: 401 });
    }

    // Check if user still exists and token matches
    const user = await User.findById(payload.id);

    if (!user || user.is_delete === 1 || user.status !== 1) {
      return NextResponse.json({ error: 'User tidak valid' }, { status: 401 });
    }

    if (user.refresh_token !== refreshToken) {
      return NextResponse.json({ error: 'Refresh token tidak sesuai' }, { status: 401 });
    }

    // Get fresh institution information
    let institutionName = '';
    let institutionId = '';

    if (user.institution_id) {
      try {
        const institution = await Institution.findById(user.institution_id);
        institutionName = institution?.name || '';
        institutionId = user.institution_id.toString();
      } catch (error) {
        console.log('Institution query failed:', error);
      }
    }

    // Generate new token pair
    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      institution_id: institutionId,
      institution_name: institutionName,
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(tokenPayload);

    // Update refresh token in database
    await User.findByIdAndUpdate(user._id, {
      refresh_token: newRefreshToken,
    });

    // Create response with new access token
    const response = NextResponse.json({
      message: 'Token berhasil diperbarui',
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        institution_id: institutionId,
        institution_name: institutionName,
      },
    });

    // Set new refresh token as httpOnly cookie
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
