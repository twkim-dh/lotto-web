'use client';

import { useState, useMemo } from 'react';
import LottoBall from '@/components/LottoBall';
import { motion } from 'framer-motion';
import allDraws from '@/data/all-draws.json';

interface DrawData {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
  prize1: string;
}

const draws = allDraws as DrawData[];

export default function DrawPage() {
  const latestRound = draws[draws.length - 1].round;
  const [roundInput, setRoundInput] = useState(String(latestRound));
  const [viewRound, setViewRound] = useState(latestRound);
  const [error, setError] = useState('');

  const draw = useMemo(() => {
    return draws.find((d) => d.round === viewRound) || null;
  }, [viewRound]);

  const handleSearch = () => {
    const round = parseInt(roundInput, 10);
    if (round > 0 && round <= latestRound) {
      setViewRound(round);
      setError('');
    } else {
      setError('해당 회차 정보를 찾을 수 없습니다.');
    }
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-black text-center text-gold mb-6">
        당첨번호 조회
      </h1>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={roundInput}
          onChange={(e) => setRoundInput(e.target.value)}
          placeholder="회차 번호"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-gold text-white rounded-lg text-sm font-bold hover:bg-gold-dark transition-colors"
        >
          조회
        </button>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {Array.from({ length: 5 }, (_, i) => latestRound - i).map(
          (round) => (
            <button
              key={round}
              onClick={() => {
                setViewRound(round);
                setRoundInput(String(round));
                setError('');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                viewRound === round
                  ? 'bg-gold text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {round}회
            </button>
          )
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-center py-8 text-red text-sm">{error}</div>
      )}

      {/* Draw Result */}
      {draw && (
        <motion.div
          key={draw.round}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-2xl p-5"
        >
          <div className="text-center mb-4">
            <span className="text-gold font-black text-lg">
              제 {draw.round}회
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {draw.date} 추첨
            </p>
          </div>

          {/* Numbers */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-6">
            {draw.numbers.map((num, i) => (
              <LottoBall key={i} number={num} size="lg" animated delay={i} />
            ))}
            <LottoBall
              number={draw.bonus}
              size="lg"
              bonus
              animated
              delay={6}
            />
          </div>

          {/* Prize Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
              <div>
                <span className="text-xs text-gray-400">1등 당첨금</span>
                <p className="text-sm font-bold text-gold">
                  {draw.prize1}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent draws list */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">최근 회차</h3>
        <div className="space-y-2">
          {draws.slice(-20).reverse().map((d) => (
            <button
              key={d.round}
              onClick={() => {
                setViewRound(d.round);
                setRoundInput(String(d.round));
                setError('');
              }}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors ${
                viewRound === d.round ? 'bg-gold/10' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className="text-sm font-bold text-gold w-16">{d.round}회</span>
              <div className="flex gap-1 flex-1 flex-wrap">
                {d.numbers.map((num, i) => (
                  <LottoBall key={i} number={num} size="sm" />
                ))}
                <LottoBall number={d.bonus} size="sm" bonus />
              </div>
              <span className="text-xs text-gray-400 shrink-0">{d.date}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
