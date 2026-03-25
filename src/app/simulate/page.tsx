'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LottoBall from '@/components/LottoBall';
import Navigation from '@/components/Navigation';
import allDrawsData from '@/data/all-draws.json';

interface Draw {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
}

const allDraws = allDrawsData as Draw[];

function checkRank(myNums: number[], drawNums: number[], bonus: number): { rank: number | null; matched: number[]; hasBonus: boolean } {
  const matched = myNums.filter(n => drawNums.includes(n));
  const hasBonus = myNums.includes(bonus);
  let rank: number | null = null;
  if (matched.length === 6) rank = 1;
  else if (matched.length === 5 && hasBonus) rank = 2;
  else if (matched.length === 5) rank = 3;
  else if (matched.length === 4) rank = 4;
  else if (matched.length === 3) rank = 5;
  return { rank, matched, hasBonus };
}

const rankLabels: Record<number, { label: string; emoji: string; prize: string; color: string }> = {
  1: { label: '1등', emoji: '🏆', prize: '약 20억원', color: 'text-red-600' },
  2: { label: '2등', emoji: '🥈', prize: '약 5,000만원', color: 'text-orange-500' },
  3: { label: '3등', emoji: '🥉', prize: '약 150만원', color: 'text-yellow-600' },
  4: { label: '4등', emoji: '🎫', prize: '5만원', color: 'text-green-600' },
  5: { label: '5등', emoji: '🎟️', prize: '5,000원', color: 'text-blue-600' },
};

