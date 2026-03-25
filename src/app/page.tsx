'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NumberSet from '@/components/NumberSet';
import LottoBall from '@/components/LottoBall';
import {
  generateRandom,
  generateWithFixed,
  generateExcluding,
  generateOddEven,
  generateDreamWithSource,
  dreamData,
} from '@/lib/generator';
import type { DreamEntry, DreamResult } from '@/lib/generator';
import { initKakao, shareLotto } from '@/lib/kakao';
import allDraws from '@/data/all-draws.json';

type Mode = 'random' | 'dream' | 'fixed' | 'exclude' | 'oddeven';

const modes: { key: Mode; label: string }[] = [
  { key: 'random', label: '랜덤' },
  { key: 'dream', label: '꿈해몽' },
  { key: 'fixed', label: '고정수 포함' },
  { key: 'exclude', label: '제외수' },
  { key: 'oddeven', label: '홀짝비율' },
];

const oddEvenOptions = [
  { label: '홀3:짝3', odd: 3 },
  { label: '홀4:짝2', odd: 4 },
  { label: '홀2:짝4', odd: 2 },
];

const popularKeywords = ['돼지', '돈', '용', '뱀', '집', '물', '불', '결혼', '아기', '별', '산', '금'];

interface DrawData {
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
  prize1: string;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>('random');
  const [setCount, setSetCount] = useState(1);
  const [results, setResults] = useState<number[][]>([]);
  const [dreamResults, setDreamResults] = useState<DreamResult[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Mode-specific states
  const [dreamSearch, setDreamSearch] = useState('');
  const [selectedDream, setSelectedDream] = useState<DreamEntry | null>(null);
  const [fixedNumbers, setFixedNumbers] = useState<number[]>([]);
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);
  const [oddCount, setOddCount] = useState(3);

  // Share feedback
  const [shareMsg, setShareMsg] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  // Latest draw from static data
  const latestDraw = useMemo(() => {
    const draws = allDraws as DrawData[];
    return draws[draws.length - 1];
  }, []);

  // Filtered dream data based on search
  const filteredDreams = useMemo(() => {
    if (!dreamSearch.trim()) return [];
    return dreamData.filter((d) => d.keyword.includes(dreamSearch.trim()));
  }, [dreamSearch]);

  useEffect(() => {
    initKakao();
  }, []);

  const handleGenerate = useCallback(() => {
    let generated: number[][] = [];

    switch (mode) {
      case 'random':
        generated = generateRandom(setCount);
        setDreamResults([]);
        break;
      case 'dream': {
        if (!selectedDream) {
          alert('꿈 키워드를 선택해주세요!');
          return;
        }
        const dResults = generateDreamWithSource(selectedDream.keyword, setCount);
        setDreamResults(dResults);
        generated = dResults.map((r) => r.numbers);
        break;
      }
      case 'fixed':
        if (fixedNumbers.length === 0) {
          alert('고정할 번호를 선택해주세요!');
          return;
        }
        generated = generateWithFixed(fixedNumbers, setCount);
        setDreamResults([]);
        break;
      case 'exclude':
        if (excludedNumbers.length === 0) {
          alert('제외할 번호를 선택해주세요!');
          return;
        }
        if (excludedNumbers.length > 39) {
          alert('제외 번호가 너무 많습니다!');
          return;
        }
        generated = generateExcluding(excludedNumbers, setCount);
        setDreamResults([]);
        break;
      case 'oddeven':
        generated = generateOddEven(oddCount, setCount);
        setDreamResults([]);
        break;
    }

    setResults(generated);
    setIsGenerated(true);
    setAnimationKey((k) => k + 1);
  }, [mode, setCount, selectedDream, fixedNumbers, excludedNumbers, oddCount]);

