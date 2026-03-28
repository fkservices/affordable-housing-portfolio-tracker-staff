// ---------------------------------------------------------------------------
// Firestore CRUD service
// ---------------------------------------------------------------------------
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Property,
  Developer,
  Alert,
  ComplianceEvent,
  HudFmr,
  StaffNote,
} from './types';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Map a Firestore doc snapshot to a typed object with its id. */
function mapDoc<T>(docSnap: DocumentData): T {
  return { id: docSnap.id, ...docSnap.data() } as T;
}

/** Severity order for alert sorting (red first). */
const severityOrder: Record<string, number> = { red: 0, amber: 1 };

// ── Properties ───────────────────────────────────────────────────────────────

export async function getProperties(): Promise<Property[]> {
  const snap = await getDocs(collection(db, 'properties'));
  return snap.docs.map((d) => mapDoc<Property>(d));
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const snap = await getDoc(doc(db, 'properties', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Property;
}

export async function updateProperty(
  id: string,
  data: Partial<Omit<Property, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, 'properties', id), data as DocumentData);
}

// ── Developers ───────────────────────────────────────────────────────────────

export async function getDevelopers(): Promise<Developer[]> {
  const snap = await getDocs(collection(db, 'developers'));
  return snap.docs.map((d) => mapDoc<Developer>(d));
}

export async function getDeveloperById(
  id: string,
): Promise<Developer | null> {
  const snap = await getDoc(doc(db, 'developers', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Developer;
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export async function getAlerts(): Promise<Alert[]> {
  const snap = await getDocs(collection(db, 'alerts'));
  const alerts = snap.docs.map((d) => mapDoc<Alert>(d));

  // Sort: red before amber, then by createdDate descending.
  alerts.sort((a, b) => {
    const sevDiff =
      (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
    if (sevDiff !== 0) return sevDiff;
    return (
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  });

  return alerts;
}

export async function acknowledgeAlert(id: string): Promise<void> {
  await updateDoc(doc(db, 'alerts', id), {
    acknowledged: true,
    acknowledgedDate: new Date().toISOString(),
  });
}

// ── Compliance Events ────────────────────────────────────────────────────────

export async function getComplianceEvents(
  propertyId: string,
): Promise<ComplianceEvent[]> {
  const q = query(
    collection(db, 'complianceEvents'),
    where('propertyId', '==', propertyId),
    orderBy('date', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc<ComplianceEvent>(d));
}

// ── HUD FMR ──────────────────────────────────────────────────────────────────

export async function getHudFmr(year: number): Promise<HudFmr | null> {
  const q = query(
    collection(db, 'hudFmr'),
    where('year', '==', year),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return mapDoc<HudFmr>(snap.docs[0]);
}

// ── Staff Notes ──────────────────────────────────────────────────────────────

export async function addStaffNote(
  propertyId: string,
  note: Omit<StaffNote, 'id' | 'propertyId' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(
    collection(db, 'properties', propertyId, 'notes'),
    {
      ...note,
      propertyId,
      createdAt: serverTimestamp(),
    },
  );
  return ref.id;
}