export default function SimulatePage() {
  const [myNumbers, setMyNumbers] = useState<number[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<{
    totalDraws: number;
    totalCost: number;
    totalPrize: number;
    ranks: Record<number, number>;
    bestRank: number | null;
    bestRound: number | null;
    roi: number;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailList, setDetailList] = useState<Array<{
    round: number;
    date: string;
    rank: number;
    matched: number[];
  }>>([]);

  // Ball selector
  const toggleNumber = (n: number) => {
    if (myNumbers.includes(n)) {
      setMyNumbers(myNumbers.filter(x => x !== n));
    } else if (myNumbers.length < 6) {
      setMyNumbers([...myNumbers, n].sort((a, b) => a - b));
    }
  };

  const simulate = () => {
    if (myNumbers.length !== 6) return;
    setIsSimulating(true);
    setResults(null);
    setDetailList([]);

    // Simulate in requestAnimationFrame to not block UI
    setTimeout(() => {
      const ranks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let bestRank: number | null = null;
      let bestRound: number | null = null;
      const details: typeof detailList = [];

      const prizeLookup: Record<number, number> = {
        1: 2000000000, 2: 50000000, 3: 1500000, 4: 50000, 5: 5000,
      };

      let totalPrize = 0;

      for (const draw of allDraws) {
        const { rank, matched } = checkRank(myNumbers, draw.numbers, draw.bonus);
        if (rank) {
          ranks[rank]++;
          totalPrize += prizeLookup[rank];
          if (!bestRank || rank < bestRank) {
            bestRank = rank;
            bestRound = draw.round;
          }
          details.push({ round: draw.round, date: draw.date, rank, matched });
        }
      }

      const totalCost = allDraws.length * 1000;

      setResults({
        totalDraws: allDraws.length,
        totalCost,
        totalPrize,
        ranks,
        bestRank,
        bestRound,
        roi: totalPrize > 0 ? Math.round((totalPrize / totalCost) * 100) : 0,
      });
      setDetailList(details);
      setIsSimulating(false);
    }, 100);
  };

  const randomNumbers = () => {
    const nums = new Set<number>();
    while (nums.size < 6) {
      nums.add(Math.floor(Math.random() * 45) + 1);
    }
    setMyNumbers([...nums].sort((a, b) => a - b));
    setResults(null);
  };

  const totalWins = results ? Object.values(results.ranks).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-center">🎰 당첨 시뮬레이션</h1>
        <p className="text-xs text-gray-400 text-center mt-1">
          내 번호로 역대 {allDraws.length}회차 전부 대입해보기
        </p>
      </div>

      {/* Number Selector */}
      <div className="px-4 mb-4">
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">번호 6개를 선택하세요</p>
            <button
              onClick={randomNumbers}
              className="text-xs px-3 py-1 bg-gold/20 text-gold rounded-full hover:bg-gold/30 transition-colors"
            >
              🎲 랜덤
            </button>
          </div>

          {/* Selected numbers */}
          <div className="flex gap-2 mb-3 min-h-[44px] items-center">
            {myNumbers.length > 0 ? (
              myNumbers.map(n => (
                <LottoBall key={n} number={n} size="md" />
              ))
            ) : (
              <p className="text-xs text-gray-500">아래에서 번호를 터치하세요</p>
            )}
            {myNumbers.length > 0 && myNumbers.length < 6 && (
              <span className="text-xs text-gray-500">{6 - myNumbers.length}개 더</span>
            )}
          </div>

          {/* Ball grid */}
          <div className="grid grid-cols-9 gap-1.5">
            {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
              const selected = myNumbers.includes(n);
              return (
                <button
                  key={n}
                  onClick={() => toggleNumber(n)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    selected
                      ? 'bg-gold text-gray-900 scale-110 shadow-lg shadow-gold/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${!selected && myNumbers.length >= 6 ? 'opacity-30' : ''}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulate Button */}
      <div className="px-4 mb-6">
        <button
          onClick={simulate}
          disabled={myNumbers.length !== 6 || isSimulating}
          className="w-full py-4 bg-gold text-gray-900 rounded-2xl text-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSimulating ? '시뮬레이션 중...' : myNumbers.length === 6 ? `🎰 ${allDraws.length}회차 시뮬레이션 시작!` : `번호 ${6 - myNumbers.length}개 더 선택하세요`}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 space-y-4"
          >
            {/* Summary Card */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-4">📊 시뮬레이션 결과</h3>

              {/* Big number */}
              <div className="text-center mb-4">
                {results.bestRank ? (
                  <>
                    <p className="text-5xl font-black">
                      {rankLabels[results.bestRank].emoji}
                    </p>
                    <p className={`text-2xl font-bold mt-2 ${rankLabels[results.bestRank].color}`}>
                      최고 {rankLabels[results.bestRank].label} 당첨!
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      제 {results.bestRound}회차에서
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-5xl">😢</p>
                    <p className="text-xl font-bold text-gray-400 mt-2">당첨 없음</p>
                  </>
                )}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">검사 회차</p>
                  <p className="text-lg font-bold">{results.totalDraws.toLocaleString()}회</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">총 투자금</p>
                  <p className="text-lg font-bold">{(results.totalCost / 10000).toLocaleString()}만원</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">총 당첨금</p>
                  <p className="text-lg font-bold text-gold">
                    {results.totalPrize >= 100000000
                      ? `${(results.totalPrize / 100000000).toFixed(1)}억`
                      : results.totalPrize >= 10000
                      ? `${(results.totalPrize / 10000).toLocaleString()}만`
                      : `${results.totalPrize.toLocaleString()}`}원
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">수익률</p>
                  <p className={`text-lg font-bold ${results.roi >= 100 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.roi}%
                  </p>
                </div>
              </div>

              {/* Rank breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400">등수별 당첨 횟수</p>
                {[1, 2, 3, 4, 5].map(rank => (
                  <div key={rank} className="flex items-center gap-2">
                    <span className="text-sm w-16">{rankLabels[rank].emoji} {rankLabels[rank].label}</span>
                    <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalWins > 0 ? (results.ranks[rank] / results.totalDraws) * 100 * 50 : 0}%` }}
                        transition={{ delay: rank * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          rank === 1 ? 'bg-red-500' : rank === 2 ? 'bg-orange-500' : rank === 3 ? 'bg-yellow-500' : rank === 4 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-bold w-12 text-right">
                      {results.ranks[rank]}회
                    </span>
                    <span className="text-xs text-gray-500 w-16 text-right">
                      {rankLabels[rank].prize}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Win details */}
            {detailList.length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full"
                >
                  <span className="text-sm font-bold">🎯 당첨 상세 ({detailList.length}회)</span>
                  <span className="text-xs text-gray-400">{showDetails ? '접기 ▲' : '펼치기 ▼'}</span>
                </button>

                {showDetails && (
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {detailList.sort((a, b) => a.rank - b.rank).map((d, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2">
                        <span className="text-sm">{rankLabels[d.rank].emoji}</span>
                        <span className="text-xs text-gray-400 w-16">{d.round}회</span>
                        <span className="text-xs text-gray-500 flex-1">{d.date}</span>
                        <span className={`text-xs font-bold ${rankLabels[d.rank].color}`}>
                          {d.matched.length}개 일치
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fun interpretation */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 text-center">
              <p className="text-sm font-bold mb-2">📝 해석</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {results.bestRank === 1 && '🏆 이 번호로 1등에 당첨된 적이 있습니다! 역사적인 번호네요!'}
                {results.bestRank === 2 && '🥈 2등 당첨! 보너스 번호까지 맞춘 대단한 번호입니다!'}
                {results.bestRank === 3 && '🥉 3등 당첨 경험이 있는 번호! 꽤 운이 좋은 조합이에요.'}
                {results.bestRank === 4 && '🎫 4등 당첨! 평균적인 번호 조합입니다.'}
                {results.bestRank === 5 && `🎟️ ${results.ranks[5]}회차 동안 5등만 당첨. 평범한 번호입니다.`}
                {!results.bestRank && `😅 ${results.totalDraws}회차 동안 단 한 번도 3개 이상 맞은 적이 없어요. 다른 번호를 시도해보세요!`}
                {results.roi >= 100 && '\n💰 투자 대비 수익이 플러스! 대박 번호입니다!'}
                {results.roi > 0 && results.roi < 100 && '\n📉 투자금 대비 손해지만, 로또는 원래 그런 거죠 😄'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const text = `🎰 로또 시뮬레이션 결과\n번호: ${myNumbers.join(', ')}\n${results.totalDraws}회차 검사 → ${results.bestRank ? `최고 ${rankLabels[results.bestRank].label}!` : '당첨 없음'}\n수익률: ${results.roi}%\n→ https://lotto.dhlm-studio.com/simulate`;
                  if (navigator.share) {
                    navigator.share({ title: '로또 시뮬레이션', text });
                  } else {
                    navigator.clipboard.writeText(text);
                    alert('결과가 복사되었습니다!');
                  }
                }}
                className="flex-1 py-3 bg-yellow-400 text-gray-900 rounded-xl text-sm font-bold"
              >
                📱 결과 공유
              </button>
              <button
                onClick={() => { setResults(null); setMyNumbers([]); }}
                className="flex-1 py-3 bg-gray-700 text-gray-200 rounded-xl text-sm font-bold"
              >
                🔄 다시 하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  );
}
