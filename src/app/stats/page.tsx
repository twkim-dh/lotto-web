'use client';

import { useState, useMemo } from 'react';
import LottoBall from '@/components/LottoBall';
import allDraws from '@/data/all-draws.json';

interface DrawData {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
  prize1: string;
}

const draws = allDraws as DrawData[];

export default function StatsPage() {
  const [tab, setTab] = useState<'freq' | 'hot' | 'oddeven' | 'range'>('freq');

  const totalDraws = draws.length;

  // Calculate frequency of all 45 numbers
  const frequency = useMemo(() => {
    const freq: Record<number, number> = {};
    for (let i = 1; i <= 45; i++) freq[i] = 0;
    draws.forEach((draw) => {
      draw.numbers.forEach((n) => freq[n]++);
    });
    return freq;
  }, []);

  const maxFreq = useMemo(
    () => Math.max(...Object.values(frequency)),
    [frequency]
  );

  // Sorted by frequency
  const sortedByFreq = useMemo(() => {
    return Object.entries(frequency)
      .map(([num, count]) => ({ num: parseInt(num), count }))
      .sort((a, b) => b.count - a.count);
  }, [frequency]);

  // Hot: top 10 most frequent
  const hotNumbers = sortedByFreq.slice(0, 10);
  // Cold: top 10 least frequent
  const coldNumbers = [...sortedByFreq].reverse().slice(0, 10);

  // Odd/Even ratio across all draws
  const oddEvenStats = useMemo(() => {
    let totalOdd = 0;
    let totalEven = 0;
    draws.forEach((draw) => {
      draw.numbers.forEach((n) => {
        if (n % 2 === 1) totalOdd++;
        else totalEven++;
      });
    });
    return { odd: totalOdd, even: totalEven };
  }, []);

  // Number range distribution
  const rangeStats = useMemo(() => {
    const ranges = [
      { label: '1~10', min: 1, max: 10, count: 0 },
      { label: '11~20', min: 11, max: 20, count: 0 },
      { label: '21~30', min: 21, max: 30, count: 0 },
      { label: '31~40', min: 31, max: 40, count: 0 },
      { label: '41~45', min: 41, max: 45, count: 0 },
    ];
    draws.forEach((draw) => {
      draw.numbers.forEach((n) => {
        for (const r of ranges) {
          if (n >= r.min && n <= r.max) {
            r.count++;
            break;
          }
        }
      });
    });
    return ranges;
  }, []);

  const maxRange = useMemo(
    () => Math.max(...rangeStats.map((r) => r.count)),
    [rangeStats]
  );

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-black text-center text-gold mb-2">
        번호 통계
      </h1>
      <p className="text-xs text-gray-400 text-center mb-6">
        데이터 기반: 1~{totalDraws}회차
      </p>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {[
          { key: 'freq' as const, label: '출현빈도' },
          { key: 'hot' as const, label: 'Hot/Cold' },
          { key: 'oddeven' as const, label: '홀짝비율' },
          { key: 'range' as const, label: '구간분포' },
        ].map((t) => (
          <button
            key={t.key}
            className={`flex-1 py-2 text-sm whitespace-nowrap ${
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
          <p className="text-xs text-gray-400 mb-4">
            전체 {totalDraws}회차 출현 빈도
          </p>
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
                <span className="text-xs text-gray-500 w-10 text-right">
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
          <div className="mb-6">
            <h3 className="text-sm font-bold text-red mb-3 flex items-center gap-1">
              🔥 Hot 번호 (최다 출현 Top 10)
            </h3>
            <div className="space-y-2">
              {hotNumbers.map((n, i) => (
                <div
                  key={n.num}
                  className="flex items-center gap-3 bg-red/5 rounded-xl px-4 py-2"
                >
                  <span className="text-sm font-bold text-gray-300 w-5">
                    {i + 1}
                  </span>
                  <LottoBall number={n.num} size="sm" />
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-red rounded-full"
                      style={{
                        width: `${maxFreq > 0 ? (n.count / maxFreq) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-red w-12 text-right">
                    {n.count}회
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-blue-500 mb-3 flex items-center gap-1">
              🧊 Cold 번호 (최소 출현 Top 10)
            </h3>
            <div className="space-y-2">
              {coldNumbers.map((n, i) => (
                <div
                  key={n.num}
                  className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-2"
                >
                  <span className="text-sm font-bold text-gray-300 w-5">
                    {i + 1}
                  </span>
                  <LottoBall number={n.num} size="sm" />
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{
                        width: `${maxFreq > 0 ? (n.count / maxFreq) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-500 w-12 text-right">
                    {n.count}회
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Odd/Even Tab */}
      {tab === 'oddeven' && (
        <div>
          <p className="text-xs text-gray-400 mb-4">
            전체 {totalDraws}회차 기준 홀수/짝수 비율
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center flex-1">
                <p className="text-xs text-gray-400 mb-1">홀수</p>
                <p className="text-2xl font-black text-red">{oddEvenStats.odd.toLocaleString()}</p>
                <p className="text-sm font-bold text-red">
                  {((oddEvenStats.odd / (oddEvenStats.odd + oddEvenStats.even)) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-gray-300 text-lg font-bold">vs</div>
              <div className="text-center flex-1">
                <p className="text-xs text-gray-400 mb-1">짝수</p>
                <p className="text-2xl font-black text-blue-500">{oddEvenStats.even.toLocaleString()}</p>
                <p className="text-sm font-bold text-blue-500">
                  {((oddEvenStats.even / (oddEvenStats.odd + oddEvenStats.even)) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Visual bar */}
            <div className="h-6 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-red"
                style={{
                  width: `${(oddEvenStats.odd / (oddEvenStats.odd + oddEvenStats.even)) * 100}%`,
                }}
              />
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${(oddEvenStats.even / (oddEvenStats.odd + oddEvenStats.even)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-red">홀수</span>
              <span className="text-xs text-blue-500">짝수</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            총 {(oddEvenStats.odd + oddEvenStats.even).toLocaleString()}개 번호 분석
          </p>
        </div>
      )}

      {/* Range Distribution Tab */}
      {tab === 'range' && (
        <div>
          <p className="text-xs text-gray-400 mb-4">
            전체 {totalDraws}회차 번호 구간별 출현 분포
          </p>

          <div className="space-y-3">
            {rangeStats.map((r) => (
              <div key={r.label} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700">{r.label}</span>
                  <span className="text-sm font-bold text-gold">{r.count.toLocaleString()}회</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full transition-all"
                    style={{
                      width: `${maxRange > 0 ? (r.count / maxRange) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  비율: {((r.count / (totalDraws * 6)) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
