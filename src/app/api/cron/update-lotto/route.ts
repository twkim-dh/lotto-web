import { NextResponse } from "next/server";

// Vercel Cron: 매주 토요일 밤 10시 (KST = UTC+9 → UTC 13:00)
// vercel.json에서 schedule 설정

const LOTTO_API =
  "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do";

async function fetchDraw(round: number): Promise<{
  round: number;
  date: string;
  numbers: number[];
  bonus: number;
  prize1: string;
  winners1: number;
} | null> {
  try {
    const res = await fetch(
      `${LOTTO_API}?srchDir=center&srchLtEpsd=${round}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "X-Requested-With": "XMLHttpRequest",
          Referer: "https://www.dhlottery.co.kr/lt645/result",
        },
      }
    );

    const data = await res.json();
    const list = data?.data?.list;
    if (!list || list.length === 0) return null;

    const item = list[0];
    const nums = [
      item.tm1WnNo,
      item.tm2WnNo,
      item.tm3WnNo,
      item.tm4WnNo,
      item.tm5WnNo,
      item.tm6WnNo,
    ].sort((a: number, b: number) => a - b);

    const dateRaw = String(item.ltRflYmd || "");
    const dateStr =
      dateRaw.length === 8
        ? `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}`
        : "";

    return {
      round,
      date: dateStr,
      numbers: nums,
      bonus: item.bnsWnNo || 0,
      prize1: item.rnk1WnAmt ? `${item.rnk1WnAmt.toLocaleString()}원` : "0",
      winners1: item.rnk1WnNope || 0,
    };
  } catch {
    return null;
  }
}

function estimateLatestRound(): number {
  const start = new Date("2002-12-07").getTime();
  const now = Date.now();
  return Math.floor((now - start) / (7 * 86400000)) + 1;
}

export async function GET(request: Request) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Import current data
    const currentData = await import("@/data/all-draws.json").then(
      (m) => m.default as Array<{ round: number }>
    );
    const lastRound = Math.max(...currentData.map((d) => d.round));
    const estimatedLatest = estimateLatestRound();

    console.log(
      `[Cron] Current last: ${lastRound}, Estimated latest: ${estimatedLatest}`
    );

    // Fetch new draws
    const newDraws = [];
    for (let r = lastRound + 1; r <= estimatedLatest + 1; r++) {
      const draw = await fetchDraw(r);
      if (draw && draw.numbers.every((n) => n > 0)) {
        newDraws.push(draw);
        console.log(`[Cron] Fetched ${r}: ${draw.numbers} + ${draw.bonus}`);
      } else {
        console.log(`[Cron] Round ${r}: no data yet`);
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (newDraws.length === 0) {
      return NextResponse.json({
        message: "No new draws available",
        lastRound,
        estimatedLatest,
        checkedAt: new Date().toISOString(),
      });
    }

    // Note: Vercel serverless cannot write to filesystem
    // New draws are returned in response for manual update
    // For auto-update, use GitHub Actions or external storage

    return NextResponse.json({
      message: `Found ${newDraws.length} new draw(s)`,
      lastRound,
      newDraws,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
