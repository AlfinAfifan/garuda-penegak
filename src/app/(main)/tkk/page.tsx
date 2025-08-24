'use client';

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Trophy, Plus, Search, Filter, CheckCircle, Clock, AlertCircle, SquarePen, Trash2, FileText, CircleCheckBig, FolderDown } from 'lucide-react';
import { ColumnDef, DataTable } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/ui/pagination';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';
import moment from 'moment';
import { getMembers } from '@/services/member';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { createMadya, createPurwa, createUtama, deleteMadya, deletePurwa, deleteUtama, exportTkk, getMadya, getPurwa, getSummary, getUtama, MadyaPayload, PurwaPayload, UtamaPayload } from '@/services/tkk';
import { TkkData } from './types';
import { useNavbarAction } from '../layout';
import { getTypeTkk } from '@/services/type-tkk';
import { utils, writeFile } from 'xlsx';

export default function TKKPage() {
  const queryClient = useQueryClient();
  const { setButtonAction } = useNavbarAction();

  const [modalOpen, setModalOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [paramsPurwa, setParamsPurwa] = useState({ search: '', page: 1, limit: 10 });
  const [paramsMadya, setParamsMadya] = useState({ search: '', page: 1, limit: 10 });
  const [paramsUtama, setParamsUtama] = useState({ search: '', page: 1, limit: 10 });
  const [paramsMember, setParamsMember] = useState({ search: '', page: 1, limit: 10 });
  const [paramsTypeTkk, setParamsTypeTkk] = useState({ search: '', page: 1, limit: 10 });
  const [activeTab, setActiveTab] = useState<'purwa' | 'madya' | 'utama'>('purwa');

  const [dataDelete, setDataDelete] = useState<TkkData | null>(null);

  const [formPurwa, setFormPurwa] = useState<PurwaPayload>({
    member_id: '',
    type_tkk_id: '',
    examiner_name_purwa: '',
    examiner_address_purwa: '',
    examiner_position_purwa: '',
  });
  const [formMadya, setFormMadya] = useState<MadyaPayload>({
    id: '',
    examiner_name_madya: '',
    examiner_address_madya: '',
    examiner_position_madya: '',
  });
  const [formUtama, setFormUtama] = useState<UtamaPayload>({
    id: '',
    examiner_name_utama: '',
    examiner_address_utama: '',
    examiner_position_utama: '',
  });

  const { data: memberOptions, isPending: isPendingMember } = useQuery({
    queryKey: ['members', paramsMember],
    queryFn: async () => getMembers(paramsMember),
  });
  const { data: typeTkkOptions, isPending: isPendingTypeTkk } = useQuery({
    queryKey: ['type-tkk', paramsTypeTkk],
    queryFn: async () => getTypeTkk(paramsTypeTkk),
  });
  const { data: summary, isPending: isPendingSummary } = useQuery({
    queryKey: ['tkk-summary'],
    queryFn: getSummary,
  });
  const {
    data: dataPurwa,
    refetch: refetchPurwa,
    isPending: isPendingPurwa,
  } = useQuery({
    queryKey: ['tkk-purwa', paramsPurwa],
    queryFn: () => getPurwa(paramsPurwa),
    retry: 1,
    retryDelay: 1000,
  });
  const {
    data: dataMadya,
    refetch: refetchMadya,
    isPending: isPendingMadya,
  } = useQuery({
    queryKey: ['tkk-madya', paramsMadya],
    queryFn: () => getMadya(paramsMadya),
    retry: 1,
    retryDelay: 1000,
  });
  const {
    data: dataUtama,
    refetch: refetchUtama,
    isPending: isPendingUtama,
  } = useQuery({
    queryKey: ['tkk-utama', paramsUtama],
    queryFn: () => getUtama(paramsUtama),
    retry: 1,
    retryDelay: 1000,
  });

  const createDataPurwa = useMutation({
    mutationFn: createPurwa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkk-purwa'] });
      setModalOpen(false);
    },
  });

  const createDataMadya = useMutation({
    mutationFn: createMadya,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkk-madya'] });
      setModalOpen(false);
    },
  });

  const createDataUtama = useMutation({
    mutationFn: createUtama,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkk-utama'] });
      setModalOpen(false);
    },
  });

  const deleteDataPurwa = useMutation({
    mutationFn: (id: string) => deletePurwa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkk-purwa'] });
    },
  });
  const deleteDataMadya = useMutation({
    mutationFn: (id: string) => deleteMadya(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkk-madya'] });
    },
  });
  const deleteDataUtama = useMutation({
    mutationFn: (id: string) => deleteUtama(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkk-utama'] });
    },
  });

  const handleSubmitPurwa = async (e: React.FormEvent) => {
    e.preventDefault();
    await toast.promise(createDataPurwa.mutateAsync(formPurwa), {
      loading: 'Mengirim permintaan...',
      success: 'Data berhasil disimpan!',
      error: (err) => `Gagal menyimpan request: ${err}`,
    });
    setShowAddModal(false);
    setFormPurwa({
      member_id: '',
      type_tkk_id: '',
      examiner_name_purwa: '',
      examiner_address_purwa: '',
      examiner_position_purwa: '',
    });
  };

  const handleSubmitMadya = async (e: React.FormEvent) => {
    e.preventDefault();
    await toast.promise(createDataMadya.mutateAsync(formMadya), {
      loading: 'Mengirim permintaan...',
      success: 'Data berhasil disimpan!',
      error: (err) => `Gagal menyimpan request: ${err}`,
    });
    setShowUpdateModal(false);
    setFormMadya({
      id: '',
      examiner_name_madya: '',
      examiner_address_madya: '',
      examiner_position_madya: '',
    });
  };

  const handleSubmitUtama = async (e: React.FormEvent) => {
    e.preventDefault();
    await toast.promise(createDataUtama.mutateAsync(formUtama), {
      loading: 'Mengirim permintaan...',
      success: 'Data berhasil disimpan!',
      error: (err) => `Gagal menyimpan request: ${err}`,
    });
    setShowUpdateModal(false);
    setFormUtama({
      id: '',
      examiner_name_utama: '',
      examiner_address_utama: '',
      examiner_position_utama: '',
    });
  };

  const handleConfirmDelete = async () => {
    if (activeTab === 'purwa') {
      await toast.promise(deleteDataPurwa.mutateAsync(dataDelete?._id || ''), {
        loading: 'Menghapus data...',
        success: 'Data berhasil dihapus!',
        error: (err) => `Gagal menghapus data: ${err}`,
      });
    } else if (activeTab === 'madya') {
      await toast.promise(deleteDataMadya.mutateAsync(dataDelete?._id || ''), {
        loading: 'Menghapus data...',
        success: 'Data berhasil dihapus!',
        error: (err) => `Gagal menghapus data: ${err}`,
      });
    } else if (activeTab === 'utama') {
      await toast.promise(deleteDataUtama.mutateAsync(dataDelete?._id || ''), {
        loading: 'Menghapus data...',
        success: 'Data berhasil dihapus!',
        error: (err) => `Gagal menghapus data: ${err}`,
      });
    }
  };

  const handleUpdate = (item: TkkData) => {
    if (activeTab === 'purwa') {
      setFormMadya((prev) => ({ ...prev, id: item._id }));
    } else if (activeTab === 'madya') {
      setFormUtama((prev) => ({ ...prev, id: item._id }));
    }
    setShowUpdateModal(true);
  };

  const handleDelete = (item: TkkData) => {
    setDataDelete(item);
    setDeleteModal(true);
  };

  const handleExport = async () => {
    try {
      const response = await exportTkk();

      const rows = response.data.map((item: any) => ({
        Nama: item.member_name || '',
        NTA: item.member_number || '',
        Lembaga: item.institution_name || '',
        'TKK Purwa': item.purwa ? 'Ya' : 'Tidak',
        'TKK Madya': item.madya ? 'Ya' : 'Tidak',
        'TKK Utama': item.utama ? 'Ya' : 'Tidak',
        'Tanggal Purwa': item.date_purwa || '',
        'Tanggal Madya': item.date_madya || '',
        'Tanggal Utama': item.date_utama || '',
        'SK Purwa': item.sk_purwa || '',
        'SK Madya': item.sk_madya || '',
        'SK Utama': item.sk_utama || '',
        'Penguji Purwa': item.examiner_name_purwa || '',
        'Posisi Penguji Purwa': item.examiner_position_purwa || '',
        'Alamat Penguji Purwa': item.examiner_address_purwa || '',
        'Penguji Madya': item.examiner_name_madya || '',
        'Posisi Penguji Madya': item.examiner_position_madya || '',
        'Alamat Penguji Madya': item.examiner_address_madya || '',
        'Penguji Utama': item.examiner_name_utama || '',
        'Posisi Penguji Utama': item.examiner_position_utama || '',
        'Alamat Penguji Utama': item.examiner_address_utama || '',
      }));

      const worksheet = utils.json_to_sheet(rows);
      const workbook = utils.book_new();

      utils.book_append_sheet(workbook, worksheet, 'RekapTKK');
      utils.sheet_add_aoa(
        worksheet,
        [
          [
            'Nama',
            'NTA',
            'Lembaga',
            'TKK Purwa',
            'TKK Madya',
            'TKK Utama',
            'Tanggal Purwa',
            'Tanggal Madya',
            'Tanggal Utama',
            'SK Purwa',
            'SK Madya',
            'SK Utama',
            'Penguji Purwa',
            'Posisi Penguji Purwa',
            'Alamat Penguji Purwa',
            'Penguji Madya',
            'Posisi Penguji Madya',
            'Alamat Penguji Madya',
            'Penguji Utama',
            'Posisi Penguji Utama',
            'Alamat Penguji Utama',
          ],
        ],
        { origin: 'A1' }
      );

      worksheet['!cols'] = [
        { wch: 20 }, // Nama
        { wch: 15 }, // NTA
        { wch: 25 }, // Lembaga
        { wch: 10 }, // TKK
        { wch: 15 }, // Tanggal
        { wch: 20 }, // SK
        { wch: 25 }, // Penguji
      ];

      writeFile(workbook, 'RekapTKK.xlsx', {
        compression: true,
      });
    } catch (error) {
      console.error('Error downloading export:', error);
      toast.error('Gagal mengunduh data. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    if (activeTab) {
      if (activeTab === 'purwa') {
        setParamsPurwa((prev) => ({ ...prev, page: 1 }));
        refetchPurwa();
      } else if (activeTab === 'madya') {
        setParamsMadya((prev) => ({ ...prev, page: 1 }));
        refetchMadya();
      } else if (activeTab === 'utama') {
        setParamsUtama((prev) => ({ ...prev, page: 1 }));
        refetchUtama();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    setButtonAction(
      <div className="flex items-center space-x-2">
        <Button className="bg-primary-500 hover:bg-primary-600" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Data
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
  const columnsPurwa: ColumnDef<TkkData>[] = [
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
      header: 'Jenis TKK',
      accessor: 'type_tkk.name',
    },
    {
      header: 'SK',
      accessor: 'sk_purwa',
    },
    {
      header: 'Penguji',
      accessor: 'examiner_name_purwa',
    },
    {
      header: 'Tanggal Purwa',
      accessor: 'date_purwa',
      cell: (item) => (item.date_purwa ? moment(item.date_purwa).format('DD/MM/YYYY') : '-'),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div className="flex gap-4 items-center">
          <Button disabled={item.madya} onClick={() => handleUpdate(item)} size="icon" className="size-8 bg-blue-50 hover:bg-blue-100 text-blue-600">
            <CircleCheckBig className="h-4 w-4" />
          </Button>
          <Button disabled={item.madya} onClick={() => handleDelete(item)} size="icon" className="size-8 bg-red-50 hover:bg-red-100 text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const columnsMadya: ColumnDef<TkkData>[] = [
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
      header: 'Jenis TKK',
      accessor: 'type_tkk.name',
    },
    {
      header: 'SK',
      accessor: 'sk_madya',
    },
    {
      header: 'Penguji',
      accessor: 'examiner_name_madya',
    },
    {
      header: 'Tanggal Madya',
      accessor: 'date_madya',
      cell: (item) => (item.date_madya ? moment(item.date_madya).format('DD/MM/YYYY') : '-'),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div className="flex gap-4 items-center">
          <Button disabled={item.utama} onClick={() => handleUpdate(item)} size="icon" className="size-8 bg-blue-50 hover:bg-blue-100 text-blue-600">
            <CircleCheckBig className="h-4 w-4" />
          </Button>
          <Button disabled={item.utama} onClick={() => handleDelete(item)} size="icon" className="size-8 bg-red-50 hover:bg-red-100 text-red-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const columnsUtama: ColumnDef<TkkData>[] = [
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
      header: 'Jenis TKK',
      accessor: 'type_tkk.name',
    },
    {
      header: 'SK',
      accessor: 'sk_utama',
    },
    {
      header: 'Penguji',
      accessor: 'examiner_name_utama',
    },
    {
      header: 'Tanggal Utama',
      accessor: 'date_utama',
      cell: (item) => (item.date_utama ? moment(item.date_utama).format('DD/MM/YYYY') : '-'),
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
      <Dialog
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) {
            setFormPurwa({
              member_id: '',
              type_tkk_id: '',
              examiner_name_purwa: '',
              examiner_address_purwa: '',
              examiner_position_purwa: '',
            });
          }
        }}
      >
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Tambah Data TKK</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPurwa} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="member_id">Pilih Anggota</Label>
              <SearchableSelect
                value={formPurwa.member_id ?? ''}
                options={memberOptions?.data}
                isLoading={isPendingMember}
                placeholder="Pilih anggota"
                searchValue={paramsMember.search}
                onValueChange={(value) => setFormPurwa((prev) => ({ ...prev, member_id: value }))}
                onSearchChange={(value) => setParamsMember((prev) => ({ ...prev, search: value }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type_tkk_id">Pilih Jenis TKK</Label>
              <SearchableSelect
                value={formPurwa.type_tkk_id ?? ''}
                options={typeTkkOptions?.data}
                isLoading={isPendingTypeTkk}
                placeholder="Pilih jenis TKK"
                searchValue={paramsTypeTkk.search}
                onValueChange={(value) => setFormPurwa((prev) => ({ ...prev, type_tkk_id: value }))}
                onSearchChange={(value) => setParamsTypeTkk((prev) => ({ ...prev, search: value }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examiner_name_purwa">Nama Penguji</Label>
              <Input id="examiner_name_purwa" value={formPurwa.examiner_name_purwa} onChange={(e) => setFormPurwa((prev) => ({ ...prev, examiner_name_purwa: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examiner_address_purwa">Alamat Penguji</Label>
              <Input id="examiner_address_purwa" value={formPurwa.examiner_address_purwa} onChange={(e) => setFormPurwa((prev) => ({ ...prev, examiner_address_purwa: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examiner_position_purwa">Jabatan Penguji</Label>
              <Input id="examiner_position_purwa" value={formPurwa.examiner_position_purwa} onChange={(e) => setFormPurwa((prev) => ({ ...prev, examiner_position_purwa: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setFormPurwa({
                    member_id: '',
                    type_tkk_id: '',
                    examiner_name_purwa: '',
                    examiner_address_purwa: '',
                    examiner_position_purwa: '',
                  });
                }}
              >
                Batal
              </Button>
              <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white" disabled={!formPurwa.member_id}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Tambah Data (Purwa, Madya, Utama) */}
      <Dialog
        open={showUpdateModal}
        onOpenChange={(open) => {
          setShowUpdateModal(open);
          if (!open) {
            setFormMadya({ id: '', examiner_name_madya: '', examiner_address_madya: '', examiner_position_madya: '' });
            setFormUtama({ id: '', examiner_name_utama: '', examiner_address_utama: '', examiner_position_utama: '' });
          }
        }}
      >
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Update TKK ke {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</DialogTitle>
          </DialogHeader>
          {activeTab === 'purwa' && (
            <form onSubmit={handleSubmitMadya} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examiner_name_madya">Nama Penguji</Label>
                <Input id="examiner_name_madya" value={formMadya.examiner_name_madya} onChange={(e) => setFormMadya((prev) => ({ ...prev, examiner_name_madya: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examiner_address_madya">Alamat Penguji</Label>
                <Input id="examiner_address_madya" value={formMadya.examiner_address_madya} onChange={(e) => setFormMadya((prev) => ({ ...prev, examiner_address_madya: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examiner_position_madya">Jabatan Penguji</Label>
                <Input id="examiner_position_madya" value={formMadya.examiner_position_madya} onChange={(e) => setFormMadya((prev) => ({ ...prev, examiner_position_madya: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setFormMadya({ id: '', examiner_name_madya: '', examiner_address_madya: '', examiner_position_madya: '' });
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white" disabled={!formMadya.id}>
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          )}
          {activeTab === 'madya' && (
            <form onSubmit={handleSubmitUtama} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examiner_name_utama">Nama Penguji</Label>
                <Input id="examiner_name_utama" value={formUtama.examiner_name_utama} onChange={(e) => setFormUtama((prev) => ({ ...prev, examiner_name_utama: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examiner_address_utama">Alamat Penguji</Label>
                <Input id="examiner_address_utama" value={formUtama.examiner_address_utama} onChange={(e) => setFormUtama((prev) => ({ ...prev, examiner_address_utama: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="examiner_position_utama">Jabatan Penguji</Label>
                <Input id="examiner_position_utama" value={formUtama.examiner_position_utama} onChange={(e) => setFormUtama((prev) => ({ ...prev, examiner_position_utama: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormUtama({ id: '', examiner_name_utama: '', examiner_address_utama: '', examiner_position_utama: '' });
                  }}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white" disabled={!formUtama.id}>
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-primary-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Purwa</CardTitle>
            <div className="p-2 rounded-full bg-blue-500">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : summary?.total_purwa ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Madya</CardTitle>
            <div className="p-2 rounded-full bg-green-500">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : summary?.total_madya ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Utama</CardTitle>
            <div className="p-2 rounded-full bg-yellow-500">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : summary?.total_utama ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Purwa, Madya, Utama */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full mt-6">
        <TabsList className="mb-4 bg-gray-200">
          <TabsTrigger className="w-20" value="purwa">
            Purwa
          </TabsTrigger>
          <TabsTrigger className="w-20" value="madya">
            Madya
          </TabsTrigger>
          <TabsTrigger className="w-20" value="utama">
            Utama
          </TabsTrigger>
        </TabsList>
        <TabsContent value="purwa">
          <Card>
            <CardHeader>
              <CardTitle>Daftar TKK Purwa</CardTitle>
              <CardAction>
                <div className="relative sm:max-w-xs w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari berdasarkan nama..." className="pl-8" value={paramsPurwa.search} onChange={(e) => setParamsPurwa((prev) => ({ ...prev, page: 1, search: e.target.value }))} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsPurwa}
                data={dataPurwa?.data}
                isLoading={isPendingPurwa}
                keyField="_id"
                emptyMessage={{
                  title: 'Data TKK Purwa tidak ditemukan',
                  description: 'Tambahkan data TKK Purwa anggota',
                  buttonText: 'Tambah TKK Purwa',
                  icon: Plus,
                  onButtonClick: () => setShowAddModal(true),
                }}
              />
              <CustomPagination
                currentPage={paramsPurwa.page}
                totalPages={dataPurwa?.pagination?.total_pages}
                onPageChange={(page) => setParamsPurwa((prev) => ({ ...prev, page }))}
                itemsPerPage={paramsPurwa.limit}
                onItemsPerPageChange={(limit) => setParamsPurwa((prev) => ({ ...prev, limit, page: 1 }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="madya">
          <Card>
            <CardHeader>
              <CardTitle>Daftar TKK Madya</CardTitle>
              <CardAction>
                <div className="relative sm:max-w-xs w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari berdasarkan nama..." className="pl-8" value={paramsMadya.search} onChange={(e) => setParamsMadya((prev) => ({ ...prev, search: e.target.value }))} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsMadya}
                data={dataMadya?.data}
                isLoading={isPendingMadya}
                keyField="_id"
                emptyMessage={{
                  title: 'Data TKK Madya tidak ditemukan',
                  description: 'Update data dari Purwa untuk menambahkan data Madya',
                  icon: FileText,
                }}
              />
              <CustomPagination
                currentPage={paramsMadya.page}
                totalPages={dataMadya?.pagination?.total_pages}
                onPageChange={(page) => setParamsMadya((prev) => ({ ...prev, page }))}
                itemsPerPage={paramsMadya.limit}
                onItemsPerPageChange={(limit) => setParamsMadya((prev) => ({ ...prev, limit, page: 1 }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="utama">
          <Card>
            <CardHeader>
              <CardTitle>Daftar TKK Utama</CardTitle>
              <CardAction>
                <div className="relative sm:max-w-xs w-80">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari berdasarkan nama..." className="pl-8" value={paramsUtama.search} onChange={(e) => setParamsUtama((prev) => ({ ...prev, search: e.target.value }))} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsUtama}
                data={dataUtama?.data}
                isLoading={isPendingUtama}
                keyField="_id"
                emptyMessage={{
                  title: 'Data TKK Utama tidak ditemukan',
                  description: 'Update data dari Madya untuk menambahkan data Utama',
                  icon: FileText,
                }}
              />
              <CustomPagination
                currentPage={paramsUtama.page}
                totalPages={dataUtama?.pagination?.total_pages}
                onPageChange={(page) => setParamsUtama((prev) => ({ ...prev, page }))}
                itemsPerPage={paramsUtama.limit}
                onItemsPerPageChange={(limit) => setParamsUtama((prev) => ({ ...prev, limit, page: 1 }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmation
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data TKK"
        description="Apakah Anda yakin ingin menghapus data TKK ini? Aksi ini tidak dapat dibatalkan."
        itemName={dataDelete?.member?.name || ''}
        isLoading={activeTab === 'purwa' ? deleteDataPurwa.isPending : activeTab === 'madya' ? deleteDataMadya.isPending : deleteDataUtama.isPending}
      />
    </div>
  );
}
