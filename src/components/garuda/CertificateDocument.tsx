'use client';

import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

// Matikan hyphenation bawaan react-pdf supaya kata tidak terpotong (mis. "Pra-muka")
Font.registerHyphenationCallback((word) => [word]);

// Data kwartir yang tercetak di sertifikat, ubah di sini bila ada pergantian
export const CERTIFICATE_CONFIG = {
  city: 'Trenggalek',
  kwarcab: 'Kwartir Cabang Gerakan Pramuka\nTrenggalek',
  position: 'Ketua Harian,',
  signer_name: 'MAHSUN ISMA’IL, S.Ag, MM',
  signer_nta: 'NTA. 13.03.00.310566.0001',
  number_suffix: 'SPG/1303-A',
};

export type CertificateData = {
  name: string;
  nta: string;
  institution: string;
  date: string | Date | null;
  /** Nomor urut sertifikat, dicetak 4 karakter (mis. 0001) */
  number?: number | null;
  /** Tahun pada nomor sertifikat, default mengikuti tanggal approve */
  year?: number | null;
};

// Ukuran halaman A4 (pt) dan jarak bingkai ke tepi kertas
const PAGE = { width: 595.28, height: 841.89 };
const FRAME_INSET = 26;

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/** Format nomor urut jadi 4 karakter, mis. 1 -> "0001". */
export const formatCertificateNumber = (value?: number | null) => (value ? String(value).padStart(4, '0') : '');

export const formatIndonesianDate = (value: string | Date | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const styles = StyleSheet.create({
  page: { backgroundColor: '#FFFFFF', fontFamily: 'Helvetica', fontSize: 11, color: '#000000' },
  frame: {
    position: 'absolute',
    top: FRAME_INSET,
    left: FRAME_INSET,
    width: PAGE.width - FRAME_INSET * 2,
    height: PAGE.height - FRAME_INSET * 2,
  },
  content: { paddingTop: 112, paddingBottom: 40, paddingHorizontal: 104 },
  logo: { width: 92, height: 92, alignSelf: 'center' },
  title: { marginTop: 14, fontSize: 34, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  number: { marginTop: 4, textAlign: 'center' },
  identity: { marginTop: 22 },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 92 },
  colon: { width: 10 },
  value: { fontFamily: 'Helvetica-Bold' },
  as: { marginTop: 16, textAlign: 'center' },
  award: { marginTop: 10, fontSize: 16, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  description: { marginTop: 18, textAlign: 'justify', lineHeight: 1.4 },
  signature: { marginTop: 28, marginLeft: 190 },
  signatureLine: { marginBottom: 2 },
  signatureBlock: { marginTop: 14, lineHeight: 1.2 },
  signerName: { marginTop: 62, fontFamily: 'Helvetica-Bold', textDecoration: 'underline' },
  signerNta: { fontFamily: 'Helvetica-Bold' },
});

type PageProps = { data: CertificateData; frameSrc: string; logoSrc: string };

/** Satu halaman sertifikat. Dipakai ulang oleh cetak satuan maupun cetak massal. */
const CertificatePage = ({ data, frameSrc, logoSrc }: PageProps) => {
  const year = data.year ?? (data.date ? new Date(data.date).getFullYear() : new Date().getFullYear());
  const number = formatCertificateNumber(data.number);

  return (
    <Page size="A4" style={styles.page}>
      <Image src={frameSrc} style={styles.frame} fixed />

      <View style={styles.content}>
        <Image src={logoSrc} style={styles.logo} />

        <Text style={styles.title}>SERTIFIKAT</Text>
        <Text style={styles.number}>{`Nomor : ${number}/${CERTIFICATE_CONFIG.number_suffix}/${year}`}</Text>

        <View style={styles.identity}>
          <View style={styles.row}>
            <Text style={styles.label}>Diberikan Kepada</Text>
            <Text style={styles.colon}>:</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{data.name || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>NTA</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{data.nta || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pangkalan</Text>
            <Text style={styles.colon}>:</Text>
            <Text style={styles.value}>{data.institution || '-'}</Text>
          </View>
        </View>

        <Text style={styles.as}>Sebagai</Text>
        <Text style={styles.award}>PRAMUKA PENEGAK GARUDA</Text>

        <Text style={styles.description}>
          Yang telah menyelesaikan SPG tersebut di atas, dan berhak untuk mengenakan Tanda Kecakapan Pramuka Garuda. Dengan harapan senantiasa meningkatkan keterampilan dan pengetahuannya berdasarkan Tri Satya dan Dasa Darma Pramuka.
        </Text>

        <View style={styles.signature}>
          <Text style={styles.signatureLine}>{`Ditetapkan di  : ${CERTIFICATE_CONFIG.city}`}</Text>
          <Text style={styles.signatureLine}>{`Pada tanggal  : ${formatIndonesianDate(data.date)}`}</Text>

          <View style={styles.signatureBlock}>
            <Text>{CERTIFICATE_CONFIG.kwarcab}</Text>
            <Text>{CERTIFICATE_CONFIG.position}</Text>
          </View>

          <Text style={styles.signerName}>{CERTIFICATE_CONFIG.signer_name}</Text>
          <Text style={styles.signerNta}>{CERTIFICATE_CONFIG.signer_nta}</Text>
        </View>
      </View>
    </Page>
  );
};

export const CertificateDocument = ({ data, frameSrc, logoSrc }: PageProps) => (
  <Document title={`Sertifikat Pramuka Penegak Garuda - ${data.name}`} author={CERTIFICATE_CONFIG.kwarcab.replace('\n', ' ')}>
    <CertificatePage data={data} frameSrc={frameSrc} logoSrc={logoSrc} />
  </Document>
);

/** Cetak massal: satu dokumen berisi banyak halaman sertifikat, satu halaman per data. */
export const CertificatesDocument = ({ items, frameSrc, logoSrc }: { items: CertificateData[]; frameSrc: string; logoSrc: string }) => (
  <Document title={`Sertifikat Pramuka Penegak Garuda (${items.length} data)`} author={CERTIFICATE_CONFIG.kwarcab.replace('\n', ' ')}>
    {items.map((item, index) => (
      <CertificatePage key={`${item.nta || item.name}-${index}`} data={item} frameSrc={frameSrc} logoSrc={logoSrc} />
    ))}
  </Document>
);

export default CertificateDocument;
