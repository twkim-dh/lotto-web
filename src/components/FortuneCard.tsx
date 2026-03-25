'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import LottoBall from './LottoBall';

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getFortuneScore(birthday: string, dateStr: string): number {
  return (hashStr(birthday + dateStr) % 100) + 1;
}

function getLuckyNumbers(birthday: string, dateStr: string): number[] {
  let h = hashStr(birthday + dateStr + 'lucky');
  const nums: number[] = [];
  while (nums.length < 3) {
    const n = (h % 45) + 1;
    if (!nums.includes(n)) nums.push(n);
    h = Math.floor(h / 45) + h + 7;
  }
  return nums.sort((a, b) => a - b);
}

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDayLabel(dateStr: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(dateStr).getDay()];
}

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((day + 6) % 7)); // Monday
  const dates: string[] = [];
  for (let i = 0; i < 6; i++) { // Mon~Sat
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return dates;
}

function getFortuneStyle(score: number) {
  if (score >= 90) return { emoji: '🔥', text: '대박 운세! 오늘 꼭 뽑으세요!', bg: 'from-red-500/20 to-orange-500/20', border: 'border-red-500/30', textColor: 'text-red-400' };
  if (score >= 70) return { emoji: '😊', text: '운세가 좋은 날이에요!', bg: 'from-orange-500/20 to-yellow-500/20', border: 'border-orange-500/30', textColor: 'text-orange-400' };
  if (score >= 50) return { emoji: '🙂', text: '평범한 날이에요', bg: 'from-yellow-500/10 to-green-500/10', border: 'border-yellow-500/20', textColor: 'text-yellow-400' };
  if (score >= 30) return { emoji: '😐', text: '좀 쉬어가는 날...', bg: 'from-gray-500/10 to-gray-600/10', border: 'border-gray-500/20', textColor: 'text-gray-400' };
  return { emoji: '😴', text: '오늘은 쉬세요!', bg: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-500/20', textColor: 'text-blue-400' };
}

interface FortuneCardProps {
  onGenerateWithLucky?: (luckyNums: number[]) => void;
}

export default function FortuneCard({ onGenerateWithLucky }: FortuneCardProps) {
  const [birthday, setBirthday] = useState<string | null>(null);
  const [inputYear, setInputYear] = useState('1990');
  const [inputMonth, setInputMonth] = useState('01');
  const [inputDay, setInputDay] = useState('01');
  const [showInput, setShowInput] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lotto_birthday');
    if (saved) {
      setBirthday(saved);
    } else {
      setShowInput(true);
    }
  }, []);

  const today = getToday();
  const todayLabel = getDayLabel(today);
  const weekDates = useMemo(() => getWeekDates(), []);

  const score = birthday ? getFortuneScore(birthday, today) : 0;
  const luckyNums = birthday ? getLuckyNumbers(birthday, today) : [];
  const style = getFortuneStyle(score);

  // Save today's fortune to history
  useEffect(() => {
    if (!birthday || !score) return;
    try {
      const historyRaw = localStorage.getItem('lotto_fortune_history');
      const history = historyRaw ? JSON.parse(historyRaw) : {};
      if (!history[today]) {
        history[today] = { score, luckyNumbers: luckyNums };
        localStorage.setItem('lotto_fortune_history', JSON.stringify(history));
      }
    } catch { /* ignore */ }
  }, [birthday, score, today, luckyNums]);

  const weekScores = useMemo(() => {
    if (!birthday) return [];
    return weekDates.map(date => {
      const isPast = date <= today;
      return {
        date,
        day: getDayLabel(date),
        score: isPast ? getFortuneScore(birthday, date) : null,
        isToday: date === today,
        isSat: getDayLabel(date) === '토',
      };
    });
  }, [birthday, today, weekDates]);

  const bestDay = weekScores.filter(w => w.score !== null).sort((a, b) => (b.score || 0) - (a.score || 0))[0];

  const handleSubmit = () => {
    const bd = `${inputYear}-${inputMonth.padStart(2, '0')}-${inputDay.padStart(2, '0')}`;
    localStorage.setItem('lotto_birthday', bd);
    setBirthday(bd);
    setShowInput(false);
  };

  const handleShare = async () => {
    const text = `🔮 오늘의 로또 운세 ${score}점! ${style.emoji}\n행운 번호: ${luckyNums.join(', ')}\n당신의 오늘 운세는?\n→ https://lotto.dhlm-studio.com`;
    if (navigator.share) {
      await navigator.share({ title: '오늘의 로또 운세', text });
    } else {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Birthday input
  if (showInput && !birthday) {
    return (
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-4">
        <p className="text-sm font-bold text-center mb-1">🔮 오늘의 로또 운세</p>
        <p className="text-xs text-gray-400 text-center mb-4">생년월일을 입력하면 매일 운세를 알려드려요!</p>
        <div className="flex gap-2 justify-center mb-3">
          <input type="number" value={inputYear} onChange={e => setInputYear(e.target.value)} placeholder="년" min="1940" max="2010" className="w-20 px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center text-sm" />
          <span className="self-center text-gray-500 text-sm">년</span>
          <input type="number" value={inputMonth} onChange={e => setInputMonth(e.target.value)} placeholder="월" min="1" max="12" className="w-16 px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center text-sm" />
          <span className="self-center text-gray-500 text-sm">월</span>
          <input type="number" value={inputDay} onChange={e => setInputDay(e.target.value)} placeholder="일" min="1" max="31" className="w-16 px-2 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center text-sm" />
          <span className="self-center text-gray-500 text-sm">일</span>
        </div>
        <button onClick={handleSubmit} className="w-full py-2.5 bg-gold text-gray-900 rounded-xl text-sm font-bold">확인</button>
        <p className="text-[10px] text-gray-500 text-center mt-2">※ 재미용 운세입니다. 기기에만 저장됩니다.</p>
      </div>
    );
  }

  if (!birthday) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${style.bg} rounded-2xl p-5 border ${style.border} mb-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold">🔮 오늘의 로또 운세</p>
        <p className="text-xs text-gray-400">{today.replace(/-/g, '.')} ({todayLabel})</p>
      </div>

      {/* Score Circle */}
      <div className="flex items-center gap-4 mb-3">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <motion.path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={score >= 70 ? '#F59E0B' : score >= 50 ? '#6B7280' : '#3B82F6'}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              initial={{ strokeDasharray: '0, 100' }}
              animate={{ strokeDasharray: `${score}, 100` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black">{score}</span>
            <span className="text-[10px] text-gray-400">/100</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-2xl mb-1">{style.emoji}</p>
          <p className={`text-sm font-bold ${style.textColor}`}>{style.text}</p>
        </div>
      </div>

      {/* Lucky Numbers */}
      <div className="bg-black/20 rounded-xl p-3 mb-3">
        <p className="text-xs text-gray-400 mb-2">🍀 오늘의 행운 번호</p>
        <div className="flex gap-2 items-center">
          {luckyNums.map(n => <LottoBall key={n} number={n} size="md" />)}
          <div className="flex-1" />
          {onGenerateWithLucky && (
            <button
              onClick={() => onGenerateWithLucky(luckyNums)}
              className="text-xs px-3 py-1.5 bg-gold/20 text-gold rounded-full hover:bg-gold/30 transition-colors"
            >
              이 번호로 뽑기 →
            </button>
          )}
        </div>
      </div>

      {/* Week Trend */}
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-2">📅 이번 주 운세 추이</p>
        <div className="flex gap-1">
          {weekScores.map((w, i) => (
            <div key={i} className={`flex-1 text-center rounded-lg py-1.5 ${w.isToday ? 'bg-gold/20 border border-gold/30' : 'bg-black/10'}`}>
              <p className={`text-[10px] ${w.isSat ? 'text-red-400 font-bold' : 'text-gray-500'}`}>
                {w.day}{w.isSat ? '!' : ''}
              </p>
              {w.score !== null ? (
                <>
                  <p className={`text-sm font-bold ${w.score >= 70 ? 'text-orange-400' : w.score >= 50 ? 'text-gray-300' : 'text-blue-400'}`}>
                    {w.score}
                  </p>
                  <p className="text-[10px]">{getFortuneStyle(w.score).emoji}</p>
                </>
              ) : (
                <p className="text-sm text-gray-600">??</p>
              )}
            </div>
          ))}
        </div>
        {bestDay && bestDay.score && bestDay.score >= 70 && (
          <p className="text-[10px] text-gold mt-1.5 text-center">
            💡 이번 주 최고 운세: {bestDay.day}요일 ({bestDay.score}점) — 그날 번호로 구매해보세요!
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleShare} className="flex-1 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-colors">
          {shared ? '복사됨! ✅' : '📱 운세 공유'}
        </button>
        <button
          onClick={() => { localStorage.removeItem('lotto_birthday'); setBirthday(null); setShowInput(true); }}
          className="py-2 px-3 bg-white/5 text-gray-500 rounded-xl text-xs hover:bg-white/10 transition-colors"
        >
          재설정
        </button>
      </div>
    </motion.div>
  );
}
