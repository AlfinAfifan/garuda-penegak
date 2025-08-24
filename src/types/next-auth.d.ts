import 'next-auth';
import { DefaultSession, DefaultUser } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      institution_id: string;
      institution_name?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id?: string;
    role?: string;
    institution_id?: string;
    institution_name?: string;
    whitelist_domain?: string[];
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    institution_id?: string;
    institution_name?: string;
    whitelist_domain?: string[];
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: string;
  }
}
