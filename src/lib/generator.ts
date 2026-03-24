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
  { keyword: '돼지', emoji: '🐷', numbers: [3, 13, 33, 43], meaning: '재물운, 행운의 상징' },
  { keyword: '돈', emoji: '💰', numbers: [8, 18, 28, 38], meaning: '금전운 상승' },
  { keyword: '물', emoji: '💧', numbers: [4, 14, 24, 44], meaning: '감정, 변화의 흐름' },
  { keyword: '불', emoji: '🔥', numbers: [7, 17, 27, 37], meaning: '열정, 성공의 기운' },
  { keyword: '용', emoji: '🐲', numbers: [5, 15, 25, 35], meaning: '큰 행운, 승진' },
  { keyword: '호랑이', emoji: '🐯', numbers: [6, 16, 26, 36], meaning: '권력, 용기' },
  { keyword: '뱀', emoji: '🐍', numbers: [2, 12, 22, 42], meaning: '지혜, 재물' },
  { keyword: '죽은 사람', emoji: '👻', numbers: [9, 19, 29, 39], meaning: '변화, 새로운 시작' },
  { keyword: '하늘', emoji: '☁️', numbers: [1, 11, 21, 31], meaning: '희망, 높은 이상' },
  { keyword: '비행기', emoji: '✈️', numbers: [1, 11, 31, 41], meaning: '여행, 상승' },
  { keyword: '바다', emoji: '🌊', numbers: [10, 20, 30, 40], meaning: '넓은 기회' },
  { keyword: '물고기', emoji: '🐟', numbers: [10, 20, 30, 40], meaning: '풍요, 재물' },
  { keyword: '나무', emoji: '🌳', numbers: [23, 32, 41, 45], meaning: '성장, 안정' },
  { keyword: '꽃', emoji: '🌸', numbers: [23, 32, 41, 45], meaning: '행복, 사랑' },
  { keyword: '시험', emoji: '📝', numbers: [7, 17, 27, 37], meaning: '합격, 성취' },
  { keyword: '합격', emoji: '🎓', numbers: [7, 17, 27, 37], meaning: '목표 달성' },
  { keyword: '결혼', emoji: '💒', numbers: [2, 12, 22, 32], meaning: '새로운 시작, 결합' },
  { keyword: '연애', emoji: '❤️', numbers: [2, 12, 22, 32], meaning: '사랑, 인연' },
  { keyword: '아기', emoji: '👶', numbers: [1, 11, 21, 41], meaning: '새 생명, 탄생' },
  { keyword: '임신', emoji: '🤰', numbers: [1, 11, 21, 41], meaning: '창조, 풍요' },
  { keyword: '자동차', emoji: '🚗', numbers: [4, 14, 34, 44], meaning: '진전, 이동' },
  { keyword: '사고', emoji: '💥', numbers: [4, 14, 34, 44], meaning: '주의, 변화' },
  { keyword: '집', emoji: '🏠', numbers: [8, 18, 28, 38], meaning: '안정, 재산' },
  { keyword: '이사', emoji: '📦', numbers: [3, 13, 33, 43], meaning: '변화, 새 환경' },
  { keyword: '개', emoji: '🐕', numbers: [6, 16, 26, 36], meaning: '충성, 우정' },
  { keyword: '고양이', emoji: '🐈', numbers: [5, 15, 25, 35], meaning: '직감, 독립' },
  { keyword: '소', emoji: '🐄', numbers: [3, 13, 33, 43], meaning: '근면, 재물' },
  { keyword: '말', emoji: '🐎', numbers: [5, 15, 25, 35], meaning: '속도, 성공' },
  { keyword: '새', emoji: '🐦', numbers: [1, 11, 21, 31], meaning: '자유, 소식' },
  { keyword: '산', emoji: '⛰️', numbers: [9, 19, 29, 39], meaning: '도전, 극복' },
  { keyword: '비', emoji: '🌧️', numbers: [4, 14, 24, 44], meaning: '정화, 풍요' },
  { keyword: '눈', emoji: '❄️', numbers: [10, 20, 30, 40], meaning: '순수, 새로움' },
  { keyword: '태양', emoji: '☀️', numbers: [1, 11, 21, 31], meaning: '성공, 밝은 미래' },
  { keyword: '달', emoji: '🌙', numbers: [9, 19, 29, 39], meaning: '여성, 직감' },
  { keyword: '별', emoji: '⭐', numbers: [7, 17, 27, 37], meaning: '희망, 행운' },
  { keyword: '전쟁', emoji: '⚔️', numbers: [6, 16, 36, 45], meaning: '갈등, 승리' },
  { keyword: '도둑', emoji: '🦹', numbers: [8, 18, 28, 38], meaning: '의외의 재물' },
  { keyword: '왕', emoji: '👑', numbers: [5, 15, 25, 45], meaning: '권력, 성공' },
  { keyword: '피', emoji: '🩸', numbers: [9, 19, 29, 39], meaning: '열정, 생명력' },
  { keyword: '금', emoji: '🥇', numbers: [8, 18, 28, 38], meaning: '재물, 가치' },
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
