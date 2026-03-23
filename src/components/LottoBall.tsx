'use client';

import { motion } from 'framer-motion';

function getBallColor(num: number): string {
  if (num <= 10) return '#FFC107'; // yellow
  if (num <= 20) return '#2196F3'; // blue
  if (num <= 30) return '#F44336'; // red
  if (num <= 40) return '#9E9E9E'; // gray
  return '#4CAF50'; // green
}

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg';
  bonus?: boolean;
  delay?: number;
  animated?: boolean;
}

const sizeMap = {
  sm: { width: 32, height: 32, text: 'text-xs' },
  md: { width: 44, height: 44, text: 'text-sm' },
  lg: { width: 56, height: 56, text: 'text-lg' },
};

export default function LottoBall({
  number,
  size = 'md',
  bonus = false,
  delay = 0,
  animated = false,
}: LottoBallProps) {
  const color = getBallColor(number);
  const s = sizeMap[size];

  const ball = (
    <div
      className="lotto-ball-container"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
    >
      {bonus && (
        <span
          className="text-gray-400 font-bold"
          style={{ fontSize: size === 'sm' ? 12 : size === 'md' ? 16 : 20 }}
        >
          +
        </span>
      )}
      <div
        className={`lotto-ball flex items-center justify-center rounded-full font-bold text-white ${s.text}`}
        style={{
          width: s.width,
          height: s.height,
          backgroundColor: color,
          boxShadow: `0 3px 6px rgba(0,0,0,0.25), inset 0 -2px 4px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.3)`,
        }}
      >
        {number}
      </div>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: delay * 0.12,
        }}
      >
        {ball}
      </motion.div>
    );
  }

  return ball;
}
