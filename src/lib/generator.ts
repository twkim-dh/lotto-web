// Lotto number generator utilities - all client-side

function getRandomNumbers(count: number, exclude: number[] = []): number[] {
  const available = Array.from({ length: 45 }, (_, i) => i + 1).filter(
    (n) => !exclude.includes(n)
  );
  const result: number[] = [];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available[idx]);
    available.splice(idx, 1);
  }
  return result.sort((a, b) => a - b);
}

export function generateRandom(setCount: number): number[][] {
  const sets: number[][] = [];
  for (let i = 0; i < setCount; i++) {
    sets.push(getRandomNumbers(6));
  }
  return sets;
}

export function generateWithFixed(
  fixed: number[],
  setCount: number
): number[][] {
  const sets: number[][] = [];
  for (let i = 0; i < setCount; i++) {
    const remaining = getRandomNumbers(6 - fixed.length, fixed);
    const combined = [...fixed, ...remaining].sort((a, b) => a - b);
    sets.push(combined);
  }
  return sets;
}

export function generateExcluding(
  excluded: number[],
  setCount: number
): number[][] {
  const sets: number[][] = [];
  for (let i = 0; i < setCount; i++) {
    sets.push(getRandomNumbers(6, excluded));
  }
  return sets;
}

export function generateOddEven(
  oddCount: number,
  setCount: number
): number[][] {
  const evenCount = 6 - oddCount;
  const odds = Array.from({ length: 45 }, (_, i) => i + 1).filter(
    (n) => n % 2 === 1
  );
  const evens = Array.from({ length: 45 }, (_, i) => i + 1).filter(
    (n) => n % 2 === 0
  );

  const sets: number[][] = [];
  for (let s = 0; s < setCount; s++) {
    const pickedOdds: number[] = [];
    const oddPool = [...odds];
    for (let i = 0; i < oddCount && oddPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * oddPool.length);
      pickedOdds.push(oddPool[idx]);
      oddPool.splice(idx, 1);
    }

    const pickedEvens: number[] = [];
    const evenPool = [...evens];
    for (let i = 0; i < evenCount && evenPool.length > 0; i++) {
      const idx = Math.floor(Math.random() * evenPool.length);
      pickedEvens.push(evenPool[idx]);
      evenPool.splice(idx, 1);
    }

    sets.push([...pickedOdds, ...pickedEvens].sort((a, b) => a - b));
  }
  return sets;
}

// Dream interpretation data with emoji, numbers, and meaning
export interface DreamEntry {
  keyword: string;
  emoji: string;
  numbers: number[];
  meaning: string;
}

export const dreamData: DreamEntry[] = [
  { keyword: '돼지', emoji: '🐷', numbers: [3, 13, 33, 43], meaning: '재물운' },
  { keyword: '돈', emoji: '💰', numbers: [8, 18, 28, 38], meaning: '금전운' },
  { keyword: '물', emoji: '💧', numbers: [4, 14, 24, 44], meaning: '변화' },
  { keyword: '불', emoji: '🔥', numbers: [7, 17, 27, 37], meaning: '열정' },
  { keyword: '용', emoji: '🐲', numbers: [5, 15, 25, 35], meaning: '큰행운' },
  { keyword: '호랑이', emoji: '🐯', numbers: [6, 16, 26, 36], meaning: '권력' },
  { keyword: '뱀', emoji: '🐍', numbers: [2, 12, 22, 42], meaning: '지혜' },
  { keyword: '죽은사람', emoji: '👻', numbers: [9, 19, 29, 39], meaning: '변화' },
  { keyword: '하늘', emoji: '☁️', numbers: [1, 11, 21, 31], meaning: '희망' },
  { keyword: '비행기', emoji: '✈️', numbers: [1, 11, 31, 41], meaning: '상승' },
  { keyword: '바다', emoji: '🌊', numbers: [10, 20, 30, 40], meaning: '기회' },
  { keyword: '물고기', emoji: '🐟', numbers: [10, 20, 30, 40], meaning: '풍요' },
  { keyword: '나무', emoji: '🌳', numbers: [23, 32, 41, 45], meaning: '성장' },
  { keyword: '꽃', emoji: '🌸', numbers: [23, 32, 41, 45], meaning: '행복' },
  { keyword: '시험', emoji: '📝', numbers: [7, 17, 27, 37], meaning: '합격' },
  { keyword: '결혼', emoji: '💒', numbers: [2, 12, 22, 32], meaning: '새시작' },
  { keyword: '연애', emoji: '❤️', numbers: [2, 12, 22, 32], meaning: '사랑' },
  { keyword: '아기', emoji: '👶', numbers: [1, 11, 21, 41], meaning: '탄생' },
  { keyword: '자동차', emoji: '🚗', numbers: [4, 14, 34, 44], meaning: '진전' },
  { keyword: '집', emoji: '🏠', numbers: [8, 18, 28, 38], meaning: '안정' },
  { keyword: '이사', emoji: '📦', numbers: [3, 13, 33, 43], meaning: '변화' },
  { keyword: '개', emoji: '🐕', numbers: [6, 16, 26, 36], meaning: '충성' },
  { keyword: '고양이', emoji: '🐈', numbers: [5, 15, 25, 35], meaning: '직감' },
  { keyword: '소', emoji: '🐄', numbers: [3, 13, 33, 43], meaning: '근면' },
  { keyword: '말', emoji: '🐎', numbers: [5, 15, 25, 35], meaning: '속도' },
  { keyword: '새', emoji: '🐦', numbers: [1, 11, 21, 31], meaning: '자유' },
  { keyword: '산', emoji: '⛰️', numbers: [9, 19, 29, 39], meaning: '도전' },
  { keyword: '비', emoji: '🌧️', numbers: [4, 14, 24, 44], meaning: '정화' },
  { keyword: '눈', emoji: '❄️', numbers: [10, 20, 30, 40], meaning: '순수' },
  { keyword: '태양', emoji: '☀️', numbers: [1, 11, 21, 31], meaning: '성공' },
  { keyword: '달', emoji: '🌙', numbers: [9, 19, 29, 39], meaning: '직감' },
  { keyword: '별', emoji: '⭐', numbers: [7, 17, 27, 37], meaning: '행운' },
  { keyword: '도둑', emoji: '🦹', numbers: [8, 18, 28, 38], meaning: '의외재물' },
  { keyword: '왕', emoji: '👑', numbers: [5, 15, 25, 45], meaning: '권력' },
  { keyword: '금', emoji: '🥇', numbers: [8, 18, 28, 38], meaning: '가치' },
  { keyword: '피', emoji: '🩸', numbers: [9, 19, 29, 39], meaning: '생명력' },
];

