import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MemberData } from './types';
import moment from 'moment';

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  data: MemberData | null;
}

export function DetailModal({ open, onClose, data }: DetailModalProps) {
  if (!data) return null;

  // Component untuk field detail yang konsisten
  const DetailField = ({ label, value, className = '' }: { label: string; value: string | null; className?: string }) => (
    <div className={`space-y-1 ${className}`}>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className="text-sm text-gray-900 bg-white rounded-md px-3 py-2 border border-gray-200 min-h-[36px] flex items-center">{value || '-'}</div>
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
            Detail Anggota
          </DialogTitle>
        </DialogHeader>

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
                <DetailField label="Nama" value={data.name} />
                <DetailField label="NTA" value={data.member_number} />
                <DetailField label="Jenis Kelamin" value={data.gender === 'male' ? 'Laki-laki' : 'Perempuan'} />
                <DetailField label="Tempat / Tanggal Lahir" value={`${data.birth_place}, ${data.birth_date ? moment(data.birth_date).format('DD/MM/YYYY') : '-'}`} />
                <DetailField label="Agama" value={data.religion} />
                <DetailField label="Kewarganegaraan" value={data.nationality} />
                <DetailField label="Telp" value={data.phone} />
                <DetailField label="Bakat" value={data.talent} />
                <DetailField label="Alamat" value={[data.rt, data.rw, data.village, data.sub_district, data.district, data.province].filter(Boolean).join(', ')} className="md:col-span-2 lg:col-span-3" />
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
                <DetailField label="No Induk Orang Tua" value={data.parent_number} />
                <DetailField label="Nama Ayah" value={data.father_name} />
                <DetailField label="Tempat/Tgl Lahir Ayah" value={`${data.father_birth_place}, ${data.father_birth_date ? moment(data.father_birth_date).format('DD/MM/YYYY') : '-'}`} />
                <DetailField label="Nama Ibu" value={data.mother_name} />
                <DetailField label="Tempat/Tgl Lahir Ibu" value={`${data.mother_birth_place}, ${data.mother_birth_date ? moment(data.mother_birth_date).format('DD/MM/YYYY') : '-'}`} />
                <DetailField label="Telp Orang Tua" value={data.parent_phone} />
                <DetailField label="Alamat Orang Tua" value={data.parent_address} className="md:col-span-2 lg:col-span-3" />
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
                <DetailField label="Lembaga" value={data.institution_name} />
                <DetailField label="Tanggal Masuk" value={data.entry_date ? moment(data.entry_date).format('DD/MM/YYYY') : '-'} />
                <DetailField label="Tingkat Masuk" value={data.entry_level} />
                <DetailField label="Tanggal Keluar" value={data.exit_date ? moment(data.exit_date).format('DD/MM/YYYY') : '-'} />
                <DetailField label="Alasan Keluar" value={data.exit_reason || '-'} className="md:col-span-2 lg:col-span-3" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="min-w-24">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
