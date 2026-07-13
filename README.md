# 아진 한글놀이 🎵

4세 맞춤형 언어 놀이 웹앱 (한글 / 알파벳). "각 잡고 하는 공부"가 아니라 터치하면
소리와 그림이 튀어나오는 **상호작용 장난감** 경험을 목표로 합니다.

## 지금까지 구현된 것

- 프로젝트 뼈대 (CRA / react-scripts 5, JavaScript, 순수 CSS)
- 홈 화면 (놀이 4종 진입, 큰 터치 영역)
- **놀이 1: 톡톡 사운드 보드** ✅
  - 알파벳(ABC) / 한글 자음(가나다) 전환
  - 카드 터치 → 톡 튀는 애니메이션 + Azure TTS 발음 + 연관 그림 팝업
  - 반복 재생 시 IndexedDB 캐시로 재호출 방지
- 놀이 2·3·4 는 "곧 나와요" 자리표시자 (다음 단계)

> Azure 키가 아직 없어도 앱은 실행됩니다. 이 경우 브라우저 내장 음성으로
> 임시 재생되며, 키를 넣으면 자동으로 Azure(SunHi)로 전환됩니다.

## 실행 방법

```bash
npm install
npm start          # http://localhost:3000
npm run build      # 배포용 정적 파일 (build/)
```

## 설정 (Firebase & Azure)

### 1) Firebase
Firebase 콘솔에서 프로젝트를 만들고 **Firestore**와 **Authentication**을 켠 뒤,
프로젝트 설정의 SDK 구성 값을 `.env.local`에 넣습니다. (`.env.example` 참고)

### 2) Azure Speech 키 — Firestore에 저장 (권장)
Firestore에 아래 문서를 만듭니다.

```
컬렉션: config
  문서: azure
    subscriptionKey: "<Azure Speech 키>"
    region:          "koreacentral"   // 리소스의 지역
```

앱은 로그인 후 이 문서를 읽어 Azure를 호출합니다. Firestore 보안 규칙으로
**로그인한 사용자만 읽기 가능**하도록 제한하세요:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /config/azure {
      allow read: if request.auth != null;
      allow write: if false;   // 콘솔에서만 수정
    }
  }
}
```

> ⚠️ 서버리스(클라이언트 직접 호출) 구조라 로그인한 사용자에게는 키가 노출될 수
> 있습니다. 공개 서비스로 확장할 때는 토큰 발급용 Cloud Function 도입을 검토하세요.

### 3) (대안) 로컬 테스트용 환경변수
Firestore 설정 전 빠르게 확인하려면 `.env.local`의
`REACT_APP_AZURE_SPEECH_KEY` / `REACT_APP_AZURE_SPEECH_REGION`만 채워도 됩니다.

## 폴더 구조

```
src/
  firebase/config.js        Firebase 초기화
  services/
    secrets.js              Azure 키 로드 (Firestore → env 폴백)
    azureTts.js             Azure TTS (SSML/SunHi) + 브라우저 폴백
    audioCache.js           IndexedDB 오디오 캐시
  data/letters.js           알파벳/한글 카드 데이터
  components/
    Home.js                 홈 화면
    ComingSoon.js           미구현 놀이 자리표시자
    SoundBoard/             놀이 1
```

## 다음 단계 (남은 작업)

- 놀이 2: 손가락 스케치북 (Canvas 드로잉 + 픽셀 색칠률 판정)
- 놀이 3: 소리 마법 (Azure STT / 발음 평가)
- 놀이 4: 숨은 글자 빙고
- 오프라인(PWA Service Worker) + 오디오 자동재생 unlock (후순위)
- 부모 게이트, 실제 일러스트(이모지 대체) 교체
