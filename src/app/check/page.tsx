'use client';

import { useState, useEffect } from 'react';
import LottoBall from '@/components/LottoBall';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawResult {
  drwNo: number;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
}

interface CheckResult {
  matchedNumbers: number[];
  matchedBonus: boolean;
  rank: number | null;
  rankLabel: string;
}

export default function CheckPage() {
  const [myNumbers, setMyNumbers] = useState<number[]>([]);
  const [roundInput, setRoundInput] = useState('');
  const [draw, setDraw] = useState<DrawResult | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Fetch latest draw to get default round
    fetch('/api/draw')
      .then((r) => r.json())
      .then((data) => {
        if (data.returnValue === 'success') {
          setDraw(data);
          setRoundInput(String(data.drwNo));
        }
      })
      .catch(() => {});
  }, []);

  const toggleNumber = (num: number) => {
    if (myNumbers.includes(num)) {
      setMyNumbers(myNumbers.filter((n) => n !== num));
    } else if (myNumbers.length < 6) {
      setMyNumbers([...myNumbers, num]);
    }
  };

  const handleCheck = async () => {
    if (myNumbers.length !== 6) {
      alert('6개의 번호를 선택해주세요!');
      return;
    }

    // Fetch the draw if round changed
    const round = parseInt(roundInput, 10);
    let currentDraw = draw;

    if (!draw || draw.drwNo !== round) {
      try {
        const res = await fetch(`/api/draw?round=${round}`);
        const data = await res.json();
        if (data.returnValue === 'success') {
          currentDraw = data;
          setDraw(data);
        } else {
          alert('해당 회차 정보를 찾을 수 없습니다.');
          return;
        }
      } catch {
        alert('데이터를 불러오는데 실패했습니다.');
        return;
      }
    }

    if (!currentDraw) return;

    const winNumbers = [
      currentDraw.drwtNo1,
      currentDraw.drwtNo2,
      currentDraw.drwtNo3,
      currentDraw.drwtNo4,
      currentDraw.drwtNo5,
      currentDraw.drwtNo6,
    ];

    const matched = myNumbers.filter((n) => winNumbers.includes(n));
    const matchedBonus = myNumbers.includes(currentDraw.bnusNo);

    let rank: number | null = null;
    let rankLabel = '낙첨';

    if (matched.length === 6) {
      rank = 1;
      rankLabel = '1등';
    } else if (matched.length === 5 && matchedBonus) {
      rank = 2;
      rankLabel = '2등';
    } else if (matched.length === 5) {
      rank = 3;
      rankLabel = '3등';
    } else if (matched.length === 4) {
      rank = 4;
      rankLabel = '4등';
    } else if (matched.length === 3) {
      rank = 5;
      rankLabel = '5등';
    }

    setResult({ matchedNumbers: matched, matchedBonus, rank, rankLabel });

    if (matched.length >= 3) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const getRankColor = (rank: number | null) => {
    if (rank === 1) return 'text-red';
    if (rank === 2) return 'text-gold';
    if (rank === 3 || rank === 4 || rank === 5) return 'text-blue-500';
    return 'text-gray-400';
  };

  const confettiColors = [
    '#D4AF37',
    '#DC2626',
    '#FFC107',
    '#2196F3',
    '#4CAF50',
  ];

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-black text-center text-gold mb-6">
        당첨 확인
      </h1>

      {/* Round Input */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-1">
          회차 번호
        </label>
        <input
          type="number"
          value={roundInput}
          onChange={(e) => setRoundInput(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
        />
      </div>

      {/* Number Selection */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-1">
          내 번호 선택 (6개)
        </label>
        <div className="grid grid-cols-9 gap-1.5 mt-2">
          {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`number-selector-ball ${
                myNumbers.includes(num) ? 'selected' : ''
              }`}
              onClick={() => toggleNumber(num)}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 mt-3 items-center">
          <span className="text-xs text-gray-400">선택:</span>
          {myNumbers
            .sort((a, b) => a - b)
            .map((num, i) => (
              <LottoBall key={i} number={num} size="sm" />
            ))}
          {myNumbers.length < 6 && (
            <span className="text-xs text-gray-300">
              {6 - myNumbers.length}개 더 선택
            </span>
          )}
        </div>
      </div>

      {/* Check Button */}
      <button
        onClick={handleCheck}
        className="w-full py-3 bg-red text-white rounded-xl text-base font-bold hover:bg-red-700 transition-colors"
      >
        확인하기
      </button>

      {/* Result */}
      <AnimatePresence>
        {result && draw && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-6 bg-gray-50 rounded-2xl p-5"
          >
            {/* Draw Numbers */}
            <div className="text-center mb-4">
              <span className="text-sm text-gray-500">
                제 {draw.drwNo}회 당첨번호
              </span>
              <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                {[
                  draw.drwtNo1,
                  draw.drwtNo2,
                  draw.drwtNo3,
                  draw.drwtNo4,
                  draw.drwtNo5,
                  draw.drwtNo6,
                ].map((num, i) => (
                  <div
                    key={i}
                    className={`${
                      result.matchedNumbers.includes(num)
                        ? 'ring-2 ring-red ring-offset-2 rounded-full'
                        : ''
                    }`}
                  >
                    <LottoBall number={num} size="md" />
                  </div>
                ))}
                <div
                  className={`${
                    result.matchedBonus
                      ? 'ring-2 ring-red ring-offset-2 rounded-full'
                      : ''
                  }`}
                >
                  <LottoBall number={draw.bnusNo} size="md" bonus />
                </div>
              </div>
            </div>

            {/* Result Display */}
            <div
              className={`text-center py-4 ${
                result.rank ? 'celebrate' : ''
              }`}
            >
              <p className="text-sm text-gray-500 mb-1">
                {result.matchedNumbers.length}개 일치
                {result.matchedBonus ? ' + 보너스' : ''}
              </p>
              <p
                className={`text-3xl font-black ${getRankColor(result.rank)}`}
              >
                {result.rankLabel}
              </p>
              {result.rank && result.rank <= 3 && (
                <p className="text-sm text-gold mt-1">축하합니다! 🎉</p>
              )}
              {!result.rank && (
                <p className="text-xs text-gray-400 mt-1">
                  다음에 행운을 빕니다!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {showConfetti &&
        Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor:
                confettiColors[
                  Math.floor(Math.random() * confettiColors.length)
                ],
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            }}
          />
        ))}

      <div className="h-8" />
    </div>
  );
}
