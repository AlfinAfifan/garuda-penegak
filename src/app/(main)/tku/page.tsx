'use client';

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trophy, Plus, Search, Filter, CheckCircle, Clock, Trash2, FileText, CircleCheckBig, FolderDown } from 'lucide-react';
import { ColumnDef, DataTable } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/ui/pagination';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { TkuData } from './types';
import toast from 'react-hot-toast';
import { createLaksana, createBantara, deleteBantara, deleteLaksana, getBantara, getLaksana, getSummary, exportTku } from '@/services/tku';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';
import { UpdateConfirmation } from '@/components/ui/update-confirmation';
import moment from 'moment';
import { getMembers } from '@/services/member';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useNavbarAction } from '../layout';
import { utils, writeFile } from 'xlsx';

export default function TKKPage() {
  const queryClient = useQueryClient();
  const { setButtonAction } = useNavbarAction();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [updateConfirmModal, setUpdateConfirmModal] = useState(false);

  const [params, setParams] = useState({ search: '', page: 1, limit: 10 });
  const [paramsMember, setParamsMember] = useState({ search: '', page: 1, limit: 10 });
  const [activeTab, setActiveTab] = useState<'bantara' | 'laksana'>('bantara');

  const [updateData, setUpdateData] = useState<TkuData | null>(null);
  const [dataDelete, setDataDelete] = useState<TkuData | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const { data: memberOptions, isPending: isPendingMember } = useQuery({
    queryKey: ['members', paramsMember],
    queryFn: async () => getMembers(paramsMember),
  });
  const { data: summary, isPending: isPendingSummary } = useQuery({
    queryKey: ['tku-summary'],
    queryFn: getSummary,
  });
  const {
    data: dataBantara,
    refetch: refetchBantara,
    isPending: isPendingBantara,
  } = useQuery({
    queryKey: ['tku-bantara', params],
    queryFn: () => getBantara(params),
    retry: 1,
    retryDelay: 1000,
    enabled: activeTab === 'bantara',
  });
  const {
    data: dataLaksana,
    refetch: refetchLaksana,
    isPending: isPendingLaksana,
  } = useQuery({
    queryKey: ['tku-laksana', params],
    queryFn: () => getLaksana(params),
    retry: 1,
    retryDelay: 1000,
    enabled: activeTab === 'laksana',
  });

  const createDataBantara = useMutation({
    mutationFn: createBantara,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tku-bantara'] });
      setModalOpen(false);
    },
  });

  const createDataLaksana = useMutation({
    mutationFn: createLaksana,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tku-laksana'] });
      setModalOpen(false);
    },
  });

  const deleteDataBantara = useMutation({
    mutationFn: (id: string) => deleteBantara(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tku-bantara'] });
    },
  });
  const deleteDataLaksana = useMutation({
    mutationFn: (id: string) => deleteLaksana(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tku-laksana'] });
    },
  });
  const handleSubmit = async (data: { member_id: string }) => {
    await toast.promise(createDataBantara.mutateAsync(data), {
      loading: 'Mengirim permintaan...',
      success: 'Data berhasil disimpan!',
      error: (err) => `Gagal menyimpan request: ${err}`,
    });
  };

  const handleConfirmUpdate = async () => {
    if (activeTab === 'bantara') {
      await toast.promise(createDataLaksana.mutateAsync({ id: updateData?._id || '' }), {
        loading: 'Mengupdate data...',
        success: 'Data berhasil diupdate!',
        error: (err) => `Gagal mengupdate data: ${err}`,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (activeTab === 'bantara') {
      await toast.promise(deleteDataBantara.mutateAsync(dataDelete?._id || ''), {
        loading: 'Menghapus data...',
        success: 'Data berhasil dihapus!',
        error: (err) => `Gagal menghapus data: ${err}`,
      });
    } else if (activeTab === 'laksana') {
      await toast.promise(deleteDataLaksana.mutateAsync(dataDelete?._id || ''), {
        loading: 'Menghapus data...',
        success: 'Data berhasil dihapus!',
        error: (err) => `Gagal menghapus data: ${err}`,
      });
    }
  };

  const handleUpdate = (item: TkuData) => {
    setUpdateData(item);
    setUpdateConfirmModal(true);
  };

  const handleDelete = (item: TkuData) => {
    setDataDelete(item);
    setDeleteModal(true);
  };

  const handleExport = async () => {
    try {
      const response = await exportTku();

      const rows = response.data.map((item: any) => ({
        Nama: item.member_name || '',
        NTA: item.member_number || '',
        Lembaga: item.institution_name || '',
        'TKU Bantara': item.bantara ? 'Ya' : 'Tidak',
        'TKU Laksana': item.laksana ? 'Ya' : 'Tidak',
        'Tanggal Bantara': item.date_bantara ? new Date(item.date_bantara).toLocaleDateString() : '',
        'Tanggal Laksana': item.date_laksana ? new Date(item.date_laksana).toLocaleDateString() : '',
        'SK Bantara': item.sk_bantara || '',
        'SK Laksana': item.sk_laksana || '',
      }));

      const worksheet = utils.json_to_sheet(rows);
      const workbook = utils.book_new();

      utils.book_append_sheet(workbook, worksheet, 'RekapData');

      // Tambahkan header manual di baris A1
      utils.sheet_add_aoa(worksheet, [['Nama', 'NTA', 'Lembaga', 'TKU Bantara', 'TKU Laksana', 'Tanggal Bantara', 'Tanggal Laksana', 'SK Bantara', 'SK Laksana']], { origin: 'A1' });

      worksheet['!cols'] = [
        { wch: 20 }, // Nama
        { wch: 15 }, // NTA
        { wch: 30 }, // Lembaga
        { wch: 10 }, // TKU Bantara
        { wch: 10 }, // TKU Laksana
        { wch: 15 }, // Tanggal Bantara
        { wch: 15 }, // Tanggal Laksana
        { wch: 25 }, // SK Bantara
        { wch: 25 }, // SK Laksana
      ];

      writeFile(workbook, 'RekapTKU.xlsx', { compression: true });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Gagal mengunduh template. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    if (activeTab) {
      if (activeTab === 'bantara') {
        setParams((prev) => ({ ...prev, page: 1 }));
        refetchBantara();
      } else if (activeTab === 'laksana') {
        setParams((prev) => ({ ...prev, page: 1 }));
        refetchLaksana();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    setButtonAction(
      <div className="flex items-center gap-2">
        <Button className="bg-primary-500 hover:bg-primary-600" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Bantara
        </Button>

        <Button className="bg-green-600 hover:bg-green-700" onClick={handleExport}>
          <FolderDown className="w-4 h-4 mr-2" />
          Excel
        </Button>
      </div>
    );
    return () => setButtonAction(undefined);
  }, [setButtonAction]);

  // Columns per tab
  const columnsBantara: ColumnDef<TkuData>[] = [
    {
      header: 'Nama',
      accessor: 'member.name',
      cell: (item) => item.member?.name || '-',
    },
    {
      header: 'NTA',
      accessor: 'member.member_number',
      cell: (item) => item.member?.member_number || '-',
    },
    {
      header: 'Lembaga',
      accessor: 'institution.name',
      cell: (item) => item.institution?.name || '-',
    },
    {
      header: 'SK Bantara',
      accessor: 'sk_bantara',
    },
    {
      header: 'Tanggal Bantara',
      accessor: 'date_bantara',
      cell: (item) => (item.date_bantara ? moment(item.date_bantara).format('DD/MM/YYYY') : '-'),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div className="flex gap-4 items-center">
          <Button disabled={item.laksana} onClick={() => handleUpdate(item)} size="icon" className="size-8 bg-blue-50 hover:bg-blue-100 text-blue-600">
            <CircleCheckBig className="h-4 w-4" />
          </Button>
          <Button disabled={item.laksana} onClick={() => handleDelete(item)} size="icon" className="size-8 bg-red-50 hover:bg-red-100 text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const columnsLaksana: ColumnDef<TkuData>[] = [
    {
      header: 'Nama',
      accessor: 'member.name',
      cell: (item) => item.member?.name || '-',
    },
    {
      header: 'NTA',
      accessor: 'member.member_number',
      cell: (item) => item.member?.member_number || '-',
    },
    {
      header: 'Lembaga',
      accessor: 'institution.name',
      cell: (item) => item.institution?.name || '-',
    },
    {
      header: 'SK Laksana',
      accessor: 'sk_laksana',
    },
    {
      header: 'Tanggal Laksana',
      accessor: 'date_laksana',
      cell: (item) => (item.date_laksana ? moment(item.date_laksana).format('DD/MM/YYYY') : '-'),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div className="flex gap-4 items-center">
          <Button onClick={() => handleDelete(item)} size="icon" className="size-8 bg-red-50 hover:bg-red-100 text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-primary-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bantara</CardTitle>
            <div className="p-2 rounded-full bg-blue-500">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : summary?.total_bantara ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Laksana</CardTitle>
            <div className="p-2 rounded-full bg-green-500">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : summary?.total_laksana ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Bantara, Laksana */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full mt-6">
        <TabsList className="mb-4 bg-gray-200">
          <TabsTrigger className="w-20" value="bantara">
            Bantara
          </TabsTrigger>
          <TabsTrigger className="w-20" value="laksana">
            Laksana
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bantara">
          <Card>
            <CardHeader>
              <CardTitle>Daftar TKU Bantara</CardTitle>
              <CardAction>
                <div className="relative sm:max-w-xs w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari berdasarkan nama..." className="pl-8" value={params.search} onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsBantara}
                data={dataBantara?.data}
                isLoading={isPendingBantara}
                keyField="_id"
                emptyMessage={{
                  title: 'Data TKU Bantara tidak ditemukan',
                  description: 'Tambahkan data TKU Bantara anggota',
                  buttonText: 'Tambah TKU Bantara',
                  icon: Plus,
                  onButtonClick: () => setShowAddModal(true),
                }}
              />
              <CustomPagination
                currentPage={params.page}
                totalPages={dataBantara?.pagination?.total_pages}
                onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
                itemsPerPage={params.limit}
                onItemsPerPageChange={(limit) => setParams((prev) => ({ ...prev, limit, page: 1 }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="laksana">
          <Card>
            <CardHeader>
              <CardTitle>Daftar TKU Laksana</CardTitle>
              <CardAction>
                <div className="relative sm:max-w-xs w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari berdasarkan nama..." className="pl-8" value={params.search} onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsLaksana}
                data={dataLaksana?.data}
                isLoading={isPendingLaksana}
                keyField="_id"
                emptyMessage={{
                  title: 'Data TKU Laksana tidak ditemukan',
                  description: 'Update data dari Bantara untuk menambahkan data Laksana',
                  icon: FileText,
                }}
              />
              <CustomPagination
                currentPage={params.page}
                totalPages={dataLaksana?.pagination?.total_pages}
                onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
                itemsPerPage={params.limit}
                onItemsPerPageChange={(limit) => setParams((prev) => ({ ...prev, limit, page: 1 }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmation
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data TKU"
        description="Apakah Anda yakin ingin menghapus data TKU ini? Aksi ini tidak dapat dibatalkan."
        itemName={dataDelete?.member?.name || ''}
        isLoading={activeTab === 'bantara' ? deleteDataBantara.isPending : deleteDataLaksana.isPending}
      />

      <UpdateConfirmation
        isOpen={updateConfirmModal}
        onClose={() => setUpdateConfirmModal(false)}
        onConfirm={handleConfirmUpdate}
        title="Update Data TKU"
        description="Apakah Anda yakin ingin mengupdate data TKU ini? Aksi ini tidak dapat dibatalkan."
        itemName={updateData?.member?.name || ''}
        isLoading={createDataLaksana.isPending}
      />

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Tambah Data TKU</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedMemberId) {
                handleSubmit({ member_id: selectedMemberId });
                setShowAddModal(false);
                setSelectedMemberId('');
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="member_id">Pilih Anggota</Label>
              <SearchableSelect
                value={selectedMemberId ?? ''}
                options={memberOptions?.data}
                isLoading={isPendingMember}
                placeholder="Pilih anggota"
                searchValue={paramsMember.search}
                onValueChange={(value) => setSelectedMemberId(value)}
                onSearchChange={(value) => setParamsMember((prev) => ({ ...prev, search: value }))}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white" disabled={!selectedMemberId}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
