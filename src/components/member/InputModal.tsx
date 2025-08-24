'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import { getInstitution } from '@/services/instantion';
import { useEffect, useState } from 'react';
import { SearchableSelect } from '../ui/searchable-select';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSession } from 'next-auth/react';

const inputSchema = Yup.object().shape({
  name: Yup.string().required('Nama wajib diisi'),
  phone: Yup.string().required('No Telp wajib diisi'),
  institution_id: Yup.string().nullable(),
  member_number: Yup.string().required('NTA wajib diisi'),
  parent_number: Yup.string().required('No Induk wajib diisi'),
  gender: Yup.string().required('Jenis kelamin wajib diisi'),
  birth_place: Yup.string().required('Tempat lahir wajib diisi'),
  birth_date: Yup.date().nullable().required('Tanggal lahir wajib diisi'),
  religion: Yup.string().required('Agama wajib diisi'),
  nationality: Yup.string(),
  rt: Yup.string(),
  rw: Yup.string(),
  village: Yup.string(),
  sub_district: Yup.string(),
  district: Yup.string(),
  province: Yup.string(),
  talent: Yup.string(),
  father_name: Yup.string(),
  father_birth_place: Yup.string(),
  father_birth_date: Yup.date().nullable(),
  mother_name: Yup.string(),
  mother_birth_place: Yup.string(),
  mother_birth_date: Yup.date().nullable(),
  parent_address: Yup.string(),
  parent_phone: Yup.string(),
  entry_date: Yup.date().nullable(),
  exit_date: Yup.date().nullable(),
  entry_level: Yup.string(),
  exit_reason: Yup.string(),
});

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<any>;
  isLoading?: boolean;
}

