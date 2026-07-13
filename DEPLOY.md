# 배포 & 연동 가이드 (패드에서 확인하기)

순서: **① Firebase 프로젝트 만들기 → ② 앱에 설정값 넣기 → ③ GitHub Pages로 배포 → ④ 패드에서 열기**

> Firebase 없이 지금 당장 레이아웃만 보고 싶다면 ③번만 해도 됩니다.
> 이 경우 소리는 브라우저 내장 음성으로 임시 재생됩니다. Azure(SunHi)로
> 바꾸려면 ①②가 필요합니다.

---

## ① Firebase 프로젝트 만들기

1. https://console.firebase.google.com 접속 → **프로젝트 추가** → 이름(예: `ahjin-hangeul`) → 생성.
2. 왼쪽 **빌드 > Firestore Database** → **데이터베이스 만들기** → *프로덕션 모드* 선택 → 지역 `asia-northeast3(서울)`.
3. 왼쪽 **빌드 > Authentication** → **시작하기** → **Sign-in method** 탭 → **익명(Anonymous)** 켜기. ✅ (로그인 UI 없이 키를 안전하게 읽기 위함)
4. 상단 톱니 **프로젝트 설정 > 일반** → 아래 "내 앱"에서 **웹 앱(</>)** 추가 → 앱 등록 → 표시되는 `firebaseConfig` 값을 복사.

### Firestore에 Azure 키 저장
5. Firestore에서 **컬렉션 시작** → 컬렉션 ID `config` → 문서 ID `azure` → 필드 두 개 추가:
   - `subscriptionKey` (문자열) : Azure Speech 키
   - `region` (문자열) : 예 `koreacentral`
6. **규칙(Rules)** 탭 → 아래로 교체 → 게시:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/azure {
      allow read: if request.auth != null;   // 로그인(익명 포함)한 사용자만 읽기
      allow write: if false;                  // 수정은 콘솔에서만
    }
  }
}
```

> Azure 키를 아직 안 만들었으면: https://portal.azure.com → "Speech" 리소스 생성
> (요금제 F0 무료) → 키와 지역 확인.

---

## ② 앱에 Firebase 설정값 넣기

프로젝트 폴더에서 `.env.example`을 복사해 **`.env.local`** 파일을 만들고, ①-4에서
복사한 값을 채웁니다:

```
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=ahjin-hangeul.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ahjin-hangeul
REACT_APP_FIREBASE_STORAGE_BUCKET=ahjin-hangeul.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1234567890
REACT_APP_FIREBASE_APP_ID=1:12345:web:abcd
```

> Firebase 웹 apiKey는 비밀값이 아니라 번들에 포함돼도 괜찮습니다(보안은 규칙+로그인으로).
> **진짜 비밀인 Azure 키는 `.env.local`에 넣지 마세요.** Firestore에만 둡니다.

---

## ③ GitHub Pages로 배포

### 준비물
- GitHub 계정, 로컬에 git 설치, Node.js 설치.

### 명령 (프로젝트 폴더에서)

```bash
# 1) 의존성 설치
npm install

# 2) GitHub에 빈 저장소 만들고 연결 (한 번만)
git init
git add .
git commit -m "첫 커밋: 사운드 보드"
git branch -M main
git remote add origin https://github.com/<내아이디>/ahjin-hangeul.git
git push -u origin main

# 3) 배포 (build 후 gh-pages 브랜치로 push)
npm run deploy
```

### GitHub에서 Pages 켜기 (한 번만)
저장소 → **Settings > Pages** → *Build and deployment* → Source: **Deploy from a branch**
→ Branch: **gh-pages** / **/(root)** → Save.

1~2분 뒤 주소가 생깁니다:
`https://<내아이디>.github.io/ahjin-hangeul/`

> 이 앱은 **HashRouter**를 써서 하위경로(`/ahjin-hangeul/`)에서도 새로고침이
> 깨지지 않습니다. 자산 경로도 상대경로(`homepage: "."`)라 저장소 이름과 무관하게 동작합니다.

이후 코드를 고칠 때마다:
```bash
git add . && git commit -m "수정" && git push
npm run deploy
```

---

## ④ 패드에서 열기

1. 패드 브라우저(Safari/Chrome)에서 위 주소 접속.
2. **HTTPS라 마이크·설치(홈 화면 추가)가 정상 동작**합니다.
3. 홈 화면에 추가: 공유 버튼 → "홈 화면에 추가" → 전체화면 앱처럼 실행.
4. 소리가 안 나면: 화면을 한 번 터치한 뒤 카드를 누르세요(브라우저 오디오 정책).

---

## 자주 겪는 문제

| 증상 | 원인 / 해결 |
|---|---|
| 소리가 브라우저 기본 음성으로 나옴 | Azure 키 미설정 또는 익명 로그인 꺼짐 → ①-3, ①-5 확인 |
| 콘솔에 `익명 로그인 실패` | Firebase Auth에서 Anonymous 안 켬 → ①-3 |
| 페이지가 404 | Pages Source가 `gh-pages` 브랜치인지 확인, 1~2분 대기 |
| 카드가 화면을 넘침 | 패드 가로 모드로 회전 (앱은 가로 기준 설계) |
