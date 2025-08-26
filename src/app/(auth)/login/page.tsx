'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Lock, User, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

type LoginFormValues = {
  email: string;
  password: string;
};

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Format email tidak valid').required('Email wajib diisi'),
  password: Yup.string().min(3, 'Password minimal 3 karakter').required('Password wajib diisi'),
});

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      const success = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (success) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-primary-100/[0.02] bg-[size:20px_20px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <Image src="/image/logo.png" alt="Logo" width={100} height={100} />
              </div>
              <h1 className="text-3xl font-bold text-primary-500 mb-2">Garuda Penegak</h1>
              <p className="text-gray-500">Selamat datang kembali</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Formik initialValues={{ email: '', password: '' }} validationSchema={loginSchema} onSubmit={handleSubmit}>
              {({ values, errors, touched, handleChange, handleBlur }) => (
                <Form className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-800 font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Masukkan email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`pl-10 ${errors.email && touched.email ? 'border-red-400 focus:border-red-400' : ''}`}
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm font-medium" />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-800 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`pl-10 pr-10 ${errors.password && touched.password ? 'border-red-400 focus:border-red-400' : ''}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm font-medium" />
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">
                      Lupa password?
                    </a>
                  </div>

                  {/* Login Button */}
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      'Masuk'
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">atau</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <Link href="/register" className="font-medium text-blue-500 hover:text-blue-600 transition-colors">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
