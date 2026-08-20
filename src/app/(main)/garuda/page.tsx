'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/components/ui/card';
import { CheckCircle, CircleCheckBig, Clock, FileDown, FileText, Plus, Printer, Search, SquarePen, Trash2, Trophy, X } from 'lucide-react';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { getInstitution } from '@/services/instantion';
import { downloadGarudaCertificate, downloadGarudaCertificates, MAX_BULK_CERTIFICATE } from '@/lib/generate-certificate';
import moment from 'moment';
import { Checkbox } from '@/components/ui/checkbox';

export default function GarudaPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { setButtonAction } = useNavbarAction();
  const isAdminKecamatan = session?.user?.role === 'admin_kecamatan';
  const isUser = session?.user?.role === 'user';

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [updateConfirmModal, setUpdateConfirmModal] = useState(false);

  const [params, setParams] = useState({ search: '', page: 1, limit: 10, institution_id: '' });
  const [paramsInstitution, setParamsInstitution] = useState({ search: '', page: 1, limit: 10 });

  const [editingData, setEditingData] = useState<GarudaData | null>(null);
  const [dataDelete, setDataDelete] = useState<GarudaData | null>(null);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  // data terpilih disimpan utuh supaya pilihan tetap bertahan saat pindah halaman/filter
  const [selected, setSelected] = useState<Record<string, GarudaData>>({});
  const [isBulkPending, setIsBulkPending] = useState(false);

  const [initialValues, setInitialValues] = useState<GarudaPayload>({
    member_id: '',
  });

  const { data: summary, isPending: isPendingSummary } = useQuery({
    queryKey: ['garuda-summary'],
    queryFn: () => getSummaryGaruda(),
    retry: 1,
    retryDelay: 1000,
  });

  // Daftar lembaga untuk filter (user hanya melihat lembaganya sendiri)
  const { data: dataInstitution, isPending: isPendingInstitution } = useQuery({
    queryKey: ['institutions', paramsInstitution],
    queryFn: () => getInstitution(paramsInstitution),
    enabled: !isUser,
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

  /** Ubah satu baris tabel jadi data yang dicetak di sertifikat. */
  const toCertificate = (item: GarudaData) => ({
    name: item.member_id?.name || '',
    nta: item.member_id?.nta || '',
    institution: item.institution_name || '',
    date: item.approved_at,
    number: item.certificate_number,
    year: item.certificate_year,
  });

  const handleDownloadCertificate = async (item: GarudaData) => {
    setCertificateId(item._id);
    try {
      await toast.promise(downloadGarudaCertificate(toCertificate(item)), {
        loading: 'Menyiapkan sertifikat...',
        success: 'Sertifikat berhasil diunduh!',
        error: (err) => `Gagal membuat sertifikat: ${err.message}`,
      });
    } finally {
      setCertificateId(null);
    }
  };

  const selectedList = useMemo(() => Object.values(selected), [selected]);
  const selectedCount = selectedList.length;

  // hanya data approved yang punya sertifikat, jadi hanya itu yang bisa dipilih
  const printableRows = useMemo(() => (data?.data ?? []).filter((item: GarudaData) => item.status === 1), [data]);
  const selectedOnPage = printableRows.filter((item: GarudaData) => selected[item._id]).length;
  const isAllPageSelected = printableRows.length > 0 && selectedOnPage === printableRows.length;

  const handleToggleRow = (item: GarudaData) => {
    const isSelected = Boolean(selected[item._id]);
    if (!isSelected && selectedCount >= MAX_BULK_CERTIFICATE) {
      toast.error(`Maksimal ${MAX_BULK_CERTIFICATE} data per sekali cetak`);
      return;
    }
    setSelected((prev) => {
      const next = { ...prev };
      if (isSelected) delete next[item._id];
      else next[item._id] = item;
      return next;
    });
  };

  const handleToggleAllOnPage = () => {
    if (isAllPageSelected) {
      setSelected((prev) => {
        const next = { ...prev };
        printableRows.forEach((item: GarudaData) => delete next[item._id]);
        return next;
      });
      return;
    }

    const next = { ...selected };
    let skipped = 0;
    printableRows.forEach((item: GarudaData) => {
      if (next[item._id]) return;
      if (Object.keys(next).length >= MAX_BULK_CERTIFICATE) {
        skipped += 1;
        return;
      }
      next[item._id] = item;
    });
    if (skipped > 0) {
      toast.error(`Maksimal ${MAX_BULK_CERTIFICATE} data, ${skipped} data tidak ikut terpilih`);
    }
    setSelected(next);
  };

  const handleBulkDownload = async () => {
    setIsBulkPending(true);
    try {
      await toast.promise(downloadGarudaCertificates(selectedList.map(toCertificate)), {
        loading: `Menyiapkan ${selectedCount} sertifikat...`,
        success: 'Sertifikat berhasil diunduh!',
        error: (err) => `Gagal membuat sertifikat: ${err.message}`,
      });
      setSelected({});
    } catch {
      // pesan error sudah ditampilkan lewat toast
    } finally {
      setIsBulkPending(false);
    }
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
    // admin_kecamatan hanya bisa view, tidak bisa tambah garuda
    if (!isAdminKecamatan) {
      setButtonAction(
        <Button className="bg-primary-600 hover:bg-primary-700" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Garuda
        </Button>,
      );
    }
    return () => setButtonAction(undefined);
  }, [setButtonAction, isAdminKecamatan]);

  const columns: ColumnDef<GarudaData>[] = [
    {
      id: 'select',
      className: 'w-10',
      header: (
        <Checkbox
          checked={isAllPageSelected}
          indeterminate={selectedOnPage > 0 && !isAllPageSelected}
          onChange={handleToggleAllOnPage}
          disabled={printableRows.length === 0 || isBulkPending}
          aria-label="Pilih semua data approved di halaman ini"
        />
      ),
      cell: (item) => (
        <Checkbox
          checked={Boolean(selected[item._id])}
          onChange={() => handleToggleRow(item)}
          disabled={item.status !== 1 || isBulkPending}
          title={item.status !== 1 ? 'Hanya data approved yang punya sertifikat' : 'Pilih untuk cetak massal'}
          aria-label={`Pilih ${item.member_id?.name || 'data'}`}
        />
      ),
    },
    { header: 'Anggota', accessor: 'member_id.name' },
    { header: 'NTA', accessor: 'member_id.nta' },
    { header: 'Lembaga', accessor: 'institution_name', cell: (item) => item.institution_name || '-' },
    { header: 'Kwaran', accessor: 'institution_sub_district', cell: (item) => <span className="capitalize">{item.institution_sub_district || '-'}</span> },
    { header: 'Level TKU', accessor: 'level_tku' },
    { header: 'Total TKK', accessor: 'total_tkk' },
    { header: 'Status', accessor: 'status', cell: (item) => getStatusBadge(item.status) },
    { header: 'Waktu Approve', accessor: 'approved_at', cell: (item) => (item.approved_at ? moment(item.approved_at).format('DD/MM/YYYY HH:mm') : '-') },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div className="flex items-center space-x-2">
          {/* admin_kecamatan tidak bisa approve atau delete */}
          <>
            {!isUser && (
              <Button disabled={item.status !== 0} onClick={() => handleUpdateStatus(item)} size="icon" className="size-8 bg-blue-50 hover:bg-blue-100 text-blue-600">
                <CircleCheckBig className="h-4 w-4" />
              </Button>
            )}

            {/* sertifikat hanya bisa dicetak untuk data yang sudah approved */}
            <Button
              disabled={item.status !== 1 || certificateId === item._id}
              onClick={() => handleDownloadCertificate(item)}
              size="icon"
              className="size-8 bg-green-50 hover:bg-green-100 text-green-600"
              title="Unduh sertifikat"
            >
              <FileDown className="h-4 w-4" />
            </Button>

            {!isAdminKecamatan && (
              <Button disabled={item.status !== 0} onClick={() => handleDelete(item)} size="icon" className="size-8 bg-red-50 hover:bg-red-100 text-red-600">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
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
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : (summary?.total_garuda ?? 0)}</div>
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
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : (summary?.total_approved ?? 0)}</div>
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
            <div className="text-2xl font-bold text-gray-900">{isPendingSummary ? '-' : (summary?.total_pending ?? 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Garuda</CardTitle>
          <CardAction className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!isUser && (
              <div className="flex items-center gap-1 w-full sm:w-64">
                <SearchableSelect
                  value={params.institution_id}
                  options={dataInstitution?.data ?? []}
                  isLoading={isPendingInstitution}
                  placeholder="Filter lembaga"
                  searchValue={paramsInstitution.search}
                  onValueChange={(value) => setParams((prev) => ({ ...prev, institution_id: value, page: 1 }))}
                  onSearchChange={(value) => setParamsInstitution((prev) => ({ ...prev, search: value }))}
                  className="w-full"
                />
                {params.institution_id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Hapus filter lembaga"
                    onClick={() => setParams((prev) => ({ ...prev, institution_id: '', page: 1 }))}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama / lembaga..."
                value={params.search}
                onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-8 w-full"
              />
              {params.search && (
                <button onClick={() => setParams((prev) => ({ ...prev, search: '', page: 1 }))} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          {selectedCount > 0 && (
            <div className="mb-4 flex flex-col gap-3 rounded-md border border-primary-200 bg-primary-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{selectedCount}</span> data dipilih (maksimal {MAX_BULK_CERTIFICATE} per sekali cetak)
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelected({})} disabled={isBulkPending}>
                  Batalkan pilihan
                </Button>
                <Button size="sm" className="bg-primary-600 hover:bg-primary-700" onClick={handleBulkDownload} disabled={isBulkPending}>
                  <Printer className="mr-2 h-4 w-4" />
                  {isBulkPending ? 'Menyiapkan...' : `Cetak ${selectedCount} Sertifikat`}
                </Button>
              </div>
            </div>
          )}

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
              onButtonClick: session?.user?.role !== 'admin_kecamatan' ? () => setModalOpen(true) : undefined,
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
