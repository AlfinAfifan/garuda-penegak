import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import connect from '@/lib/db';
import User from '@/lib/modals/user';
import Institution from '@/lib/modals/institution';
import { generateTokenPair } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 });
    }

    await connect();
    const userCheck = await User.findOne({ email });

    if (!userCheck) {
      return NextResponse.json({ error: 'User tidak terdaftar dalam sistem' }, { status: 401 });
    }

    if (userCheck.is_delete === 1) {
      return NextResponse.json({ error: 'Akun telah dihapus, harap hubungi admin' }, { status: 401 });
    }

    if (userCheck.status !== 1) {
      return NextResponse.json({ error: 'Akun belum aktif, harap hubungi admin' }, { status: 401 });
    }

    const isValid = await compare(password, userCheck.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    let institutionName = '';
    let institutionId = '';

    if (userCheck.institution_id) {
      try {
        const institution = await Institution.findById(userCheck.institution_id);
        institutionName = institution?.name || '';
        institutionId = userCheck.institution_id.toString();
      } catch (error) {
        console.log('Institution query failed:', error);
      }
    }

    const tokenPayload = {
      id: userCheck._id.toString(),
      email: userCheck.email,
      role: userCheck.role,
      institution_id: institutionId,
      institution_name: institutionName,
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

    // Save refresh token to database
    await User.findByIdAndUpdate(userCheck._id, {
      refresh_token: refreshToken,
      last_login: new Date(),
    });

    // Set refresh token as httpOnly cookie
    const response = NextResponse.json({
      message: 'Login berhasil',
      accessToken,
      user: {
        id: userCheck._id.toString(),
        name: userCheck.name,
        email: userCheck.email,
        role: userCheck.role,
        institution_id: institutionId,
        institution_name: institutionName,
      },
    });

    // Set refresh token as secure httpOnly cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server, silakan coba lagi' }, { status: 500 });
  }
}
