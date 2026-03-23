// Kakao SDK utilities

declare global {
  interface Window {
    Kakao?: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share?: {
        sendDefault: (options: Record<string, unknown>) => void;
      };
    };
  }
}

const KAKAO_KEY = 'ea95354167038ebb0be11c1aae1ffe26';
const DOMAIN = 'https://lotto.dhlm-studio.com';

export function initKakao(): Promise<void> {
  return new Promise((resolve) => {
    const tryInit = (retries: number) => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_KEY);
        }
        resolve();
      } else if (retries > 0) {
        setTimeout(() => tryInit(retries - 1), 500);
      } else {
        resolve(); // Give up silently
      }
    };
    tryInit(10);
  });
}

export async function shareLotto(numbers: number[][]): Promise<boolean> {
  const text = numbers
    .map((set, i) => {
      const label = String.fromCharCode(65 + i);
      return `${label}: ${set.join(', ')}`;
    })
    .join('\n');

  const shareText = `DHLM 로또 번호 생성기\n\n${text}\n\n${DOMAIN}`;

  // Try Web Share API first
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'DHLM 로또 번호',
        text: shareText,
        url: DOMAIN,
      });
      return true;
    } catch {
      // User cancelled or not supported
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch {
    return false;
  }
}
