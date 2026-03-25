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

function checkRank(myNums: number[], drawNums: number[], bonus: number) {
  const matched = myNums.filter(n => drawNums.includes(n));
  const hasBonus = myNums.includes(bonus);
  let rank: number | null = null;
  if (matched.length === 6) rank = 1;
  else if (matched.length === 5 && hasBonus) rank = 2;
  else if (matched.length === 5) rank = 3;
  else if (matched.length === 4) rank = 4;
  else if (matched.length === 3) rank = 5;
  return { rank, matched, matchCount: matched.length, hasBonus };
}

const rankInfo: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: '1등', emoji: '🏆', color: 'bg-red-500' },
  2: { label: '2등', emoji: '🥈', color: 'bg-orange-500' },
  3: { label: '3등', emoji: '🥉', color: 'bg-yellow-500' },
  4: { label: '4등', emoji: '🎫', color: 'bg-green-500' },
  5: { label: '5등', emoji: '🎟️', color: 'bg-blue-500' },
};

export default function VerifyPage() {
  const [myNumbers, setMyNumbers] = useState<number[]>([]);
  const [startRound, setStartRound] = useState('1');
  const [endRound, setEndRound] = useState(String(allDraws[allDraws.length - 1].round));
  const [verified, setVerified] = useState(false);

  const toggleNumber = (n: number) => {
    if (myNumbers.includes(n)) {
      setMyNumbers(myNumbers.filter(x => x !== n));
    } else if (myNumbers.length < 6) {
      setMyNumbers([...myNumbers, n].sort((a, b) => a - b));
    }
  };

  // Verification results
  const verifyResults = useMemo(() => {
    if (!verified || myNumbers.length !== 6) return null;

    const start = parseInt(startRound) || 1;
    const end = parseInt(endRound) || allDraws[allDraws.length - 1].round;
    const filteredDraws = allDraws.filter(d => d.round >= start && d.round <= end);

    const matchDistribution = [0, 0, 0, 0, 0, 0, 0]; // 0~6개 일치
    const winList: Array<{
      round: number;
      date: string;
      rank: number;
      matched: number[];
      drawNumbers: number[];
      bonus: number;
    }> = [];

    // 번호별 출현 횟수 (내 번호만)
    const myNumFreq: Record<number, number> = {};
    for (const n of myNumbers) myNumFreq[n] = 0;

    for (const draw of filteredDraws) {
      const { rank, matched, matchCount } = checkRank(myNumbers, draw.numbers, draw.bonus);
      matchDistribution[matchCount]++;

      for (const n of matched) {
        if (myNumFreq[n] !== undefined) myNumFreq[n]++;
      }

      if (rank) {
        winList.push({
          round: draw.round,
          date: draw.date,
          rank,
          matched,
          drawNumbers: draw.numbers,
          bonus: draw.bonus,
        });
      }
    }

    // 연속 미당첨 최장 기록
    let maxDryStreak = 0;
    let currentStreak = 0;
    for (const draw of filteredDraws) {
      const { rank } = checkRank(myNumbers, draw.numbers, draw.bonus);
      if (!rank) {
        currentStreak++;
        maxDryStreak = Math.max(maxDryStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // 평균 일치 개수
    const totalMatches = matchDistribution.reduce((sum, count, idx) => sum + count * idx, 0);
    const avgMatch = filteredDraws.length > 0 ? totalMatches / filteredDraws.length : 0;

    return {
      totalDraws: filteredDraws.length,
      matchDistribution,
      winList,
      myNumFreq,
      maxDryStreak,
      avgMatch,
      startRound: start,
      endRound: end,
    };
  }, [verified, myNumbers, startRound, endRound]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pb-24">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-center">🔬 내 번호 역대 검증</h1>
        <p className="text-xs text-gray-400 text-center mt-1">
          내 번호가 역대 당첨번호와 얼마나 겹쳤는지 분석
        </p>
      </div>

      {/* Number Selector */}
      <div className="px-4 mb-4">
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold">번호 6개 선택</p>
            <button
              onClick={() => {
                const nums = new Set<number>();
                while (nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
                setMyNumbers([...nums].sort((a, b) => a - b));
                setVerified(false);
              }}
              className="text-xs px-3 py-1 bg-gold/20 text-gold rounded-full"
            >
              🎲 랜덤
            </button>
          </div>

          <div className="flex gap-2 mb-3 min-h-[44px] items-center">
            {myNumbers.length > 0 ? (
              myNumbers.map(n => <LottoBall key={n} number={n} size="md" />)
            ) : (
              <p className="text-xs text-gray-500">아래에서 번호를 터치하세요</p>
            )}
          </div>

          <div className="grid grid-cols-9 gap-1.5">
            {Array.from({ length: 45 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => { toggleNumber(n); setVerified(false); }}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  myNumbers.includes(n)
                    ? 'bg-gold text-gray-900 scale-110 shadow-lg shadow-gold/30'
                    : myNumbers.length >= 6 ? 'bg-gray-700 text-gray-500 opacity-30' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Round range */}
          <div className="flex gap-2 mt-3 items-center">
            <input
              type="number"
              value={startRound}
              onChange={e => { setStartRound(e.target.value); setVerified(false); }}
              className="w-20 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-center text-sm"
              min={1}
              max={allDraws.length}
            />
            <span className="text-xs text-gray-400">~</span>
            <input
              type="number"
              value={endRound}
              onChange={e => { setEndRound(e.target.value); setVerified(false); }}
              className="w-20 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-center text-sm"
              min={1}
              max={allDraws.length}
            />
            <span className="text-xs text-gray-400">회차</span>
          </div>
        </div>
      </div>

      {/* Verify Button */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setVerified(true)}
          disabled={myNumbers.length !== 6}
          className="w-full py-4 bg-gold text-gray-900 rounded-2xl text-lg font-bold disabled:opacity-40"
        >
          {myNumbers.length === 6 ? '🔬 역대 검증 시작!' : `번호 ${6 - myNumbers.length}개 더 선택`}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {verifyResults && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 space-y-4"
          >
            {/* Match Distribution */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-4">📊 일치 개수 분포</h3>
              <div className="space-y-2">
                {[6, 5, 4, 3, 2, 1, 0].map(count => {
                  const num = verifyResults.matchDistribution[count];
                  const pct = verifyResults.totalDraws > 0 ? (num / verifyResults.totalDraws) * 100 : 0;
                  return (
                    <div key={count} className="flex items-center gap-2">
                      <span className="text-xs w-14 text-right">
                        {count}개 일치
                      </span>
                      <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(pct * 2, 100)}%` }}
                          transition={{ delay: (6 - count) * 0.1, duration: 0.5 }}
                          className={`h-full rounded-full ${
                            count >= 5 ? 'bg-red-500' : count >= 3 ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      <span className="text-xs w-16 text-right font-bold">
                        {num}회 ({pct.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>검증 범위: {verifyResults.startRound}~{verifyResults.endRound}회</span>
                <span>총 {verifyResults.totalDraws}회 검증</span>
              </div>
            </div>

            {/* Key Stats */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-4">🔑 핵심 지표</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">평균 일치 개수</p>
                  <p className="text-2xl font-black text-gold">{verifyResults.avgMatch.toFixed(2)}</p>
                  <p className="text-[10px] text-gray-500">이론값: 0.80</p>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">최장 미당첨 연속</p>
                  <p className="text-2xl font-black text-red-400">{verifyResults.maxDryStreak}회</p>
                  <p className="text-[10px] text-gray-500">{(verifyResults.maxDryStreak / 52).toFixed(1)}년</p>
                </div>
              </div>
            </div>

            {/* My Number Frequency */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <h3 className="text-sm font-bold text-gray-400 mb-4">🎱 내 번호별 출현 빈도</h3>
              <div className="grid grid-cols-6 gap-2">
                {myNumbers.map(n => {
                  const freq = verifyResults.myNumFreq[n];
                  const avgFreq = verifyResults.totalDraws * 6 / 45;
                  const isHot = freq > avgFreq;
                  return (
                    <div key={n} className="text-center">
                      <LottoBall number={n} size="sm" />
                      <p className={`text-xs font-bold mt-1 ${isHot ? 'text-red-400' : 'text-blue-400'}`}>
                        {freq}회
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {isHot ? '🔥' : '❄️'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                평균 출현: {(verifyResults.totalDraws * 6 / 45).toFixed(0)}회 기준 🔥핫/❄️콜드
              </p>
            </div>

            {/* Win History */}
            {verifyResults.winList.length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                <h3 className="text-sm font-bold text-gray-400 mb-3">
                  🎯 당첨 이력 ({verifyResults.winList.length}회)
                </h3>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {verifyResults.winList.sort((a, b) => a.rank - b.rank).map((w, i) => (
                    <div key={i} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold">
                          {rankInfo[w.rank].emoji} {rankInfo[w.rank].label}
                        </span>
                        <span className="text-xs text-gray-400">{w.round}회 ({w.date})</span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {w.drawNumbers.map(n => (
                          <div key={n} className="relative">
                            <LottoBall number={n} size="sm" />
                            {w.matched.includes(n) && (
                              <span className="absolute -top-1 -right-1 text-[10px] text-gold font-bold">✓</span>
                            )}
                          </div>
                        ))}
                        <span className="text-gray-500 text-xs self-center mx-1">+</span>
                        <div className="relative">
                          <LottoBall number={w.bonus} size="sm" />
                          {myNumbers.includes(w.bonus) && (
                            <span className="absolute -top-1 -right-1 text-[10px] text-gold font-bold">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verdict */}
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 text-center">
              <p className="text-sm font-bold mb-2">📋 종합 평가</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {verifyResults.avgMatch > 0.9
                  ? '🔥 평균 이상으로 자주 겹치는 강력한 번호 조합입니다!'
                  : verifyResults.avgMatch > 0.75
                  ? '✅ 평균 수준의 번호 조합입니다. 무난한 선택!'
                  : '❄️ 평균보다 겹침이 적은 번호입니다. 다른 조합도 시도해보세요.'}
                {verifyResults.winList.some(w => w.rank <= 3) &&
                  '\n🏆 역대 3등 이상 당첨 경험이 있는 강운의 번호!'}
              </p>
            </div>

            {/* Share */}
            <button
              onClick={() => {
                const text = `🔬 로또 번호 검증\n번호: ${myNumbers.join(', ')}\n${verifyResults.totalDraws}회 검증 결과:\n평균 일치: ${verifyResults.avgMatch.toFixed(2)}개\n당첨: ${verifyResults.winList.length}회\n→ https://lotto.dhlm-studio.com/verify`;
                if (navigator.share) {
                  navigator.share({ title: '로또 번호 검증', text });
                } else {
                  navigator.clipboard.writeText(text);
                  alert('결과가 복사되었습니다!');
                }
              }}
              className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl text-sm font-bold"
            >
              📱 검증 결과 공유
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  );
}
