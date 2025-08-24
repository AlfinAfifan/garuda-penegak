'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm text-center">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900">Akses Ditolak</CardTitle>
                <p className="text-gray-600 mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button onClick={() => router.back()} variant="outline" className="w-full">
                Kembali
              </Button>
              <Button onClick={() => router.push('/dashboard')} className="w-full bg-red-500 hover:bg-red-600">
                Ke Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
