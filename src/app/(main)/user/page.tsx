'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UserData } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';
import { Input } from '@/components/ui/input';
import { createUser, deleteUser, getUsers, updateUser, updateStatus, UserPayload } from '@/services/user';
import { InputModal } from '@/components/users/InputModal';
import { useNavbarAction } from '../layout';

export default function UserPage() {
  const queryClient = useQueryClient();
  const { setButtonAction } = useNavbarAction();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [params, setParams] = useState({ search: '', page: 1, limit: 10 });

  const [editingData, setEditingData] = useState<UserData | null>(null);
  const [dataDelete, setDataDelete] = useState<UserData | null>(null);

  const [initialValues, setInitialValues] = useState<UserPayload>({
    name: '',
    email: '',
    password: '',
    role: '',
    institution_id: '',
  });

  const { data, isPending } = useQuery({
    queryKey: ['user', params],
    queryFn: () => getUsers(params),
    retry: 1,
    retryDelay: 1000,
  });

  const createData = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setModalOpen(false);
    },
  });

  const updateData = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserPayload }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setModalOpen(false);
    },
  });

  const deleteData = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const updateStatusData = useMutation({
    mutationFn: (id: string) => updateStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleSubmit = async (data: UserData) => {
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

  const handleEdit = (item: UserData) => {
    setEditingData(item);
    setInitial(item);
    setModalOpen(true);
  };

  const handleDelete = (item: UserData) => {
    setDataDelete(item);
    setDeleteModal(true);
  };

  const handleStatusToggle = async (item: UserData) => {
    await toast.promise(updateStatusData.mutateAsync(item._id), {
      loading: 'Mengubah status user...',
      success: `Status user berhasil diubah menjadi ${item.status === 1 ? 'tidak aktif' : 'aktif'}!`,
      error: (err) => `Gagal mengubah status user: ${err.message}`,
    });
  };

  const setInitial = (item: UserData) => {
    setInitialValues({
      name: item.name,
      email: item.email,
      password: '',
      role: item.role,
      institution_id: item.institution_id,
    });
  };

  const resetInitial = () => {
    setInitialValues({
      name: '',
      email: '',
      password: '',
      role: '',
      institution_id: '',
    });
    setEditingData(null);
  };

  useEffect(() => {
    setButtonAction(
      <Button onClick={() => setModalOpen(true)} className="bg-primary-500 hover:bg-primary-600">
        <Plus className="w-4 h-4 mr-2" />
        Tambah User
      </Button>
    );
    return () => setButtonAction(undefined);
  }, [setButtonAction]);

  const columns: ColumnDef<UserData>[] = [
    { header: 'Nama', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Lembaga', accessor: 'institution_name' },
    { header: 'Role', accessor: 'role' },
    {
      header: 'Status',
      accessor: 'status',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Switch checked={item.status === 1} onCheckedChange={() => handleStatusToggle(item)} disabled={updateStatusData.isPending} />
          <span className={`text-sm `}>{item.status === 1 ? 'Aktif' : 'Tidak Aktif'}</span>
        </div>
      ),
    },
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
          <CardTitle>Daftar User</CardTitle>
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
              title: 'Data user tidak ditemukan',
              description: 'Tambahkan data user untuk mengakses sistem',
              buttonText: 'Tambah User',
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
        title="Hapus User"
        description="Apakah Anda yakin ingin menghapus user ini? Aksi ini tidak dapat dibatalkan."
        itemName={dataDelete?.name || ''}
        isLoading={deleteData.isPending}
      />
    </div>
  );
}
