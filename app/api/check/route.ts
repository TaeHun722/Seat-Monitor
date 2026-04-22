import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { cookie, roomId, targetSeats } = await req.json();

    if (!cookie || !roomId || !targetSeats) {
      return NextResponse.json(
        { error: "missing_params", message: "필수 파라미터가 없습니다" },
        { status: 400 }
      );
    }

    const url = `https://wseat.yonsei.ac.kr:444/libraries/seats/${roomId}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "ko-KR,ko;q=0.9",
        Referer: "https://wseat.yonsei.ac.kr:444/",
        Cookie: `JSESSIONID=${cookie}`,
      },
    });

    // 세션 만료 체크
    if (res.status === 401 || res.status === 403 || res.status === 302) {
      return NextResponse.json(
        {
          error: "session_expired",
          message: "세션이 만료되었습니다. 쿠키를 다시 입력해주세요.",
        },
        { status: 401 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "api_error", message: `API 응답 오류: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("json")) {
      // HTML 응답 = 로그인 페이지 리다이렉트 (세션 만료)
      return NextResponse.json(
        {
          error: "session_expired",
          message: "세션이 만료되었습니다. 쿠키를 다시 입력해주세요.",
        },
        { status: 401 }
      );
    }

    const data = await res.json();

    if (data.code !== 1 || !data.data) {
      return NextResponse.json(
        { error: "api_error", message: "API 데이터 형식 오류" },
        { status: 502 }
      );
    }

    const targets = (targetSeats as string[]).map(String);
    const allTarget = data.data.filter((s: any) => targets.includes(String(s.name)));
    const empty = allTarget.filter(
      (s: any) => s.seatTime === null || s.seatTime === undefined
    );

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      total: allTarget.length,
      emptyCount: empty.length,
      emptySeats: empty.map((s: any) => String(s.name)),
      allTarget: allTarget.map((s: any) => ({
        name: String(s.name),
        occupied: s.seatTime !== null && s.seatTime !== undefined,
      })),
      cookieValid: true,
    });
  } catch (e: any) {
    console.error("Check error:", e);
    return NextResponse.json(
      { error: "server_error", message: e.message },
      { status: 500 }
    );
  }
}
