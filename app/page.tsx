"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { playAlarmSound, playNotifySound } from "@/lib/sound";
import SeatGrid from "@/components/SeatGrid";
import FullScreenAlert from "@/components/FullScreenAlert";
import StatusHeader from "@/components/StatusHeader";
import AlertHistory from "@/components/AlertHistory";

interface SeatInfo {
  name: string;
  occupied: boolean;
}

interface CheckResult {
  timestamp: string;
  total: number;
  emptyCount: number;
  emptySeats: string[];
  allTarget: SeatInfo[];
}

interface AlertLog {
  time: string;
  seats: string[];
}

export default function Home() {
  const router = useRouter();
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullAlert, setFullAlert] = useState(false);
  const [alertSeats, setAlertSeats] = useState<string[]>([]);
  const [newEmpty, setNewEmpty] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [cookieValid, setCookieValid] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("sm_cookie");
  });
  const [checkCount, setCheckCount] = useState(0);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevEmptyRef = useRef<Set<string>>(new Set());
  const isFirstRunRef = useRef(true);
  const POLL_INTERVAL = 30; // 30초

  const getConfig = useCallback(() => {
    if (typeof window === "undefined") return null;
    const cookie = localStorage.getItem("sm_cookie");
    const roomId = localStorage.getItem("sm_roomId") || "4";
    const seats = localStorage.getItem("sm_seats") || "40,41,42,43,44,45";
    if (!cookie) return null;
    return {
      cookie,
      roomId: Number(roomId),
      targetSeats: seats.split(",").map((s) => s.trim()).filter(Boolean),
    };
  }, []);

  const triggerAlert = useCallback(
    (seats: string[]) => {
      setAlertSeats(seats);
      setNewEmpty(seats);
      setFullAlert(true);

      if (soundEnabled) {
        playAlarmSound(5);
      }

      // 히스토리 추가
      setAlertLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString("ko-KR"),
          seats: [...seats],
        },
      ]);

      // 진동 (모바일)
      if (navigator.vibrate) {
        navigator.vibrate([300, 200, 300, 200, 500]);
      }
    },
    [soundEnabled]
  );

  const checkSeats = useCallback(async () => {
    const config = getConfig();
    if (!config) {
      setError("설정에서 쿠키를 먼저 입력해주세요");
      setIsRunning(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (res.status === 401) {
        setError("⚠️ 쿠키 만료! 설정에서 새 쿠키를 입력하세요");
        setCookieValid(false);
        setIsRunning(false);
        return;
      }

      if (!res.ok) {
        setError(data.message || data.error || "조회 실패");
        return;
      }

      setResult(data);
      setCookieValid(true);
      setCheckCount((c) => c + 1);

      const currentEmpty = new Set(data.emptySeats as string[]);

      if (isFirstRunRef.current) {
        // 첫 조회: 빈 좌석이 있으면 알림
        if (data.emptyCount > 0) {
          triggerAlert(data.emptySeats);
        }
        isFirstRunRef.current = false;
      } else {
        // 이후 조회: 새로 빈 좌석만 알림
        const freshEmpty = [...currentEmpty].filter(
          (s) => !prevEmptyRef.current.has(s)
        );
        if (freshEmpty.length > 0) {
          triggerAlert(freshEmpty);
        } else {
          setNewEmpty([]);
        }
      }

      prevEmptyRef.current = currentEmpty;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "알 수 없는 오류";
      setError("네트워크 오류: " + message);
    } finally {
      setLoading(false);
      setCountdown(POLL_INTERVAL);
    }
  }, [getConfig, triggerAlert]);

  const startMonitor = useCallback(() => {
    const config = getConfig();
    if (!config) {
      setError("설정에서 쿠키를 먼저 입력해주세요");
      return;
    }

    // 사운드 초기화 (모바일에서 유저 인터랙션 필요)
    playNotifySound();

    setIsRunning(true);
    setError(null);
    setCheckCount(0);
    setAlertLogs([]);
    isFirstRunRef.current = true;
    prevEmptyRef.current = new Set();
    checkSeats();
  }, [getConfig, checkSeats]);

  const stopMonitor = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Polling
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(checkSeats, POLL_INTERVAL * 1000);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : POLL_INTERVAL));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isRunning, checkSeats]);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 max-w-md mx-auto pb-20 relative">
      {/* 전체 화면 알림 */}
      {fullAlert && (
        <FullScreenAlert
          seats={alertSeats}
          onDismiss={() => setFullAlert(false)}
        />
      )}

      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">💺 좌석 모니터</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`text-sm px-3 py-1 rounded-lg ${
              soundEnabled
                ? "bg-blue-600/30 text-blue-400"
                : "bg-gray-800 text-gray-500"
            }`}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg"
          >
            ⚙️ 설정
          </button>
        </div>
      </div>

      {/* 상태 헤더 */}
      <StatusHeader
        isRunning={isRunning}
        loading={loading}
        countdown={countdown}
        cookieValid={cookieValid}
        checkCount={checkCount}
      />

      {/* 에러 */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-3 mb-4 text-sm animate-slide-down">
          {error}
          {error.includes("쿠키") && (
            <button
              onClick={() => router.push("/settings")}
              className="block mt-2 text-red-400 underline text-xs"
            >
              설정 페이지로 이동 →
            </button>
          )}
        </div>
      )}

      {/* 시작/중지 버튼 */}
      <div className="flex gap-2 mb-4">
        {!isRunning ? (
          <button
            onClick={startMonitor}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-600/20 active:scale-95 transition-transform"
          >
            ▶ 모니터링 시작!
          </button>
        ) : (
          <>
            <button
              onClick={stopMonitor}
              className="flex-1 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 py-4 rounded-xl font-bold text-lg active:scale-95 transition-transform"
            >
              ⏹ 중지
            </button>
            <button
              onClick={checkSeats}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-700 px-5 py-4 rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              🔄
            </button>
          </>
        )}
      </div>

      {/* 결과 표시 */}
      {result && (
        <>
          {/* 카운트 표시 */}
          <div className="text-center mb-4">
            <div
              className={`inline-block rounded-2xl px-6 py-3 ${
                result.emptyCount > 0
                  ? "bg-green-900/30 border border-green-500/30"
                  : "bg-gray-900 border border-gray-700/30"
              }`}
            >
              {result.emptyCount > 0 ? (
                <span className="text-3xl font-black text-green-400">
                  {result.emptyCount}석 비어있음
                </span>
              ) : (
                <span className="text-3xl font-black text-gray-500">
                  만석
                </span>
              )}
              <span className="text-gray-600 text-sm ml-2">
                / {result.total}석
              </span>
            </div>
          </div>

          {/* 좌석 그리드 */}
          <SeatGrid seats={result.allTarget} newEmpty={newEmpty} />

          {/* 마지막 조회 시간 */}
          <div className="text-center text-gray-600 text-xs mt-3">
            마지막 조회:{" "}
            {new Date(result.timestamp).toLocaleTimeString("ko-KR")}
          </div>
        </>
      )}

      {/* 시작 전 안내 */}
      {!result && !isRunning && (
        <div className="text-center mt-12 text-gray-600">
          <div className="text-5xl mb-4">💺</div>
          <p className="text-lg font-medium mb-2">좌석 모니터링</p>
          <p className="text-sm">
            설정에서 쿠키를 입력한 후
            <br />
            모니터링을 시작하세요
          </p>
        </div>
      )}

      {/* 알림 히스토리 */}
      <AlertHistory logs={alertLogs} />
    </main>
  );
}
