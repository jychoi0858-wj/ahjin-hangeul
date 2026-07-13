// 앱 시작 시 익명 로그인.
// 로그인 UI 없이 request.auth != null 조건을 만족시켜,
// Firestore 보안 규칙으로 보호된 Azure 키(config/azure)를 읽을 수 있게 한다.
import { auth, isFirebaseConfigured } from "./config";

let authReady = null;

export function ensureAuth() {
  if (authReady) return authReady;

  if (!isFirebaseConfigured || !auth) {
    // Firebase 미설정: 로그인 없이 진행 (TTS는 브라우저 폴백)
    authReady = Promise.resolve(null);
    return authReady;
  }

  authReady = (async () => {
    try {
      const { signInAnonymously, onAuthStateChanged } = await import(
        "firebase/auth"
      );
      // 이미 로그인돼 있으면 그대로 사용
      const existing = await new Promise((resolve) => {
        const unsub = onAuthStateChanged(auth, (user) => {
          unsub();
          resolve(user);
        });
      });
      if (existing) return existing;

      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (e) {
      // 익명 로그인이 콘솔에서 꺼져 있으면 여기로 옴
      console.warn(
        "[auth] 익명 로그인 실패 - Firebase 콘솔에서 'Anonymous' 로그인을 켜주세요:",
        e && e.code
      );
      return null;
    }
  })();

  return authReady;
}
