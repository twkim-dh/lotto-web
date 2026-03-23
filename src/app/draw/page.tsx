'use client';

import { useState, useEffect } from 'react';
import LottoBall from '@/components/LottoBall';
import { motion } from 'framer-motion';

interface DrawResult {
  returnValue: string;
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
  firstWinamnt: number;
  firstPrzwnerCo: number;
  firstAccumamnt: number;
  totSellamnt: number;
}

function formatMoney(amount: number): string {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const remain = Math.floor((amount % 100000000) / 10000);
    return remain > 0 ? `${eok}억 ${remain.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export default function DrawPage() {
  const [draw, setDraw] = useState<DrawResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [roundInput, setRoundInput] = useState('');
  const [error, setError] = useState('');

  const fetchDraw = async (round?: number) => {
    setLoading(true);
    setError('');
    try {
      const url = round ? `/api/draw?round=${round}` : '/api/draw';
      const res = await fetch(url);
      const data = await res.json();
      if (data.returnValue === 'success') {
        setDraw(data);
        setRoundInput(String(data.drwNo));
      } else {
        setError('해당 회차 정보를 찾을 수 없습니다.');
        setDraw(null);
      }
    } catch {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraw();
  }, []);

  const handleSearch = () => {
    const round = parseInt(roundInput, 10);
    if (round > 0) {
      fetchDraw(round);
    }
  };

  const getNumbers = (d: DrawResult) => [
    d.drwtNo1,
    d.drwtNo2,
    d.drwtNo3,
    d.drwtNo4,
    d.drwtNo5,
    d.drwtNo6,
  ];

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
      {draw && (
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {Array.from({ length: 5 }, (_, i) => draw.drwNo - i).map(
            (round) => (
              <button
                key={round}
                onClick={() => fetchDraw(round)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  draw.drwNo === round
                    ? 'bg-gold text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {round}회
              </button>
            )
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-2" />
          불러오는 중...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-8 text-red text-sm">{error}</div>
      )}

      {/* Draw Result */}
      {draw && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-2xl p-5"
        >
          <div className="text-center mb-4">
            <span className="text-gold font-black text-lg">
              제 {draw.drwNo}회
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {draw.drwNoDate} 추첨
            </p>
          </div>

          {/* Numbers */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-6">
            {getNumbers(draw).map((num, i) => (
              <LottoBall key={i} number={num} size="lg" animated delay={i} />
            ))}
            <LottoBall
              number={draw.bnusNo}
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
                  {formatMoney(draw.firstWinamnt)}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {draw.firstPrzwnerCo}명
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
              <div>
                <span className="text-xs text-gray-400">총 판매금액</span>
                <p className="text-sm font-bold text-gray-700">
                  {formatMoney(draw.totSellamnt)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="h-8" />
    </div>
  );
}
