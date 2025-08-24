'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const inputSchema = Yup.object().shape({
  name: Yup.string().required('Nama wajib diisi'),
  sector: Yup.string(),
  color: Yup.string()
});

interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Partial<any>;
  isLoading?: boolean;
}

export function InputModal({ open, onClose, onSubmit, initialValues, isLoading = false }: InputModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Tambah Jenis TKK</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={inputSchema}
          onSubmit={onSubmit}
        >
          {({ values, handleChange, handleBlur }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input id="name" name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="sector">Sektor</Label>
                  <Input id="sector" name="sector" value={values.sector} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="sector" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="color">Warna</Label>
                  <Input id="color" name="color" value={values.color} onChange={handleChange} onBlur={handleBlur} />
                  <ErrorMessage name="color" component="div" className="text-red-500 text-xs mt-1" />
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
