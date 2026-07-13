// IndexedDB 기반 TTS 오디오 캐시
// 같은 글자를 반복 재생할 때 Azure를 다시 호출하지 않도록 mp3 바이트를 저장.
const DB_NAME = "ahjin-tts-cache";
const STORE = "audio";
const VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB 미지원"));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(STORE)) {
        idb.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedAudio(key) {
  try {
    const idb = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function putCachedAudio(key, arrayBuffer) {
  try {
    const idb = await openDB();
    await new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(arrayBuffer, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* 캐시 실패는 무시 (재생은 계속) */
  }
}
