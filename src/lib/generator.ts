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

// Dream interpretation keyword -> number mapping
const dreamMap: Record<string, number[]> = {
  돼지: [1, 11, 21, 31, 41],
  돈: [2, 12, 22, 32, 42],
  물: [3, 13, 23, 33, 43],
  불: [4, 14, 24, 34, 44],
  나무: [5, 15, 25, 35, 45],
  산: [6, 16, 26, 36, 40],
  바다: [7, 17, 27, 37, 39],
  하늘: [8, 18, 28, 38],
  꽃: [9, 19, 29, 39],
  새: [10, 20, 30, 40],
  뱀: [3, 6, 13, 26, 33],
  호랑이: [7, 17, 27, 37, 44],
  용: [1, 8, 18, 28, 38],
  거북이: [5, 15, 25, 35, 42],
  말: [4, 14, 24, 34, 41],
  소: [2, 12, 22, 32, 43],
  개: [9, 19, 29, 39, 45],
  고양이: [10, 20, 30, 40, 44],
  물고기: [3, 7, 17, 27, 37],
  나비: [6, 16, 26, 36, 43],
  별: [8, 18, 28, 38, 45],
  달: [1, 11, 21, 31, 41],
  태양: [4, 14, 24, 34, 44],
  비: [3, 13, 23, 33, 43],
  눈: [5, 15, 25, 35, 42],
  바람: [7, 17, 27, 37, 39],
  집: [2, 12, 22, 32, 40],
  차: [9, 19, 29, 39, 44],
  사람: [1, 10, 20, 30, 45],
  아기: [6, 16, 26, 36, 41],
  결혼: [8, 18, 28, 38, 42],
  시험: [4, 14, 24, 34, 43],
  죽음: [5, 15, 25, 35, 40],
  음식: [2, 12, 22, 32, 44],
  과일: [3, 13, 23, 33, 45],
};

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
