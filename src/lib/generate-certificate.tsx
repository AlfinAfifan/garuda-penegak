'use client';

import type { CertificateData } from '@/components/garuda/CertificateDocument';

const FRAME_PATH = '/image/bingkai.png';
const LOGO_PATH = '/image/logo.png';

/** Batas data per sekali cetak massal, menjaga proses render di browser tetap wajar. */
export const MAX_BULK_CERTIFICATE = 50;

const sanitizeFileName = (value: string) => value.replace(/[\\/:*?"<>|]/g, '').trim() || 'Sertifikat';

/** Memicu unduhan blob PDF lewat anchor sementara. */
const saveBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/** Library PDF di-import dinamis supaya tidak ikut bundle awal halaman. */
const loadRenderer = () => Promise.all([import('@react-pdf/renderer'), import('@/components/garuda/CertificateDocument')]);

const assetSources = () => {
  const origin = window.location.origin;
  return { frameSrc: `${origin}${FRAME_PATH}`, logoSrc: `${origin}${LOGO_PATH}` };
};

/**
 * Merender sertifikat Garuda ke PDF lalu mengunduhnya.
 */
export const downloadGarudaCertificate = async (data: CertificateData) => {
  const [{ pdf }, { CertificateDocument }] = await loadRenderer();
  const { frameSrc, logoSrc } = assetSources();

  const blob = await pdf(<CertificateDocument data={data} frameSrc={frameSrc} logoSrc={logoSrc} />).toBlob();

  saveBlob(blob, `Sertifikat Garuda - ${sanitizeFileName(data.name)}.pdf`);
};

/**
 * Merender banyak sertifikat sekaligus jadi satu file PDF (satu halaman per data),
 * supaya bisa langsung dicetak beruntun.
 */
export const downloadGarudaCertificates = async (items: CertificateData[]) => {
  if (items.length === 0) {
    throw new Error('Tidak ada data yang dipilih');
  }
  if (items.length > MAX_BULK_CERTIFICATE) {
    throw new Error(`Maksimal ${MAX_BULK_CERTIFICATE} data per sekali cetak`);
  }

  const [{ pdf }, { CertificatesDocument }] = await loadRenderer();
  const { frameSrc, logoSrc } = assetSources();

  const blob = await pdf(<CertificatesDocument items={items} frameSrc={frameSrc} logoSrc={logoSrc} />).toBlob();

  saveBlob(blob, `Sertifikat Garuda - ${items.length} Data.pdf`);
};
