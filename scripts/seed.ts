#!/usr/bin/env npx tsx
// ---------------------------------------------------------------------------
// Firestore Seed Script
// Loads JSON seed data from src/data/ into Firebase Firestore.
//
// Usage:
//   npx tsx scripts/seed.ts
//
// Requires NEXT_PUBLIC_FIREBASE_* env vars to be set in .env
// ---------------------------------------------------------------------------

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '..', '.env') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error('Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set in .env');
  process.exit(1);
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

function loadJson(filename: string) {
  const path = resolve(__dirname, '..', 'src', 'data', filename);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

async function seedCollection(name: string, data: Record<string, unknown>[], idField = 'id') {
  console.log(`Seeding ${name}: ${data.length} documents...`);
  const batchSize = 400; // Firestore batch limit is 500
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = writeBatch(db);
    const chunk = data.slice(i, i + batchSize);
    for (const item of chunk) {
      const id = (item[idField] as string) || doc(collection(db, name)).id;
      const ref = doc(db, name, id);
      batch.set(ref, item);
    }
    await batch.commit();
  }
  console.log(`  ✓ ${name} seeded.`);
}

async function seedHudFmr(data: Record<string, unknown>) {
  console.log('Seeding hudFmr...');
  const year = String(data.year);
  await setDoc(doc(db, 'hudFmr', year), data);
  console.log('  ✓ hudFmr seeded.');
}

async function main() {
  console.log(`Seeding Firestore for project: ${firebaseConfig.projectId}\n`);

  const properties = loadJson('properties.json');
  const developers = loadJson('developers.json');
  const complianceEvents = loadJson('compliance_events.json');
  const alerts = loadJson('alerts.json');
  const hudFmr = loadJson('hud_fmr.json');

  await seedCollection('properties', properties);
  await seedCollection('developers', developers);
  await seedCollection('complianceEvents', complianceEvents);
  await seedCollection('alerts', alerts);
  await seedHudFmr(hudFmr);

  console.log('\n✅ All seed data loaded successfully!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
