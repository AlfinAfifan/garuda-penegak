'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMembers } from '@/services/member';
import { SearchableSelect } from '../ui/searchable-select';

const inputSchema = Yup.object().shape({
  member_id: Yup.string().required('Member wajib diisi'),
});

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<any>;
  isLoading?: boolean;
}

export function InputModal({ open, onClose, onSubmit, initialValues, isLoading }: InputModalProps) {
  const [paramsMember, setParamsMember] = useState({ search: '', page: 1, limit: 10 });

  const { data: memberOptions, isPending: isPendingMember } = useQuery({
    queryKey: ['members', paramsMember],
    queryFn: async () => getMembers(paramsMember),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Tambah Garuda</DialogTitle>
        </DialogHeader>
        <Formik initialValues={initialValues} validationSchema={inputSchema} onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="member_id">Pilih Anggota</Label>
                  <SearchableSelect
                    value={values.member_id ?? ''}
                    options={memberOptions?.data}
                    isLoading={isPendingMember}
                    placeholder="Pilih anggota"
                    searchValue={paramsMember.search}
                    onValueChange={(value) => setFieldValue('member_id', value)}
                    onSearchChange={(value) => setParamsMember((prev) => ({ ...prev, search: value }))}
                    className="w-full"
                  />
                  <ErrorMessage name="member_id" component="div" className="text-red-500 text-xs mt-1" />
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
