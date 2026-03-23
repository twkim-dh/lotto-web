import { NextRequest } from 'next/server';

// Simple in-memory cache
const cache = new Map<number, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Estimate latest draw number based on date
function estimateLatestRound(): number {
  // Round 1 was 2002-12-07, draws happen every Saturday
  const firstDraw = new Date('2002-12-07');
  const now = new Date();
  const diffMs = now.getTime() - firstDraw.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks + 1;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roundParam = searchParams.get('round');
  const round = roundParam ? parseInt(roundParam, 10) : estimateLatestRound();

  // Check cache
  const cached = cache.get(round);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Response.json(cached.data);
  }

  try {
    const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!res.ok) {
      return Response.json(
        { error: 'Failed to fetch draw results' },
        { status: 502 }
      );
    }

    const data = await res.json();

    // If the round doesn't exist yet (future round), try previous round
    if (data.returnValue !== 'success' && !roundParam) {
      const prevRound = round - 1;
      const prevUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${prevRound}`;
      const prevRes = await fetch(prevUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (prevRes.ok) {
        const prevData = await prevRes.json();
        if (prevData.returnValue === 'success') {
          cache.set(prevRound, { data: prevData, timestamp: Date.now() });
          return Response.json(prevData);
        }
      }
    }

    if (data.returnValue === 'success') {
      cache.set(round, { data, timestamp: Date.now() });
    }

    return Response.json(data);
  } catch {
    return Response.json(
      { error: 'Failed to fetch draw results' },
      { status: 500 }
    );
  }
}
