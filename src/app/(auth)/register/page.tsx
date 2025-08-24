import { GalleryVerticalEnd } from 'lucide-react';

import { RegisterForm } from '@/components/auth/register-form';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image src="/icon.png" alt="Logo" width={30} height={30} />
            Garuda Penegak
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600 transition-colors">
              Login sekarang
            </Link>
          </p>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image src="/image/register-illustration.jpg" width={100} height={100} alt="Image" className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
      </div>
    </div>
  );
}
