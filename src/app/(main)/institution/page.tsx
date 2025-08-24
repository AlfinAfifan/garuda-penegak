'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { FolderDown, Plus, Search, SquarePen, Trash2, X } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/ui/pagination';
import { InputModal } from '@/components/institution/InputModal';
import { Button } from '@/components/ui/button';
import { InstitutionData } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInstitution, deleteInstitution, exportInstitution, getInstitution, InstitutionPayload, updateInstitution } from '@/services/instantion';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';
import { useNavbarAction } from '../layout';
import { utils, writeFile } from 'xlsx';
import { useSession } from 'next-auth/react';

export default function InstitutionPage() {
  const queryClient = useQueryClient();
  const { setButtonAction } = useNavbarAction();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [params, setParams] = useState({ search: '', page: 1, limit: 10 });

  const [editingData, setEditingData] = useState<InstitutionData | null>(null);
  const [dataDelete, setDataDelete] = useState<InstitutionData | null>(null);

  const [initialValues, setInitialValues] = useState<InstitutionPayload>({
    name: '',
    sub_district: '',
    address: '',
    gudep_man: '',
    gudep_woman: '',
    head_gudep_man: '',
    head_gudep_woman: '',
    nta_head_gudep_man: '',
    nta_head_gudep_woman: '',
    headmaster_name: '',
    headmaster_number: '',
  });

  const { data, isPending } = useQuery({
    queryKey: ['institutions', params],
    queryFn: () => getInstitution(params),
    retry: 1,
    retryDelay: 1000,
  });

  const createData = useMutation({
    mutationFn: createInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      setModalOpen(false);
    },
  });

  const updateData = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InstitutionData }) => updateInstitution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      setModalOpen(false);
    },
  });

  const deleteData = useMutation({
    mutationFn: (id: string) => deleteInstitution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });

  const handleSubmit = async (data: InstitutionData) => {
    if (editingData) {
      await toast.promise(updateData.mutateAsync({ id: editingData._id, data }), {
        loading: 'Mengirim permintaan...',
        success: 'Data berhasil disimpan!',
        error: (err) => `Gagal menyimpan request: ${err.message}`,
      });
    } else {
      await toast.promise(createData.mutateAsync(data), {
        loading: 'Mengirim permintaan...',
        success: 'Data berhasil disimpan!',
        error: (err) => `Gagal menyimpan request: ${err.message}`,
      });
    }

    setInitialValues({
      name: '',
      sub_district: '',
      address: '',
      gudep_man: '',
      gudep_woman: '',
      head_gudep_man: '',
      head_gudep_woman: '',
      nta_head_gudep_man: '',
      nta_head_gudep_woman: '',
      headmaster_name: '',
      headmaster_number: '',
    });

    setEditingData(null);
  };

  const handleConfirmDelete = async () => {
    await toast.promise(deleteData.mutateAsync(dataDelete?._id || ''), {
      loading: 'Menghapus lembaga...',
      success: 'Lembaga berhasil dihapus!',
      error: (err) => `Gagal menghapus lembaga: ${err.message}`,
    });
  };

  const handleEdit = (item: InstitutionData) => {
    setEditingData(item);
    setInitial(item);
    setModalOpen(true);
  };

  const handleDelete = (item: InstitutionData) => {
    setDataDelete(item);
    setDeleteModal(true);
  };

  const handleExport = async () => {
    try {
      const response = await exportInstitution();

      const rows = response.data.map((item: any) => ({
        'Nama Lembaga': item.name || '',
        Alamat: item.address || '',
        Kecamatan: item.sub_district || '',
        'Gudep Putra': item.gudep_man || '',
        'Gudep Putri': item.gudep_woman || '',
        'Kepala Gudep Putra': item.head_gudep_man || '',
        'Kepala Gudep Putri': item.head_gudep_woman || '',
        'NTA Kepala Gudep Putra': item.nta_head_gudep_man || '',
        'NTA Kepala Gudep Putri': item.nta_head_gudep_woman || '',
        'Nama Kepala Sekolah': item.headmaster_name || '',
        'NIP Kepala Sekolah': item.headmaster_number || '',
      }));

      const worksheet = utils.json_to_sheet(rows);
      const workbook = utils.book_new();

      utils.book_append_sheet(workbook, worksheet, 'DataLembaga');
      utils.sheet_add_aoa(
        worksheet,
        [['Nama Lembaga', 'Alamat', 'Kecamatan', 'Gudep Putra', 'Gudep Putri', 'Kepala Gudep Putra', 'Kepala Gudep Putri', 'NTA Kepala Gudep Putra', 'NTA Kepala Gudep Putri', 'Nama Kepala Sekolah', 'NIP Kepala Sekolah']],
        { origin: 'A1' }
      );

      worksheet['!cols'] = [
        { wch: 30 }, // Nama Lembaga
        { wch: 30 }, // Alamat
        { wch: 20 }, // Kecamatan
        { wch: 15 }, // Gudep Putra
        { wch: 15 }, // Gudep Putri
        { wch: 25 }, // Kepala Gudep Putra
        { wch: 25 }, // Kepala Gudep Putri
        { wch: 20 }, // NTA Putra
        { wch: 20 }, // NTA Putri
        { wch: 30 }, // Kepala Sekolah
        { wch: 25 }, // NIP
      ];

      writeFile(workbook, 'DataLembaga.xlsx', { compression: true });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Gagal mengunduh data lembaga. Silakan coba lagi.');
    }
  };

  const setInitial = (item: InstitutionData) => {
    setInitialValues({
      name: item.name,
      sub_district: item.sub_district,
      address: item.address,
      gudep_man: item.gudep_man,
      gudep_woman: item.gudep_woman,
      head_gudep_man: item.head_gudep_man,
      head_gudep_woman: item.head_gudep_woman,
      nta_head_gudep_man: item.nta_head_gudep_man,
      nta_head_gudep_woman: item.nta_head_gudep_woman,
      headmaster_name: item.headmaster_name,
      headmaster_number: item.headmaster_number,
    });
  };

  useEffect(() => {
    setButtonAction(
      <div className="flex items-center space-x-2">
        <Button className="bg-primary-500 hover:bg-primary-600" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Lembaga
        </Button>

        <Button className="bg-green-600 hover:bg-green-700" onClick={handleExport}>
          <FolderDown className="w-4 h-4 mr-2" />
          Excel
        </Button>
      </div>
    );
    return () => setButtonAction(undefined);
  }, [setButtonAction]);

  const columns: ColumnDef<InstitutionData>[] = [
    { header: 'Nama Lembaga', accessor: 'name' },
    { header: 'Alamat', accessor: 'address' },
    { header: 'No Gudep LK', accessor: 'gudep_man' },
    { header: 'No Gudep PR', accessor: 'gudep_woman' },
    { header: 'Kepsek', accessor: 'headmaster_name' },
    { header: 'NIP Kepsek', accessor: 'headmaster_number' },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div className="flex items-center space-x-2">
          <Button onClick={() => handleEdit(item)} size="icon" className="size-8 bg-blue-50 hover:bg-blue-100 text-blue-600">
            <SquarePen className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleDelete(item)} size="icon" className="size-8 bg-red-50 hover:bg-red-100 text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Lembaga</CardTitle>
          <CardAction className="w-80">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari berdasarkan nama..." value={params.search} onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))} className="pl-8 w-full" />
              {params.search && (
                <button onClick={() => setParams((prev) => ({ ...prev, search: '' }))} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.data}
            isLoading={isPending}
            keyField="_id"
            emptyMessage={{
              title: 'Data lembaga tidak ditemukan',
              description: 'Tambahkan data lembaga untuk mengakses sistem',
              buttonText: 'Tambah Lembaga',
              icon: Plus,
              onButtonClick: () => setModalOpen(true),
            }}
          />
          <CustomPagination
            currentPage={params.page}
            totalPages={data?.pagination?.total_pages}
            onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
            itemsPerPage={params.limit}
            onItemsPerPageChange={(limit) => setParams((prev) => ({ ...prev, limit, page: 1 }))}
          />
        </CardContent>
      </Card>

      <InputModal
        open={modalOpen}
        initialValues={initialValues}
        onClose={() => {
          setModalOpen(false);
          setEditingData(null);
          setInitialValues({
            name: '',
            sub_district: '',
            address: '',
            gudep_man: '',
            gudep_woman: '',
            head_gudep_man: '',
            head_gudep_woman: '',
            nta_head_gudep_man: '',
            nta_head_gudep_woman: '',
            headmaster_name: '',
            headmaster_number: '',
          });
        }}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />

      <DeleteConfirmation
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Lembaga"
        description="Apakah Anda yakin ingin menghapus lembaga ini? Aksi ini tidak dapat dibatalkan."
        itemName={dataDelete?.name || ''}
        isLoading={deleteData.isPending}
      />
    </div>
  );
}
