"""로또 당첨번호 자동 업데이트 스크립트
매주 토요일 GitHub Actions에서 실행됨.
최신 회차 데이터를 수집해서 all-draws.json에 추가.
"""

import requests
import json
import time
import sys
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "src", "data", "all-draws.json")
LOTTO_API = "https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do"


def fetch_draw(session, round_no):
    """동행복권 API에서 특정 회차 당첨번호 조회"""
    try:
        r = session.get(
            f"{LOTTO_API}?srchDir=center&srchLtEpsd={round_no}",
            timeout=10,
        )
        data = r.json()
        item_list = data.get("data", {}).get("list", [])
        if not item_list:
            return None

        item = item_list[0]
        nums = sorted(
            [item[f"tm{i}WnNo"] for i in range(1, 7)]
        )

        # 유효성 체크
        if not all(1 <= n <= 45 for n in nums):
            return None

        date_raw = str(item.get("ltRflYmd", ""))
        date_str = (
            f"{date_raw[:4]}-{date_raw[4:6]}-{date_raw[6:8]}"
            if len(date_raw) == 8
            else ""
        )

        prize1 = item.get("rnk1WnAmt", 0)

        return {
            "round": round_no,
            "date": date_str,
            "numbers": nums,
            "bonus": item.get("bnsWnNo", 0),
            "prize1": f"{prize1:,}원" if prize1 else "0",
            "winners1": item.get("rnk1WnNope", 0),
        }
    except Exception as e:
        print(f"  Error fetching round {round_no}: {e}", file=sys.stderr)
        return None


def estimate_latest_round():
    """현재 날짜 기준 최신 회차 추정"""
    from datetime import datetime

    start = datetime(2002, 12, 7)
    now = datetime.now()
    weeks = (now - start).days // 7
    return weeks + 1


def main():
    # 기존 데이터 로드
    with open(DATA_FILE, encoding="utf-8") as f:
        draws = json.load(f)

    last_round = max(d["round"] for d in draws)
    estimated = estimate_latest_round()

    print(f"Current data: {len(draws)} draws, last round: {last_round}")
    print(f"Estimated latest round: {estimated}")

    # 세션 설정
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": "https://www.dhlottery.co.kr/lt645/result",
        }
    )
    # 쿠키 획득
    session.get("https://www.dhlottery.co.kr/lt645/result", timeout=10)

    # 새로운 회차 수집
    new_count = 0
    for round_no in range(last_round + 1, estimated + 2):
        draw = fetch_draw(session, round_no)
        if draw:
            draws.append(draw)
            new_count += 1
            print(f"  {round_no}회: {draw['numbers']} + {draw['bonus']} ({draw['date']})")
        else:
            print(f"  {round_no}회: no data (probably not drawn yet)")
            break
        time.sleep(0.2)

    if new_count > 0:
        # 정렬 + 중복 제거
        seen = set()
        unique = []
        for d in sorted(draws, key=lambda x: x["round"]):
            if d["round"] not in seen:
                unique.append(d)
                seen.add(d["round"])
        draws = unique

        # 저장
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(draws, f, ensure_ascii=False)

        print(f"\nUpdated! Total: {len(draws)} draws (+{new_count} new)")
    else:
        print("\nNo new draws found. Data is up to date.")


if __name__ == "__main__":
    main()
