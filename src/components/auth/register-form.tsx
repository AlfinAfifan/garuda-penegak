'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';

import { useState } from 'react';
import { SearchableSelect } from '../ui/searchable-select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getInstitution } from '@/services/instantion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createUser, registerUser } from '@/services/user';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export function RegisterForm({ className, ...props }: React.ComponentProps<'form'>) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [paramsInstitution, setParamsInstitution] = useState({ search: '', page: 1, limit: 10 });

  const { data: dataInstitution, isPending: isPendingInstitution } = useQuery({
    queryKey: ['institutions', paramsInstitution],
    queryFn: () => getInstitution(paramsInstitution),
  });

  const validationSchema = Yup.object({
    name: Yup.string().required('Nama wajib diisi'),
    institution_id: Yup.string().required('Lembaga wajib dipilih'),
    email: Yup.string().email('Email tidak valid').required('Email wajib diisi'),
    password: Yup.string().min(6, 'Password minimal 6 karakter').required('Password wajib diisi'),
  });

  const registerUserMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garuda'] });
      router.push('/login');
    },
  });

  const handleRegisterUser = async (values: any) => {
    await toast.promise(registerUserMutation.mutateAsync(values), {
      loading: 'Mengirim permintaan...',
      success: 'Register berhasil! Silahkan menunggu persetujuan admin',
      error: (err) => `Gagal menyimpan request: ${err.message}`,
    });
  };

  return (
    <Formik initialValues={{ name: '', institution_id: '', email: '', password: '' }} validationSchema={validationSchema} onSubmit={(values) => handleRegisterUser(values)}>
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className={cn('flex flex-col gap-6', className)} {...props}>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Register your account</h1>
            <p className="text-muted-foreground text-sm text-balance">Register to access all features of Garuda Penegak</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 grid gap-3">
              <Label htmlFor="name">Nama</Label>
              <Field name="name">{({ field }: any) => <Input {...field} id="name" type="text" placeholder="Masukkan nama Anda" />}</Field>
              <ErrorMessage name="name" component="div" className="text-red-500 text-xs" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Field name="email">{({ field }: any) => <Input {...field} id="email" type="email" placeholder="john@example.com" />}</Field>
              <ErrorMessage name="email" component="div" className="text-red-500 text-xs" />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Field name="password">
                  {({ field }: any) => (
                    <Input {...field} id="password" type={showPassword ? 'text' : 'password'} placeholder="Masukkan password" className={`pl-2.5 pr-10 border-primary-200 focus:border-primary-500 focus:ring-primary-500`} />
                  )}
                </Field>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-primary-500 hover:text-primary-700 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ErrorMessage name="password" component="div" className="text-red-500 text-xs" />
            </div>
            <div className="col-span-2 grid gap-3">
              <Label htmlFor="institution_id">Lembaga</Label>
              <SearchableSelect
                value={values.institution_id}
                options={dataInstitution?.data}
                isLoading={isPendingInstitution}
                placeholder="Pilih lembaga"
                searchValue={paramsInstitution.search}
                onValueChange={(value) => setFieldValue('institution_id', value)}
                onSearchChange={(value) => setParamsInstitution((prev) => ({ ...prev, search: value }))}
                className="w-full"
              />
              <ErrorMessage name="institution_id" component="div" className="text-red-500 text-xs" />
            </div>
            <Button type="submit" className="col-span-2 w-full" disabled={isSubmitting}>
              Register
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
