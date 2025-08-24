'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { CheckCircle, CircleCheckBig, Clock, FileText, Plus, Search, SquarePen, Trash2, Trophy, X } from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { GarudaData } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';
import { useNavbarAction } from '../layout';
import { approveGaruda, createGaruda, deleteGaruda, GarudaPayload, getGaruda, getSummaryGaruda } from '@/services/garuda';
import { InputModal } from '@/components/garuda/InputModal';
import { UpdateConfirmation } from '@/components/ui/update-confirmation';
import { useSession } from 'next-auth/react';

export default function GarudaPage() {
  const {data: session} = useSession()
  const queryClient = useQueryClient();
  const { setButtonAction } = useNavbarAction();
  const isSuperAdmin = session?.user?.role === 'super_admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [updateConfirmModal, setUpdateConfirmModal] = useState(false);

  const [params, setParams] = useState({ search: '', page: 1, limit: 10 });

  const [editingData, setEditingData] = useState<GarudaData | null>(null);
  const [dataDelete, setDataDelete] = useState<GarudaData | null>(null);

  const [initialValues, setInitialValues] = useState<GarudaPayload>({
    member_id: '',
  });

  const { data: summary, isPending: isPendingSummary } = useQuery({
    queryKey: ['garuda-summary'],
    queryFn: () => getSummaryGaruda(),
    retry: 1,
    retryDelay: 1000,
  });

  const { data, isPending } = useQuery({
    queryKey: ['garuda', params],
    queryFn: () => getGaruda(params),
    retry: 1,
    retryDelay: 1000,
  });

  const createData = useMutation({
    mutationFn: createGaruda,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garuda'] });
      setModalOpen(false);
    },
  });

  const approveData = useMutation({
    mutationFn: (id: string) => approveGaruda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garuda'] });
      setModalOpen(false);
    },
  });

  const deleteData = useMutation({
    mutationFn: (id: string) => deleteGaruda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garuda'] });
    },
  });

  const handleSubmit = async (data: GarudaPayload) => {
    await toast.promise(createData.mutateAsync(data), {
      loading: 'Mengirim permintaan...',
      success: 'Data berhasil disimpan!',
      error: (err) => `Gagal menyimpan request: ${err.message}`,
    });
  };

  const handleApprove = async (id: string) => {
    await toast.promise(approveData.mutateAsync(id), {
      loading: 'Mengirim permintaan...',
      success: 'Permintaan berhasil disetujui!',
      error: (err) => `Gagal menyetujui permintaan: ${err.message}`,
    });
  };

  const handleConfirmDelete = async () => {
    await toast.promise(deleteData.mutateAsync(dataDelete?._id || ''), {
      loading: 'Menghapus data...',
      success: 'Data berhasil dihapus!',
      error: (err) => `Gagal menghapus data: ${err.message}`,
    });
  };

  const handleUpdateStatus = (item: GarudaData) => {
    setEditingData(item);
    setUpdateConfirmModal(true);
  };

  const handleDelete = (item: GarudaData) => {
    setDataDelete(item);
    setDeleteModal(true);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="text-orange-600 bg-orange-50 border border-orange-600 px-2 py-1 text-xs font-medium rounded-md">Pending</span>;
      case 1:
        return <span className="text-green-600 bg-green-50 border border-green-600 px-2 py-1 text-xs font-medium rounded-md">Approved</span>;
      default:
        return <span className="text-red-600 bg-red-50 border border-red-600 px-2 py-1 text-xs font-medium rounded-md">Rejected</span>;
    }
  };

  useEffect(() => {
    setButtonAction(
      <Button className="bg-primary-500 hover:bg-primary-600" onClick={() => setModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Tambah Garuda
      </Button>
    );
    return () => setButtonAction(undefined);
  }, [setButtonAction]);

  const columns: ColumnDef<GarudaData>[] = [
    { header: 'Anggota', accessor: 'member_id.name' },
    { header: 'NTA', accessor: 'member_id.nta' },
    { header: 'Level TKU', accessor: 'level_tku' },
    { header: 'Total Purwa', accessor: 'total_purwa' },
    { header: 'Total Madya', accessor: 'total_madya' },
    { header: 'Total Utama', accessor: 'total_utama' },
    { header: 'Status', accessor: 'status', cell: (item) => getStatusBadge(item.status) },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div className="flex items-center space-x-2">
          {isSuperAdmin && (
            <Button disabled={item.status !== 0} onClick={() => handleUpdateStatus(item)} size="icon" className="size-8 bg-blue-50 hover:bg-blue-100 text-blue-600">
              <CircleCheckBig className="h-4 w-4" />
            </Button>
          )}

          <Button disabled={item.status !== 0} onClick={() => handleDelete(item)} size="icon" className="size-8 bg-red-50 hover:bg-red-100 text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Data</CardTitle>
            <div className="p-2 rounded-full bg-blue-500">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : summary?.total_garuda ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Approved</CardTitle>
            <div className="p-2 rounded-full bg-green-500">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : summary?.total_approved ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pending</CardTitle>
            <div className="p-2 rounded-full bg-yellow-500">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : summary?.total_pending ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Garuda</CardTitle>
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
              title: 'Data garuda tidak ditemukan',
              description: 'Tambahkan data garuda untuk mengakses sistem',
              buttonText: 'Tambah Garuda',
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

      <InputModal open={modalOpen} initialValues={initialValues} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} isLoading={isPending} />

      <UpdateConfirmation
        isOpen={updateConfirmModal}
        onClose={() => setUpdateConfirmModal(false)}
        onConfirm={() => handleApprove(editingData?._id || '')}
        title="Approve Garuda"
        description="Apakah Anda yakin ingin mengapprove garuda ini? Aksi ini tidak dapat dibatalkan."
        itemName={editingData?.member_id?.name || ''}
        isLoading={approveData.isPending}
      />

      <DeleteConfirmation
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus garuda"
        description="Apakah Anda yakin ingin menghapus garuda ini? Aksi ini tidak dapat dibatalkan."
        itemName={dataDelete?.member_id?.name || ''}
        isLoading={deleteData.isPending}
      />
    </div>
  );
}
