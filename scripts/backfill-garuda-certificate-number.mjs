/**
 * Mengisi certificate_number & certificate_year untuk data Garuda lama yang sudah
 * di-approve sebelum fitur nomor sertifikat ada.
 *
 * Jalankan:
 *   node --env-file=.env scripts/backfill-garuda-certificate-number.mjs           # dry-run
 *   node --env-file=.env scripts/backfill-garuda-certificate-number.mjs --apply   # eksekusi
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/garuda-scout';
const DB_NAME = 'garuda-scout';

// Sama dengan CERTIFICATE_CONFIG.number_suffix di src/components/garuda/CertificateDocument.tsx
const NUMBER_SUFFIX = 'SPG/1303-A';

const apply = process.argv.includes('--apply');

const certificateKey = (year) => `garuda_certificate_${year}`;
const formatNumber = (value) => String(value).padStart(4, '0');
const yearOf = (doc) => new Date(doc.approved_at || doc.updatedAt || doc.createdAt).getFullYear();

const run = async () => {
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  const garudas = mongoose.connection.collection('garudas');
  const counters = mongoose.connection.collection('counters');

  // Nomor terakhir yang sudah terpakai per tahun, supaya backfill melanjutkan, bukan menimpa
  const used = await garudas
    .aggregate([
      { $match: { certificate_number: { $ne: null, $exists: true }, certificate_year: { $ne: null, $exists: true } } },
      { $group: { _id: '$certificate_year', max: { $max: '$certificate_number' } } },
    ])
    .toArray();

  const lastByYear = new Map(used.map((item) => [item._id, item.max]));

  const targets = await garudas
    .find({ status: 1, is_delete: 0, $or: [{ certificate_number: null }, { certificate_number: { $exists: false } }] })
    .sort({ approved_at: 1, updatedAt: 1, createdAt: 1 })
    .toArray();

  const plan = targets.map((doc) => {
    const year = yearOf(doc);
    const next = (lastByYear.get(year) || 0) + 1;
    lastByYear.set(year, next);
    return { _id: doc._id, year, number: next };
  });

  plan.forEach((item) => {
    console.log(`${item._id} -> ${formatNumber(item.number)}/${NUMBER_SUFFIX}/${item.year}`);
  });
  console.log(`Total: ${plan.length} data`);

  if (!apply) {
    console.log('Dry-run. Tambahkan --apply untuk mengeksekusi.');
    await mongoose.disconnect();
    return;
  }

  if (plan.length > 0) {
    await garudas.bulkWrite(
      plan.map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { certificate_number: item.number, certificate_year: item.year } },
        },
      })),
    );
  }

  // Majukan counter tiap tahun supaya approve berikutnya tidak menabrak nomor lama
  for (const [year, last] of lastByYear) {
    const key = certificateKey(year);
    const counter = await counters.findOne({ key });
    if (!counter || (counter.seq || 0) < last) {
      const now = new Date();
      await counters.updateOne({ key }, { $set: { seq: last, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
      console.log(`counter ${key} -> ${last}`);
    }
  }

  console.log(`Selesai. ${plan.length} data diperbarui.`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
