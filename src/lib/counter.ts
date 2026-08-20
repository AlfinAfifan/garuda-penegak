import Counter from '@/lib/modals/counter';

/** Nomor urut sertifikat direset tiap tahun, mengikuti tahun pada nomor sertifikat. */
export const garudaCertificateKey = (year: number) => `garuda_certificate_${year}`;

/**
 * Mengambil nomor urut berikutnya secara atomik.
 * $inc dengan upsert dijalankan MongoDB dalam satu operasi, jadi dua approve bersamaan
 * tidak akan mendapat nomor yang sama.
 */
export const getNextSequence = async (key: string): Promise<number> => {
  const counter = await Counter.findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return counter.seq;
};
