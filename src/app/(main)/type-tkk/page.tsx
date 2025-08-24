'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { TypeTkkData } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTypeTkk, deleteTypeTkk, getTypeTkk, TypeTkkPayload, updateTypeTkk } from '@/services/type-tkk';
import toast from 'react-hot-toast';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';
import { InputModal } from '@/components/type-tkk/InputModal';
import { Input } from '@/components/ui/input';
import { useNavbarAction } from '../layout';

export default function TypeTkkPage() {
  const queryClient = useQueryClient();
  const { setButtonAction } = useNavbarAction();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [params, setParams] = useState({ search: '', page: 1, limit: 10 });

  const [editingData, setEditingData] = useState<TypeTkkData | null>(null);
  const [dataDelete, setDataDelete] = useState<TypeTkkData | null>(null);

  const [initialValues, setInitialValues] = useState<TypeTkkPayload>({
    name: '',
    sector: '',
    color: '',
  });

  const { data, isPending } = useQuery({
    queryKey: ['type-tkk', params],
    queryFn: () => getTypeTkk(params),
    retry: 1,
    retryDelay: 1000,
  });

  const createData = useMutation({
    mutationFn: createTypeTkk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['type-tkk'] });
      setModalOpen(false);
    },
  });

  const updateData = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TypeTkkPayload }) => updateTypeTkk(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['type-tkk'] });
      setModalOpen(false);
    },
  });

  const deleteData = useMutation({
    mutationFn: (id: string) => deleteTypeTkk(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['type-tkk'] });
    },
  });

  const handleSubmit = async (data: TypeTkkData) => {
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
  };

  const handleConfirmDelete = async () => {
    await toast.promise(deleteData.mutateAsync(dataDelete?._id || ''), {
      loading: 'Menghapus lembaga...',
      success: 'Lembaga berhasil dihapus!',
      error: (err) => `Gagal menghapus lembaga: ${err.message}`,
    });
  };

  const handleEdit = (item: TypeTkkData) => {
    setEditingData(item);
    setInitial(item);
    setModalOpen(true);
  };

  const handleDelete = (item: TypeTkkData) => {
    setDataDelete(item);
    setDeleteModal(true);
  };

  const setInitial = (item: TypeTkkData) => {
    setInitialValues({
      name: item.name,
      sector: item.sector,
      color: item.color,
    });
  };

  const resetInitial = () => {
    setInitialValues({
      name: '',
      sector: '',
      color: '',
    });
    setEditingData(null);
  };

  useEffect(() => {
      setButtonAction(
        <Button className="bg-primary-500 hover:bg-primary-600" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jenis TKK
        </Button>
      );
      return () => setButtonAction(undefined);
    }, [setButtonAction]);

  const columns: ColumnDef<TypeTkkData>[] = [
    { header: 'Nama', accessor: 'name' },
    { header: 'Jenis', accessor: 'sector' },
    { header: 'Warna', accessor: 'color' },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div className="flex gap-4 items-center">
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
          <CardTitle>Daftar Jenis TKK</CardTitle>
          <CardAction>
            <div className="relative sm:max-w-xs w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari berdasarkan nama..." className="pl-8" value={params.search} onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))} />
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
              title: 'Data jenis TKK tidak ditemukan',
              description: 'Tambahkan data jenis TKK untuk mengakses sistem',
              buttonText: 'Tambah Jenis TKK',
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
        isLoading={createData.isPending}
        initialValues={initialValues}
        onClose={() => {
          setModalOpen(false);
          resetInitial();
        }}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmation
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Jenis TKK"
        description="Apakah Anda yakin ingin menghapus jenis TKK ini? Aksi ini tidak dapat dibatalkan."
        itemName={dataDelete?.name || ''}
        isLoading={deleteData.isPending}
      />
    </div>
  );
}
