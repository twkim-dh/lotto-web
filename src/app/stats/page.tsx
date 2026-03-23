'use client';

import { useState, useMemo } from 'react';
import LottoBall from '@/components/LottoBall';

// Hardcoded last 20 draws for MVP (approximate recent data)
const recentDraws = [
  { round: 1160, numbers: [3, 13, 20, 28, 35, 44], bonus: 41 },
  { round: 1159, numbers: [1, 6, 12, 18, 32, 39], bonus: 44 },
  { round: 1158, numbers: [5, 11, 17, 25, 36, 42], bonus: 30 },
  { round: 1157, numbers: [2, 14, 23, 31, 37, 43], bonus: 8 },
  { round: 1156, numbers: [7, 10, 19, 26, 33, 40], bonus: 15 },
  { round: 1155, numbers: [4, 9, 16, 22, 34, 45], bonus: 27 },
  { round: 1154, numbers: [1, 8, 15, 24, 38, 41], bonus: 11 },
  { round: 1153, numbers: [6, 13, 21, 29, 36, 43], bonus: 3 },
  { round: 1152, numbers: [2, 10, 18, 27, 35, 44], bonus: 20 },
  { round: 1151, numbers: [3, 7, 14, 23, 32, 40], bonus: 45 },
  { round: 1150, numbers: [5, 12, 19, 28, 37, 42], bonus: 9 },
  { round: 1149, numbers: [1, 9, 16, 25, 33, 41], bonus: 22 },
  { round: 1148, numbers: [4, 11, 20, 30, 38, 45], bonus: 17 },
  { round: 1147, numbers: [6, 8, 15, 22, 34, 43], bonus: 29 },
  { round: 1146, numbers: [2, 13, 17, 26, 36, 39], bonus: 7 },
  { round: 1145, numbers: [3, 10, 21, 31, 37, 44], bonus: 14 },
  { round: 1144, numbers: [7, 12, 18, 24, 35, 40], bonus: 1 },
  { round: 1143, numbers: [5, 9, 16, 27, 33, 42], bonus: 38 },
  { round: 1142, numbers: [1, 14, 19, 23, 36, 41], bonus: 6 },
  { round: 1141, numbers: [4, 8, 11, 25, 32, 45], bonus: 20 },
];

export default function StatsPage() {
  const [tab, setTab] = useState<'freq' | 'hot' | 'pairs'>('freq');

  // Calculate frequency of all 45 numbers
  const frequency = useMemo(() => {
    const freq: Record<number, number> = {};
    for (let i = 1; i <= 45; i++) freq[i] = 0;
    recentDraws.forEach((draw) => {
      draw.numbers.forEach((n) => freq[n]++);
    });
    return freq;
  }, []);

  const maxFreq = useMemo(
    () => Math.max(...Object.values(frequency)),
    [frequency]
  );

  // Most frequent / least frequent
  const sortedByFreq = useMemo(() => {
    return Object.entries(frequency)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count);
  }, [frequency]);

  const mostFrequent = sortedByFreq.slice(0, 6);
  const leastFrequent = sortedByFreq.slice(-6).reverse();

  // Hot/cold numbers (recent 10 draws)
  const { hot, cold } = useMemo(() => {
    const recentFreq: Record<number, number> = {};
    for (let i = 1; i <= 45; i++) recentFreq[i] = 0;
    recentDraws.slice(0, 10).forEach((draw) => {
      draw.numbers.forEach((n) => recentFreq[n]++);
    });
    const sorted = Object.entries(recentFreq)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count);
    return {
      hot: sorted.slice(0, 6),
      cold: sorted.filter((n) => n.count === 0).slice(0, 10),
    };
  }, []);

  // Consecutive pairs
  const pairs = useMemo(() => {
    const pairCount: Record<string, number> = {};
    recentDraws.forEach((draw) => {
      const nums = [...draw.numbers].sort((a, b) => a - b);
      for (let i = 0; i < nums.length - 1; i++) {
        if (nums[i + 1] - nums[i] === 1) {
          const key = `${nums[i]}-${nums[i + 1]}`;
          pairCount[key] = (pairCount[key] || 0) + 1;
        }
      }
    });
    return Object.entries(pairCount)
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, []);

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-black text-center text-gold mb-6">
        번호 통계
      </h1>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {[
          { key: 'freq' as const, label: '출현빈도' },
          { key: 'hot' as const, label: 'Hot/Cold' },
          { key: 'pairs' as const, label: '연속번호' },
        ].map((t) => (
          <button
            key={t.key}
            className={`flex-1 py-2 text-sm ${
              tab === t.key ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Frequency Tab */}
      {tab === 'freq' && (
        <div>
          {/* Most / Least */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-red/5 rounded-xl p-3">
              <p className="text-xs font-bold text-red mb-2">최다 출현</p>
              <div className="flex flex-wrap gap-1">
                {mostFrequent.map((n) => (
                  <div key={n.num} className="text-center">
                    <LottoBall number={n.num} size="sm" />
                    <span className="text-[10px] text-gray-400 block">
                      {n.count}회
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-500 mb-2">
                최소 출현
              </p>
              <div className="flex flex-wrap gap-1">
                {leastFrequent.map((n) => (
                  <div key={n.num} className="text-center">
                    <LottoBall number={n.num} size="sm" />
                    <span className="text-[10px] text-gray-400 block">
                      {n.count}회
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Chart */}
          <div className="space-y-1">
            {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
              <div key={num} className="flex items-center gap-2">
                <LottoBall number={num} size="sm" />
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="stat-bar h-full bg-gold rounded-full"
                    style={{
                      width: `${
                        maxFreq > 0 ? (frequency[num] / maxFreq) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-6 text-right">
                  {frequency[num]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hot/Cold Tab */}
      {tab === 'hot' && (
        <div>
          <p className="text-xs text-gray-400 mb-4">
            최근 10회차 기준 (데이터 기반)
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-red mb-3 flex items-center gap-1">
              🔥 Hot 번호
            </h3>
            <div className="flex gap-2 flex-wrap">
              {hot.map((n) => (
                <div
                  key={n.num}
                  className="flex items-center gap-1.5 bg-red/5 px-3 py-1.5 rounded-full"
                >
                  <LottoBall number={n.num} size="sm" />
                  <span className="text-xs font-bold text-red">
                    {n.count}회
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-blue-500 mb-3 flex items-center gap-1">
              🧊 Cold 번호
            </h3>
            {cold.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {cold.map((n) => (
                  <div
                    key={n.num}
                    className="bg-blue-50 px-3 py-1.5 rounded-full"
                  >
                    <LottoBall number={n.num} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                모든 번호가 최근 10회 내에 출현했습니다
              </p>
            )}
          </div>
        </div>
      )}

      {/* Consecutive Pairs Tab */}
      {tab === 'pairs' && (
        <div>
          <p className="text-xs text-gray-400 mb-4">
            최근 20회차에서 나란히 나온 연속 번호 쌍
          </p>

          {pairs.length > 0 ? (
            <div className="space-y-2">
              {pairs.map((p, i) => {
                const [a, b] = p.pair.split('-').map(Number);
                return (
                  <div
                    key={p.pair}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm font-bold text-gray-300 w-5">
                      {i + 1}
                    </span>
                    <div className="flex gap-1">
                      <LottoBall number={a} size="sm" />
                      <LottoBall number={b} size="sm" />
                    </div>
                    <span className="text-xs text-gold font-bold ml-auto">
                      {p.count}회
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-sm py-8">
              연속 번호 쌍이 없습니다
            </p>
          )}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
