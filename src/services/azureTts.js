// Azure Speech TTS 래퍼
// - SSML로 SunHi(한국어) / Jenny(영어) 음성 재생
// - IndexedDB로 mp3 캐싱 (반복 재생 시 재호출 방지)
// - Azure 미설정 시 브라우저 내장 음성으로 폴백 (개발 편의용)
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { getAzureCredentials, isAzureConfigured } from "./secrets";
import { getCachedAudio, putCachedAudio } from "./audioCache";

const VOICE = {
  ko: "ko-KR-SunHiNeural",
  en: "en-US-JennyNeural",
};

let currentAudio = null;

function buildSsml(text, lang) {
  const voice = VOICE[lang] || VOICE.ko;
  const locale = voice.slice(0, 5);
  // 아이용: 살짝 느리고 밝게
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">
  <voice name="${voice}">
    <prosody rate="-8%" pitch="+8%">${text}</prosody>
  </voice>
</speak>`;
}

function playArrayBuffer(arrayBuffer) {
  return new Promise((resolve) => {
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    if (currentAudio) {
      currentAudio.pause();
    }
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.play().catch(() => resolve());
  });
}

async function synthesizeToArrayBuffer(text, lang) {
  const creds = await getAzureCredentials();
  if (!creds) return null;

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    creds.key,
    creds.region
  );
  speechConfig.speechSynthesisOutputFormat =
    SpeechSDK.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

  // pull stream을 출력으로 지정해 스피커 자동 재생을 막고 바이트만 확보
  const pullStream = SpeechSDK.AudioOutputStream.createPullStream();
  const audioConfig = SpeechSDK.AudioConfig.fromStreamOutput(pullStream);
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  const ssml = buildSsml(text, lang);

  return new Promise((resolve) => {
    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        synthesizer.close();
        if (
          result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted
        ) {
          resolve(result.audioData);
        } else {
          console.warn("[azureTts] 합성 실패:", result.errorDetails);
          resolve(null);
        }
      },
      (err) => {
        console.warn("[azureTts] 오류:", err);
        synthesizer.close();
        resolve(null);
      }
    );
  });
}

// 브라우저 내장 음성 폴백 (Azure 미설정 시 개발용)
function speakWithBrowser(text, lang) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "en" ? "en-US" : "ko-KR";
    u.rate = 0.9;
    u.pitch = 1.15;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

/**
 * 텍스트를 소리 내어 읽어준다.
 * @param {string} text  읽을 내용
 * @param {object} opts  { lang: "ko" | "en", cacheKey?: string }
 */
export async function speak(text, opts = {}) {
  const lang = opts.lang || "ko";
  const cacheKey = opts.cacheKey || `${lang}:${text}`;

  if (!isAzureConfigured()) {
    return speakWithBrowser(text, lang);
  }

  // 1) 캐시 확인
  const cached = await getCachedAudio(cacheKey);
  if (cached) {
    return playArrayBuffer(cached);
  }

  // 2) Azure 합성
  const audioData = await synthesizeToArrayBuffer(text, lang);
  if (audioData) {
    putCachedAudio(cacheKey, audioData); // 비동기 저장 (대기 안 함)
    return playArrayBuffer(audioData);
  }

  // 3) 실패 시 브라우저 폴백
  return speakWithBrowser(text, lang);
}

export function stopSpeaking() {
  if (currentAudio) currentAudio.pause();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
