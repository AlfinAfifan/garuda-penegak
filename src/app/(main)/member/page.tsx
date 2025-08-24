'use client';

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Search, Filter, Trash2, ShieldUser, Funnel, SquarePen, MoreHorizontal, Pencil, SendHorizonal, Eye, FolderDown } from 'lucide-react';
import { ColumnDef, DataTable } from '@/components/ui/data-table';
import { CustomPagination } from '@/components/ui/pagination';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { DetailModal } from './DetailModal';
import { MemberData } from './types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMember, deleteMember, exportMembers, getMembers, MemberPayload, updateMember } from '@/services/member';
import toast from 'react-hot-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation';
import moment from 'moment';
import { InputModal } from '@/components/member/InputModal';
import { useNavbarAction } from '../layout';
import { utils, writeFile } from 'xlsx';
import { useSession } from 'next-auth/react';

export default function MemberPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { setButtonAction } = useNavbarAction();
  const isSuperAdmin = session?.user?.role === 'super_admin';

  const [params, setParams] = useState({
    search: '',
    page: 1,
    limit: 10,
  });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [editingData, setEditingData] = useState<MemberData | null>(null);
  const [dataDelete, setDataDelete] = useState<MemberData | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

  const [initialValues, setInitialValues] = useState<MemberPayload>({
    name: '',
    institution_id: isSuperAdmin ? '' : session?.user?.institution_id || '',
    member_number: '',
    parent_number: '',
    phone: '',
    gender: '',
    birth_place: '',
    birth_date: null,
    religion: '',
    nationality: '',
    rt: '',
    rw: '',
    village: '',
    sub_district: '',
    district: '',
    province: '',
    talent: '',
    father_name: '',
    father_birth_place: '',
    father_birth_date: null,
    mother_name: '',
    mother_birth_place: '',
    mother_birth_date: null,
    parent_address: '',
    parent_phone: '',
    entry_date: null,
    exit_date: null,
    entry_level: '',
    exit_reason: '',
  });

  const { data, isPending } = useQuery({
    queryKey: ['members', params],
    queryFn: () => getMembers(params),
    retry: 1,
    retryDelay: 1000,
  });

  const createData = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setModalOpen(false);
    },
  });

  const updateData = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberData }) => updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setModalOpen(false);
    },
  });

  const deleteData = useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setDeleteModal(false);
    },
  });

  const handleSubmit = async (data: MemberData) => {
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

  const confirmDelete = async () => {
    await toast.promise(deleteData.mutateAsync(dataDelete?._id || ''), {
      loading: 'Menghapus anggota...',
      success: 'Anggota berhasil dihapus!',
      error: (err) => `Gagal menghapus anggota: ${err.message}`,
    });
  };

  const setInitial = (item: MemberData) => {
    setInitialValues({
      name: item.name,
      institution_id: isSuperAdmin ? item.institution_id : session?.user?.institution_id || null,
      member_number: item.member_number,
      parent_number: item.parent_number,
      phone: item.phone,
      gender: item.gender,
      birth_place: item.birth_place,
      birth_date: item.birth_date,
      religion: item.religion,
      nationality: item.nationality,
      rt: item.rt,
      rw: item.rw,
      village: item.village,
      sub_district: item.sub_district,
      district: item.district,
      province: item.province,
      talent: item.talent,
      father_name: item.father_name,
      father_birth_place: item.father_birth_place,
      father_birth_date: item.father_birth_date,
      mother_name: item.mother_name,
      mother_birth_place: item.mother_birth_place,
      mother_birth_date: item.mother_birth_date,
      parent_address: item.parent_address,
      parent_phone: item.parent_phone,
      entry_date: item.entry_date,
      exit_date: item.exit_date,
      entry_level: item.entry_level,
      exit_reason: item.exit_reason,
    });
  };

  const handleEdit = (item: MemberData) => {
    setEditingData(item);
    setInitial(item);
    setModalOpen(true);
  };

  const handleDetail = (item: MemberData) => {
    setSelectedMember(item);
    setIsDetailOpen(true);
  };

  const handleDelete = (item: MemberData) => {
    setDataDelete(item);
    setDeleteModal(true);
  };

  const handleExport = async () => {
    try {
      const response = await exportMembers();

      const rows = response.data.map((item: any) => ({
        Nama: item.name || '',
        NTA: item.member_number || '',
        'No. Telp': item.phone || '',
        Lembaga: item.institution_name || '',
        'No Induk Orang Tua': item.parent_number || '',
        'Jenis Kelamin': item.gender || '',
        'Tempat Lahir': item.birth_place || '',
        'Tanggal Lahir': item.birth_date ? new Date(item.birth_date).toLocaleDateString('id-ID') : '',
        Agama: item.religion || '',
        Kewarganegaraan: item.nationality || '',
        RT: item.rt || '',
        RW: item.rw || '',
        'Kelurahan/Desa': item.village || '',
        Kecamatan: item.sub_district || '',
        'Kabupaten/Kota': item.district || '',
        Provinsi: item.province || '',
        Bakat: item.talent || '',
        'Nama Ayah': item.father_name || '',
        'Tempat Lahir Ayah': item.father_birth_place || '',
        'Tanggal Lahir Ayah': item.father_birth_date ? new Date(item.father_birth_date).toLocaleDateString('id-ID') : '',
        'Nama Ibu': item.mother_name || '',
        'Tempat Lahir Ibu': item.mother_birth_place || '',
        'Tanggal Lahir Ibu': item.mother_birth_date ? new Date(item.mother_birth_date).toLocaleDateString('id-ID') : '',
        'Alamat Orang Tua': item.parent_address || '',
        'Telp Orang Tua': item.parent_phone || '',
        'Tanggal Masuk': item.entry_date ? new Date(item.entry_date).toLocaleDateString('id-ID') : '',
        'Tingkat Masuk': item.entry_level || '',
        'Tanggal Keluar': item.exit_date ? new Date(item.exit_date).toLocaleDateString('id-ID') : '',
        'Alasan Keluar': item.exit_reason || '',
      }));

      const worksheet = utils.json_to_sheet(rows);
      const workbook = utils.book_new();

      utils.book_append_sheet(workbook, worksheet, 'DataAnggota');

      // Header columns
      const headers = [
        'Nama',
        'NTA',
        'No. Telp',
        'Lembaga',
        'No Induk Orang Tua',
        'Jenis Kelamin',
        'Tempat Lahir',
        'Tanggal Lahir',
        'Agama',
        'Kewarganegaraan',
        'RT',
        'RW',
        'Kelurahan/Desa',
        'Kecamatan',
        'Kabupaten/Kota',
        'Provinsi',
        'Bakat',
        'Nama Ayah',
        'Tempat Lahir Ayah',
        'Tanggal Lahir Ayah',
        'Nama Ibu',
        'Tempat Lahir Ibu',
        'Tanggal Lahir Ibu',
        'Alamat Orang Tua',
        'Telp Orang Tua',
        'Tanggal Masuk',
        'Tingkat Masuk',
        'Tanggal Keluar',
        'Alasan Keluar',
      ];

      utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

      // Set column widths for better readability
      worksheet['!cols'] = [
        { wch: 25 }, // Nama
        { wch: 15 }, // NTA
        { wch: 15 }, // No. Telp
        { wch: 30 }, // Lembaga
        { wch: 20 }, // No Induk Orang Tua
        { wch: 15 }, // Jenis Kelamin
        { wch: 20 }, // Tempat Lahir
        { wch: 15 }, // Tanggal Lahir
        { wch: 12 }, // Agama
        { wch: 15 }, // Kewarganegaraan
        { wch: 8 }, // RT
        { wch: 8 }, // RW
        { wch: 20 }, // Kelurahan/Desa
        { wch: 20 }, // Kecamatan
        { wch: 20 }, // Kabupaten/Kota
        { wch: 15 }, // Provinsi
        { wch: 15 }, // Bakat
        { wch: 25 }, // Nama Ayah
        { wch: 20 }, // Tempat Lahir Ayah
        { wch: 15 }, // Tanggal Lahir Ayah
        { wch: 25 }, // Nama Ibu
        { wch: 20 }, // Tempat Lahir Ibu
        { wch: 15 }, // Tanggal Lahir Ibu
        { wch: 30 }, // Alamat Orang Tua
        { wch: 15 }, // Telp Orang Tua
        { wch: 15 }, // Tanggal Masuk
        { wch: 15 }, // Tingkat Masuk
        { wch: 15 }, // Tanggal Keluar
        { wch: 25 }, // Alasan Keluar
      ];

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `DataAnggota_${currentDate}.xlsx`;

      writeFile(workbook, filename, { compression: true });

      toast.success(`Data anggota berhasil diunduh (${response.data.length} records)`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Gagal mengunduh data anggota. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    setButtonAction(
      <div className="flex items-center gap-2">
        <Button className="bg-primary-500 hover:bg-primary-600" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Anggota
        </Button>

        <Button className="bg-green-600 hover:bg-green-700" onClick={handleExport}>
          <FolderDown className="w-4 h-4 mr-2" />
          Excel
        </Button>
      </div>
    );
    return () => setButtonAction(undefined);
  }, [setButtonAction]);

  const columns: ColumnDef<MemberData>[] = [
    {
      header: 'Nama',
      accessor: 'name',
    },
    {
      header: 'Lembaga',
      accessor: 'institution_name',
    },
    {
      header: 'NTA',
      accessor: 'member_number',
    },
    {
      header: 'Jenis Kelamin',
      accessor: 'gender',
    },
    {
      header: 'Tempat / Tanggal Lahir',
      accessor: 'birth_date',
      cell: (item) => {
        const birthDate = moment(item.birth_date).format('DD/MM/YYYY');
        return `${item.birth_place}, ${birthDate}`;
      },
    },
    {
      header: 'Telp',
      accessor: 'phone',
    },
    {
      header: 'Aksi',
      accessor: 'id',
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(item)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDetail(item)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Detail</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(item)}>
              <Trash2 className="mr-2 size-4 text-red-600" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      {/* Member List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            Daftar Anggota
          </CardTitle>
          <CardAction className="flex gap-4">
            <div className="relative sm:max-w-xs w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari berdasarkan nama..." className="pl-8" value={params.search} onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))} />
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            isLoading={isPending}
            data={data?.data || []}
            keyField="_id"
            emptyMessage={{
              title: 'Data anggota tidak ditemukan',
              description: 'Belum ada data anggota',
              icon: Users,
            }}
          />

          <CustomPagination
            currentPage={params.page}
            totalPages={data?.pagination?.total_page || 0}
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
          setInitialValues({
            name: '',
            institution_id: '',
            member_number: '',
            parent_number: '',
            phone: '',
            gender: '',
            birth_place: '',
            birth_date: null,
            religion: '',
            nationality: '',
            rt: '',
            rw: '',
            village: '',
            sub_district: '',
            district: '',
            province: '',
            talent: '',
            father_name: '',
            father_birth_place: '',
            father_birth_date: null,
            mother_name: '',
            mother_birth_place: '',
            mother_birth_date: null,
            parent_address: '',
            parent_phone: '',
            entry_date: null,
            exit_date: null,
            entry_level: '',
            exit_reason: '',
          });
        }}
        onSubmit={handleSubmit}
        isLoading={isPending}
      />

      <DetailModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} data={selectedMember} />

      <DeleteConfirmation
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Hapus Anggota"
        description="Apakah Anda yakin ingin menghapus anggota ini? Aksi ini tidak dapat dibatalkan."
        itemName={dataDelete?.name || ''}
        isLoading={deleteData.isPending}
      />
    </div>
  );
}
