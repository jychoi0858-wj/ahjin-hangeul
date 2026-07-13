// Load Azure Speech credentials.
// Priority: 1) Firestore (config/azure)  2) env vars (REACT_APP_AZURE_*)
// Firestore doc: collection "config", doc "azure",
//   { subscriptionKey: "...", region: "koreacentral" }
import { db, isFirebaseConfigured } from "../firebase/config";
import { ensureAuth } from "../firebase/authBootstrap";

let cached = null;

export async function getAzureCredentials() {
  if (cached) return cached;

  // 1) Firestore (read after anonymous auth)
  if (isFirebaseConfigured && db) {
    try {
      await ensureAuth();
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "config", "azure"));
      if (snap.exists()) {
        const data = snap.data();
        if (data.subscriptionKey && data.region) {
          cached = { key: data.subscriptionKey, region: data.region };
          return cached;
        }
      }
    } catch (e) {
      console.warn("[secrets] Firestore read failed, falling back to env:", e);
    }
  }

  // 2) env var fallback (local dev)
  const envKey = process.env.REACT_APP_AZURE_SPEECH_KEY;
  const envRegion = process.env.REACT_APP_AZURE_SPEECH_REGION;
  if (envKey && envRegion) {
    cached = { key: envKey, region: envRegion };
    return cached;
  }

  return null;
}

export function isAzureConfigured() {
  return Boolean(
    (isFirebaseConfigured && db) ||
      (process.env.REACT_APP_AZURE_SPEECH_KEY &&
        process.env.REACT_APP_AZURE_SPEECH_REGION)
  );
}