export function InputModal({ open, onClose, onSubmit, initialValues, isLoading }: InputModalProps) {
  const [paramsInstitution, setParamsInstitution] = useState({ search: '', page: 1, limit: 10 });
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'super_admin';

  const { data: dataInstitution, isPending: isPendingInstitution } = useQuery({
    queryKey: ['institutions', paramsInstitution],
    queryFn: () => getInstitution(paramsInstitution),
    enabled: open,
  });

  // Reset search saat modal dibuka untuk memastikan data lembaga ter-load
  useEffect(() => {
    if (open && isSuperAdmin) {
      setParamsInstitution({ search: '', page: 1, limit: 10 });
    }
  }, [open, isSuperAdmin]);

  // Enhanced initial values with proper defaults
  const defaultValues = {
    name: '',
    phone: '',
    institution_id: initialValues?.institution_id || (session?.user?.role !== 'super_admin' ? session?.user?.institution_id : null),
    member_number: '',
    parent_number: '',
    gender: '',
    birth_place: '',
    birth_date: null,
    religion: '',
    nationality: 'WNI',
    rt: '',
    rw: '',
    village: '',
    sub_district: '',
    district: '',
    province: '',
    talent: '',
    father_name: '',
    father_birth_place: '',
    father_birth_date: null,
    mother_name: '',
    mother_birth_place: '',
    mother_birth_date: null,
    parent_address: '',
    parent_phone: '',
    entry_date: null,
    exit_date: null,
    entry_level: '',
    exit_reason: '',
    ...initialValues,
  };

  // Component untuk field input yang konsisten
  const InputField = ({ label, name, type = 'text', className = '', values, handleChange, handleBlur, setFieldValue, placeholder, isTextarea = false }: any) => (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-600">
        {label}
      </Label>
      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={values[name] || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full min-h-[60px] rounded-md border border-gray-200 px-3 py-2 text-sm focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={type === 'date' && values[name] ? new Date(values[name]).toISOString().split('T')[0] : values[name] || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="border-gray-200"
        />
      )}
      <ErrorMessage name={name} component="div" className="text-red-500 text-xs mt-1" />
    </div>
  );

  // Component untuk select field
  const SelectField = ({ label, name, options, values, setFieldValue, placeholder, className = '' }: any) => (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-600">
        {label}
      </Label>
      <Select value={values[name] || ''} onValueChange={(value) => setFieldValue(name, value)}>
        <SelectTrigger className="w-full border-gray-200">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: any) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ErrorMessage name={name} component="div" className="text-red-500 text-xs mt-1" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            {initialValues ? 'Edit Anggota' : 'Tambah Anggota'}
          </DialogTitle>
        </DialogHeader>

        <Formik initialValues={defaultValues} validationSchema={inputSchema} onSubmit={onSubmit} enableReinitialize>
          {({ values, setFieldValue, handleChange, handleBlur }) => (
            <Form className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-6">
                  {/* Data Pribadi */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Data Pribadi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InputField label="Nama" name="name" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Masukkan nama lengkap" />
                      <InputField label="NTA" name="member_number" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Nomor Tanda Anggota" />
                      <SelectField
                        label="Jenis Kelamin"
                        name="gender"
                        options={[
                          { value: 'Laki-laki', label: 'Laki-laki' },
                          { value: 'Perempuan', label: 'Perempuan' },
                        ]}
                        values={values}
                        setFieldValue={setFieldValue}
                        placeholder="Pilih jenis kelamin"
                      />
                      <InputField label="Tempat Lahir" name="birth_place" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Kota/Kabupaten lahir" />
                      <InputField label="Tanggal Lahir" name="birth_date" type="date" values={values} handleChange={handleChange} handleBlur={handleBlur} />
                      <InputField label="Agama" name="religion" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Agama" />
                      <SelectField
                        label="Kewarganegaraan"
                        name="nationality"
                        options={[
                          { value: 'WNI', label: 'WNI' },
                          { value: 'WNA', label: 'WNA' },
                        ]}
                        values={values}
                        setFieldValue={setFieldValue}
                        placeholder="Pilih kewarganegaraan"
                      />
                      <InputField label="No Telp" name="phone" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Nomor telepon/HP" />
                      <InputField label="Bakat" name="talent" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Bakat khusus" />

                      {/* Alamat - Full Width */}
                      <div className="md:col-span-2 lg:col-span-3 space-y-1">
                        <Label className="text-sm font-medium text-gray-600">Alamat</Label>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                          <InputField label="" name="rt" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="RT" />
                          <InputField label="" name="rw" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="RW" />
                          <InputField label="" name="village" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Desa/Kelurahan" />
                          <InputField label="" name="sub_district" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Kecamatan" />
                          <InputField label="" name="district" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Kabupaten" />
                          <InputField label="" name="province" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Provinsi" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Orang Tua */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Data Orang Tua
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InputField label="No Induk Orang Tua" name="parent_number" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Nomor induk orang tua" />
                      <InputField label="Nama Ayah" name="father_name" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Nama lengkap ayah" />
                      <InputField label="Tempat Lahir Ayah" name="father_birth_place" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Tempat lahir ayah" />
                      <InputField label="Tanggal Lahir Ayah" name="father_birth_date" type="date" values={values} handleChange={handleChange} handleBlur={handleBlur} />
                      <InputField label="Nama Ibu" name="mother_name" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Nama lengkap ibu" />
                      <InputField label="Tempat Lahir Ibu" name="mother_birth_place" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Tempat lahir ibu" />
                      <InputField label="Tanggal Lahir Ibu" name="mother_birth_date" type="date" values={values} handleChange={handleChange} handleBlur={handleBlur} />
                      <InputField label="No Telp Orang Tua" name="parent_phone" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Nomor telepon orang tua" />
                      <InputField
                        label="Alamat Orang Tua"
                        name="parent_address"
                        values={values}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        placeholder="Alamat lengkap orang tua"
                        className="md:col-span-2 lg:col-span-3"
                        isTextarea={true}
                      />
                    </div>
                  </div>

                  {/* Data Keanggotaan */}
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Data Keanggotaan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {isSuperAdmin && (
                        <div className="space-y-1 md:col-span-2 lg:col-span-3">
                          <Label className="text-sm font-medium text-gray-600">Lembaga</Label>
                          <SearchableSelect
                            value={values.institution_id || ''}
                            options={dataInstitution?.data || []}
                            isLoading={isPendingInstitution}
                            placeholder="Pilih lembaga"
                            searchValue={paramsInstitution.search}
                            onValueChange={(value) => setFieldValue('institution_id', value)}
                            onSearchChange={(value) => setParamsInstitution((prev) => ({ ...prev, search: value }))}
                            className="w-full border-gray-200"
                          />
                          <ErrorMessage name="institution_id" component="div" className="text-red-500 text-xs mt-1" />
                        </div>
                      )}
                      <InputField label="Tanggal Masuk" name="entry_date" type="date" values={values} handleChange={handleChange} handleBlur={handleBlur} />
                      <InputField label="Tingkat Masuk" name="entry_level" values={values} handleChange={handleChange} handleBlur={handleBlur} placeholder="Tingkat saat masuk" />
                      <InputField label="Tanggal Keluar" name="exit_date" type="date" values={values} handleChange={handleChange} handleBlur={handleBlur} />
                      <InputField
                        label="Alasan Keluar"
                        name="exit_reason"
                        values={values}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        placeholder="Alasan keluar (jika ada)"
                        className="md:col-span-2 lg:col-span-3"
                        isTextarea={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="min-w-24">
                  Batal
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white min-w-24" disabled={isLoading}>
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
