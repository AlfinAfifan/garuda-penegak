'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { SearchableSelect } from '../ui/searchable-select';
import { getInstitution } from '@/services/instantion';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const inputSchema = Yup.object().shape({
  name: Yup.string().required('Nama wajib diisi'),
  email: Yup.string().email('Format email tidak valid').required('Email wajib diisi'),
  password: Yup.string(),
  role: Yup.string().required('Role wajib diisi'),
  institution_id: Yup.string().required('ID Lembaga wajib diisi'),
});

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<any>;
  isLoading?: boolean;
}

export function InputModal({ open, onClose, onSubmit, initialValues, isLoading }: InputModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [paramsInstitution, setParamsInstitution] = useState({ search: '', page: 1, limit: 10 });

  const { data: dataInstitution, isPending: isPendingInstitution } = useQuery({
    queryKey: ['institutions', paramsInstitution],
    queryFn: () => getInstitution(paramsInstitution),
    enabled: open,
  });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Tambah User</DialogTitle>
        </DialogHeader>
        <Formik initialValues={initialValues} validationSchema={inputSchema} onSubmit={onSubmit}>
          {({ values, handleChange, handleBlur, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-7 my-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nama</Label>
                  <Field as={Input} id="name" name="name" placeholder="Masukkan nama" />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="institution_id">Lembaga</Label>
                  <SearchableSelect
                    value={values?.institution_id ?? ''}
                    options={dataInstitution?.data}
                    isLoading={isPendingInstitution}
                    placeholder="Pilih lembaga"
                    searchValue={paramsInstitution.search}
                    onValueChange={(value) => setFieldValue('institution_id', value)}
                    onSearchChange={(value) => setParamsInstitution((prev) => ({ ...prev, search: value }))}
                    className="w-full"
                  />
                  <ErrorMessage name="institution_id" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Field as={Input} id="email" name="email" type="email" placeholder="Masukkan email" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Masukkan password" value={values.password} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={values.role} onValueChange={(value) => setFieldValue('role', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="role" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>

              <DialogFooter className="mt-8">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Batal
                </Button>
                <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white" disabled={isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
