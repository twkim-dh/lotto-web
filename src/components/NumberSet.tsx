'use client';

import LottoBall from './LottoBall';

interface NumberSetProps {
  label: string;
  numbers: number[];
  animated?: boolean;
}

export default function NumberSet({
  label,
  numbers,
  animated = false,
}: NumberSetProps) {
  return (
    <div className="number-set flex items-center gap-2 py-2">
      <span className="text-sm font-bold text-gold w-6 shrink-0">{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {numbers.map((num, i) => (
          <LottoBall
            key={`${label}-${num}-${i}`}
            number={num}
            size="md"
            delay={i}
            animated={animated}
          />
        ))}
      </div>
    </div>
  );
}
