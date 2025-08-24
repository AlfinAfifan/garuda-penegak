'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { SearchableSelect } from '../ui/searchable-select';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

const inputSchema = Yup.object().shape({
  name: Yup.string().required('Nama lembaga wajib diisi'),
  sub_district: Yup.string().required('Kecamatan wajib diisi'),
  address: Yup.string().required('Alamat wajib diisi'),
  gudep_man: Yup.string().required('No Gudep LK wajib diisi'),
  gudep_woman: Yup.string().required('No Gudep PR wajib diisi'),
  head_gudep_man: Yup.string().required('Nama Kepala Gudep LK wajib diisi'),
  head_gudep_woman: Yup.string().required('Nama Kepala Gudep PR wajib diisi'),
  nta_head_gudep_man: Yup.string().required('NTA Kepala Gudep LK wajib diisi'),
  nta_head_gudep_woman: Yup.string().required('NTA Kepala Gudep PR wajib diisi'),
  headmaster_name: Yup.string().required('Nama kepala sekolah wajib diisi'),
  headmaster_number: Yup.string().required('NIP kepala sekolah wajib diisi'),
});

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<any>;
  isLoading?: boolean;
}

export function InputModal({ open, onClose, onSubmit, initialValues, isLoading }: InputModalProps) {
  const [paramsSubDistrict, setParamsSubDistrict] = useState({ search: '', page: 1, limit: 10 });

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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Tambah Lembaga</DialogTitle>
        </DialogHeader>
        <Formik initialValues={initialValues} val_idationSchema={inputSchema} onSubmit={onSubmit}>
          {({ values, handleChange, handleBlur, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Nama Lembaga</Label>
                  <Input id="name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Kwaran</Label>
                  <SearchableSelect
                    value={values.sub_district ?? ''}
                    options={list_sub_districts}
                    placeholder="Pilih kwaran"
                    searchValue={paramsSubDistrict.search}
                    onValueChange={(value) => setFieldValue('sub_district', value)}
                    onSearchChange={(value) => setParamsSubDistrict((prev) => ({ ...prev, search: value }))}
                    className="w-full"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea id="address" name="address" value={values.address} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="address" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gudep_man">No Gudep LK</Label>
                  <Input id="gudep_man" name="gudep_man" value={values.gudep_man} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="gudep_man" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gudep_woman">No Gudep PR</Label>
                  <Input id="gudep_woman" name="gudep_woman" value={values.gudep_woman} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="gudep_woman" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head_gudep_man">Nama Ketua Gudep LK</Label>
                  <Input id="head_gudep_man" name="head_gudep_man" value={values.head_gudep_man} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="head_gudep_man" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head_gudep_woman">Nama Ketua Gudep PR</Label>
                  <Input id="head_gudep_woman" name="head_gudep_woman" value={values.head_gudep_woman} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="head_gudep_woman" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nta_head_gudep_man">NTA Ketua Gudep LK</Label>
                  <Input id="nta_head_gudep_man" name="nta_head_gudep_man" value={values.nta_head_gudep_man} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="nta_head_gudep_man" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nta_head_gudep_woman">NTA Ketua Gudep PR</Label>
                  <Input id="nta_head_gudep_woman" name="nta_head_gudep_woman" value={values.nta_head_gudep_woman} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="nta_head_gudep_woman" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="headmaster_name">Nama Kepala Sekolah</Label>
                  <Input id="headmaster_name" name="headmaster_name" value={values.headmaster_name} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="headmaster_name" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="headmaster_number">NIP Kepala Sekolah</Label>
                  <Input id="headmaster_number" name="headmaster_number" value={values.headmaster_number} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="headmaster_number" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Batal
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white" disabled={isLoading}>
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