  const handleShare = async () => {
    const success = await shareLotto(results);
    if (success) {
      setShareMsg('복사 완료!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  const handleSaveImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 80 + results.length * 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DHLM 로또 번호', canvas.width / 2, 35);

    const ballColors: Record<string, string> = {
      yellow: '#FFC107',
      blue: '#2196F3',
      red: '#F44336',
      gray: '#9E9E9E',
      green: '#4CAF50',
    };

    const getColor = (n: number) => {
      if (n <= 10) return ballColors.yellow;
      if (n <= 20) return ballColors.blue;
      if (n <= 30) return ballColors.red;
      if (n <= 40) return ballColors.gray;
      return ballColors.green;
    };

    results.forEach((set, si) => {
      const y = 70 + si * 60;
      const label = String.fromCharCode(65 + si);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, 15, y + 5);

      set.forEach((num, ni) => {
        const cx = 55 + ni * 55;
        ctx.beginPath();
        ctx.arc(cx, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = getColor(num);
        ctx.fill();
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(num), cx, y);
      });
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lotto-numbers.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const toggleNumber = (
    num: number,
    list: number[],
    setList: (nums: number[]) => void,
    max: number
  ) => {
    if (list.includes(num)) {
      setList(list.filter((n) => n !== num));
    } else if (list.length < max) {
      setList([...list, num]);
    }
  };

  const renderNumberGrid = (
    selected: number[],
    setSelected: (nums: number[]) => void,
    max: number
  ) => (
    <div className="grid grid-cols-9 gap-1.5 mt-3 mb-3">
      {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          className={`number-selector-ball ${
            selected.includes(num) ? 'selected' : ''
          }`}
          onClick={() => toggleNumber(num, selected, setSelected, max)}
        >
          {num}
        </button>
      ))}
    </div>
  );

  const handleSelectDream = (entry: DreamEntry) => {
    setSelectedDream(entry);
    setDreamSearch('');
    setIsGenerated(false);
    setDreamResults([]);
  };

  return (
    <div className="px-4 pt-6">
      {/* Logo */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-gold">DHLM 로또 🎱</h1>
        <p className="text-xs text-gray-400 mt-1">
          행운의 번호를 뽑아보세요
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex overflow-x-auto gap-0 border-b border-gray-200 mb-4 no-scrollbar">
        {modes.map((m) => (
          <button
            key={m.key}
            className={`px-3 py-2 text-sm whitespace-nowrap transition-all ${
              mode === m.key ? 'tab-active' : 'tab-inactive'
            }`}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Mode-specific inputs */}
      <div className="mb-4">
        {mode === 'dream' && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              꿈 키워드 검색
            </label>
            <input
              type="text"
              value={dreamSearch}
              onChange={(e) => setDreamSearch(e.target.value)}
              placeholder="꿈에서 본 것을 검색하세요..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />

            {/* Search results */}
            {dreamSearch.trim() && filteredDreams.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                {filteredDreams.map((entry) => (
                  <button
                    key={entry.keyword}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                    onClick={() => handleSelectDream(entry)}
                  >
                    <span className="text-lg">{entry.emoji}</span>
                    <span className="text-sm font-medium">{entry.keyword}</span>
                    <span className="text-xs text-gray-400 ml-auto">{entry.meaning}</span>
                  </button>
                ))}
              </div>
            )}
            {dreamSearch.trim() && filteredDreams.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">일치하는 키워드가 없습니다. 아래 인기 키워드를 선택해보세요.</p>
            )}

            {/* Popular keyword buttons */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">인기 키워드</p>
              <div className="flex flex-wrap gap-2">
                {popularKeywords.map((kw) => {
                  const entry = dreamData.find((d) => d.keyword === kw);
                  if (!entry) return null;
                  return (
                    <button
                      key={kw}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedDream?.keyword === kw
                          ? 'bg-gold text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => handleSelectDream(entry)}
                    >
                      {entry.emoji} {kw}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected dream info */}
            {selectedDream && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{selectedDream.emoji}</span>
                  <span className="text-lg font-bold">{selectedDream.keyword}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{selectedDream.meaning}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">관련 번호:</span>
                  {selectedDream.numbers.map((num) => (
                    <LottoBall key={num} number={num} size="sm" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'fixed' && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              고정 번호 선택 (최대 3개)
            </label>
            {renderNumberGrid(fixedNumbers, setFixedNumbers, 3)}
            <p className="text-xs text-gray-400">
              선택: {fixedNumbers.sort((a, b) => a - b).join(', ') || '없음'}
            </p>
          </div>
        )}

        {mode === 'exclude' && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              제외할 번호 선택
            </label>
            {renderNumberGrid(excludedNumbers, setExcludedNumbers, 39)}
            <p className="text-xs text-gray-400">
              제외: {excludedNumbers.length}개 선택됨
            </p>
          </div>
        )}

        {mode === 'oddeven' && (
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              홀짝 비율 선택
            </label>
            <div className="flex gap-2">
              {oddEvenOptions.map((opt) => (
                <button
                  key={opt.odd}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    oddCount === opt.odd
                      ? 'bg-gold text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setOddCount(opt.odd)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Set Count */}
      {mode !== 'dream' && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-700">세트 수:</span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                  setCount === n
                    ? 'bg-gold text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setSetCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="generate-btn pulse-gold w-full py-4 rounded-2xl text-lg font-black tracking-wider"
      >
        {mode === 'dream' && selectedDream ? '이 꿈으로 번호 뽑기' : '번호 생성!'}
      </button>

      {/* Results */}
      <AnimatePresence mode="wait">
        {isGenerated && results.length > 0 && (
          <motion.div
            key={animationKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
          >
            <div className="bg-gray-50 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">
                생성된 번호
              </h3>
              {results.map((set, i) => (
                <div key={`${animationKey}-${i}`}>
                  {mode === 'dream' && dreamResults[i] ? (
                    <div className="number-set flex items-center gap-2 py-2">
                      <span className="text-sm font-bold text-gold w-6 shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {set.map((num, j) => (
                          <div key={`${num}-${j}`} className="relative">
                            <LottoBall number={num} size="md" animated delay={j} />
                            {dreamResults[i].dreamNumbers.includes(num) && (
                              <span className="absolute -top-1 -right-1 text-gold text-xs font-bold">★</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <NumberSet
                      label={String.fromCharCode(65 + i)}
                      numbers={set}
                      animated={true}
                    />
                  )}
                </div>
              ))}
              {mode === 'dream' && dreamResults.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">★ = 꿈 해몽 번호 / 나머지 = 랜덤</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 bg-yellow-400 text-gray-900 rounded-xl text-sm font-bold hover:bg-yellow-500 transition-colors"
              >
                {shareMsg || '카카오톡 공유'}
              </button>
              <button
                onClick={handleSaveImage}
                className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors"
              >
                이미지 저장
              </button>
            </div>

            {/* 구매 연결 섹션 */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4">
              <h4 className="text-sm font-bold text-green-800 mb-3">🛒 이 번호로 구매하려면</h4>

              {/* 세트별 번호 + 개별 복사 */}
              <div className="space-y-2 mb-3">
                {results.map((set, i) => {
                  const label = String.fromCharCode(65 + i);
                  return (
                    <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-200">
                      <span className="text-xs font-bold text-green-700 w-8">{label}세트</span>
                      <span className="flex-1 text-sm font-mono text-gray-800">{set.join(', ')}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(set.join(', ')).then(() => {
                            setCopyMsg(`${label} 복사완료!`);
                            setTimeout(() => setCopyMsg(''), 1500);
                          }).catch(() => {
                            prompt(`${label}세트 번호:`, set.join(', '));
                          });
                        }}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors whitespace-nowrap"
                      >
                        📋 복사
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 전체 복사 */}
              <button
                onClick={() => {
                  const text = results.map((set, i) =>
                    `${String.fromCharCode(65 + i)}세트: ${set.join(', ')}`
                  ).join('\n');
                  navigator.clipboard.writeText(text).then(() => {
                    setCopyMsg('전체 번호 복사 완료! ✅');
                    setTimeout(() => setCopyMsg(''), 2000);
                  }).catch(() => {
                    prompt('번호를 복사하세요:', results.map(s => s.join(', ')).join(' / '));
                  });
                }}
                className="w-full py-2.5 bg-white border border-green-300 text-green-800 rounded-xl text-sm font-bold hover:bg-green-100 transition-colors mb-3"
              >
                {copyMsg || '📋 전체 번호 복사'}
              </button>

              {/* 안내 */}
              <div className="bg-green-100/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-green-700 leading-relaxed">
                  💡 <strong>번호 복사</strong> → <strong>동행복권 앱 열기</strong> → <strong>수동 선택</strong>으로 입력하세요
                </p>
              </div>

              {/* 동행복권 연결 */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
                    if (isMobile) {
                      const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
                      const storeUrl = isIOS
                        ? 'https://apps.apple.com/kr/app/%EB%8F%99%ED%96%89%EB%B3%B5%EA%B6%8C/id1354740879'
                        : 'https://play.google.com/store/apps/details?id=com.dhlottery.dlotto';
                      window.location.href = storeUrl;
                    } else {
                      window.open('https://dhlottery.co.kr/', '_blank');
                    }
                  }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                >
                  🛒 동행복권 앱 열기
                </button>
                <button
                  onClick={() => window.open('https://dhlottery.co.kr/', '_blank')}
                  className="flex-1 py-3 bg-white border border-green-300 text-green-700 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors"
                >
                  🌐 웹사이트
                </button>
              </div>

              <p className="text-[10px] text-gray-400 mt-3 text-center leading-relaxed">
                ⚠️ 본 서비스는 번호 생성만 제공하며 구매 대행을 하지 않습니다.
                구매는 동행복권 공식 앱/사이트에서 직접 해주세요.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link to draw results */}
      <div className="mt-6 text-center">
        <a
          href="/draw"
          className="text-sm text-gold font-medium hover:underline"
        >
          이번 회차 당첨번호 확인 &rarr;
        </a>
      </div>

      {/* Latest Draw Mini Display */}
      {latestDraw && (
        <div className="mt-6 bg-gray-50 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">
            최근 당첨번호{' '}
            <span className="text-gold">({latestDraw.round}회)</span>
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {latestDraw.numbers.map((num: number, i: number) => (
              <LottoBall key={i} number={num} size="sm" />
            ))}
            <LottoBall number={latestDraw.bonus} size="sm" bonus />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {latestDraw.date} 추첨
          </p>
        </div>
      )}

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}
