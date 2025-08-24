import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const isLocalhost = process.env.NODE_ENV === 'development';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          console.log(response);

          const { data: responseData } = response;

          return {
            id: responseData?.user?.id,
            name: responseData?.user?.name,
            email: responseData?.user?.email,
            expires_at: responseData?.user?.expires_at,
            role: responseData?.user?.role,
            institution_id: responseData?.user?.institution_id,
            institution_name: responseData?.user?.institution_name,

            access_token: responseData?.access_token,
            refresh_token: responseData?.refresh_token          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        token.expires_at = user.expires_at ? String(user.expires_at) : undefined;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.institution_id = typeof user.institution_id === 'string' ? user.institution_id : '';
        token.institution_name = user.institution_name;
      }

      const now = Math.floor(Date.now() / 1000);
      if (token.expires_at && now > Number(token.expires_at)) {
        console.log('Token expired');
        return {};
      }

      return token;
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        return { ...session, user: {}, access_token: undefined };
      }

      session.user = {
        id: String(token.id),
        name: token.name || '',
        email: token.email || '',
        role: token.role || '',
        institution_id: typeof token.institution_id === 'string' ? token.institution_id : String(token.institution_id || ''),
        institution_name: token.institution_name || '',
      };
      session.access_token = token.access_token;
      session.refresh_token = token.refresh_token;
      session.expires_at = token.expires_at;

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },

  cookies: {
    sessionToken: {
      name: isLocalhost ? 'next-auth.session-token' : '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: isLocalhost ? 'lax' : 'none',
        secure: !isLocalhost,
        path: '/',
        domain: isLocalhost ? 'localhost' : undefined,
      },
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