// Build dreamMap from dreamData for backward compatibility
const dreamMap: Record<string, number[]> = {};
for (const entry of dreamData) {
  dreamMap[entry.keyword] = entry.numbers;
}

export function generateDream(keyword: string, setCount: number): number[][] {
  const trimmed = keyword.trim();
  let seedNumbers: number[] = [];

  // Find matching keywords
  for (const [key, nums] of Object.entries(dreamMap)) {
    if (trimmed.includes(key)) {
      seedNumbers = [...seedNumbers, ...nums];
    }
  }

  // If no match, use keyword character codes to seed
  if (seedNumbers.length === 0) {
    for (let i = 0; i < trimmed.length; i++) {
      const code = trimmed.charCodeAt(i);
      seedNumbers.push((code % 45) + 1);
    }
  }

  // Remove duplicates
  seedNumbers = [...new Set(seedNumbers)];

  const sets: number[][] = [];
  for (let s = 0; s < setCount; s++) {
    const picked: number[] = [];
    const pool = [...seedNumbers];

    // Pick from seed numbers first (up to 3-4)
    const fromSeed = Math.min(
      Math.floor(Math.random() * 2) + 3,
      pool.length,
      6
    );
    for (let i = 0; i < fromSeed; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }

    // Fill remaining randomly
    if (picked.length < 6) {
      const remaining = getRandomNumbers(6 - picked.length, picked);
      picked.push(...remaining);
    }

    sets.push(picked.sort((a, b) => a - b));
  }
  return sets;
}

export interface DreamResult {
  numbers: number[];
  dreamNumbers: number[]; // which numbers came from dream data
}

export function generateDreamWithSource(
  keyword: string,
  setCount: number
): DreamResult[] {
  const trimmed = keyword.trim();
  let seedNumbers: number[] = [];

  for (const [key, nums] of Object.entries(dreamMap)) {
    if (trimmed.includes(key)) {
      seedNumbers = [...seedNumbers, ...nums];
    }
  }

  if (seedNumbers.length === 0) {
    for (let i = 0; i < trimmed.length; i++) {
      const code = trimmed.charCodeAt(i);
      seedNumbers.push((code % 45) + 1);
    }
  }

  seedNumbers = [...new Set(seedNumbers)];

  const results: DreamResult[] = [];
  for (let s = 0; s < setCount; s++) {
    const picked: number[] = [];
    const dreamPicked: number[] = [];
    const pool = [...seedNumbers];

    const fromSeed = Math.min(
      Math.floor(Math.random() * 2) + 2,
      pool.length,
      3
    );
    for (let i = 0; i < fromSeed; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool[idx]);
      dreamPicked.push(pool[idx]);
      pool.splice(idx, 1);
    }

    if (picked.length < 6) {
      const remaining = getRandomNumbers(6 - picked.length, picked);
      picked.push(...remaining);
    }

    const sorted = picked.sort((a, b) => a - b);
    results.push({
      numbers: sorted,
      dreamNumbers: dreamPicked,
    });
  }
  return results;
}
