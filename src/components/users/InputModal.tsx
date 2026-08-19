'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SearchableSelect } from '../ui/searchable-select';
import { getInstitution } from '@/services/instantion';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const buildInputSchema = (isEdit: boolean) =>
  Yup.object().shape({
    name: Yup.string().required('Nama wajib diisi'),
    email: Yup.string().email('Format email tidak valid').required('Email wajib diisi'),
    // Saat edit, password opsional (kosongkan untuk mempertahankan password lama)
    password: isEdit ? Yup.string().min(6, 'Password minimal 6 karakter') : Yup.string().min(6, 'Password minimal 6 karakter').required('Password wajib diisi'),
    role: Yup.string().required('Role wajib diisi'),
    institution_id: Yup.string().nullable(),
    sub_district: Yup.string(),
  });

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<any>;
  isLoading?: boolean;
  isEdit?: boolean;
}

const list_sub_districts = [
  { _id: 'bendungan', name: 'Bendungan' },
  { _id: 'dongko', name: 'Dongko' },
  { _id: 'durenan', name: 'Durenan' },
  { _id: 'gandusari', name: 'Gandusari' },
  { _id: 'kampak', name: 'Kampak' },
  { _id: 'karangan', name: 'Karangan' },
  { _id: 'munjungan', name: 'Munjungan' },
  { _id: 'panggul', name: 'Panggul' },
  { _id: 'pogalan', name: 'Pogalan' },
  { _id: 'pule', name: 'Pule' },
  { _id: 'suruh', name: 'Suruh' },
  { _id: 'trenggalek', name: 'Trenggalek' },
  { _id: 'tugu', name: 'Tugu' },
  { _id: 'watulimo', name: 'Watulimo' },
];

export function InputModal({ open, onClose, onSubmit, initialValues, isLoading, isEdit = false }: InputModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [paramsInstitution, setParamsInstitution] = useState({ search: '', page: 1, limit: 10 });
  const [paramsSubDistrict, setParamsSubDistrict] = useState({ search: '', page: 1, limit: 10 });

  // Reset visibilitas password setiap modal dibuka/ditutup
  useEffect(() => {
    if (!open) setShowPassword(false);
  }, [open]);

  const { data: dataInstitution, isPending: isPendingInstitution } = useQuery({
    queryKey: ['institutions', paramsInstitution],
    queryFn: () => getInstitution(paramsInstitution),
    enabled: open,
  });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl ">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Tambah User'}</DialogTitle>
        </DialogHeader>
        <Formik initialValues={initialValues} enableReinitialize validationSchema={buildInputSchema(isEdit)} onSubmit={onSubmit}>
          {({ values, handleChange, handleBlur, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-7 my-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={values.role}
                    onValueChange={(value) => {
                      setFieldValue('role', value);
                      setFieldValue('institution_id', null);
                      setFieldValue('sub_district', '');
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="admin_kecamatan">Admin Kecamatan</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <ErrorMessage name="role" component="div" className="text-red-500 text-xs mt-1" />
                </div>

                {values.role === 'user' && (
                  <div className="space-y-2">
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
                )}

                {values.role === 'admin_kecamatan' && (
                  <div className=" space-y-2">
                    <Label htmlFor="sub_district">Kecamatan</Label>
                    <SearchableSelect
                      value={values.sub_district ?? ''}
                      options={list_sub_districts}
                      placeholder="Pilih kecamatan"
                      searchValue={paramsSubDistrict.search}
                      onValueChange={(value) => setFieldValue('sub_district', value)}
                      onSearchChange={(value) => setParamsSubDistrict((prev) => ({ ...prev, search: value }))}
                      className="w-full"
                    />
                    <ErrorMessage name="sub_district" component="div" className="text-red-500 text-xs mt-1" />
                  </div>
                )}
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nama</Label>
                  <Field as={Input} id="name" name="name" placeholder="Masukkan nama" />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Field as={Input} id="email" name="email" type="email" placeholder="Masukkan email" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password
                    {isEdit && <span className="ml-1 text-xs font-normal text-muted-foreground">(opsional)</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                      value={values.password ?? ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
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
