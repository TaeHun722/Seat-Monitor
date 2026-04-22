"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Settings() {
  const router = useRouter();
  const [cookie, setCookie] = useState("");
  const [roomId, setRoomId] = useState("4");
  const [seats, setSeats] = useState("40,41,42,43,44,45");
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    setCookie(localStorage.getItem("sm_cookie") || "");
    setRoomId(localStorage.getItem("sm_roomId") || "4");
    setSeats(localStorage.getItem("sm_seats") || "40,41,42,43,44,45");
  }, []);

  const save = () => {
    localStorage.setItem("sm_cookie", cookie.trim());
    localStorage.setItem("sm_roomId", roomId.trim());
    localStorage.setItem("sm_seats", seats.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const testConnection = async () => {
    if (!cookie.trim()) {
      setTestResult("쿠키를 먼저 입력해주세요");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const config = {
        cookie: cookie.trim(),
        roomId: Number(roomId),
        targetSeats: seats.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (res.status === 401) {
        setTestResult("❌ 세션 만료. 새 쿠키를 입력하세요.");
      } else if (res.ok) {
        setTestResult(
          `✅ 연결 성공! ${data.total}석 중 ${data.emptyCount}석 비어있음`
        );
      } else {
        setTestResult(`❌ 오류: ${data.message || data.error}`);
      }
    } catch (e: any) {
      setTestResult(`❌ 네트워크 오류: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4 max-w-md mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/")}
          className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm"
        >
          ← 뒤로
        </button>
        <h1 className="text-xl font-bold">⚙️ 설정</h1>
      </div>

      <div className="space-y-5">
        {/* 쿠키 입력 */}
        <div className="bg-gray-900 rounded-xl p-4">
          <label className="block text-sm text-gray-400 mb-2 font-medium">
            🔑 JSESSIONID 쿠키 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cookie}
            onChange={(e) => setCookie(e.target.value)}
            placeholder="예: 4581E80F51860D402681E6A40646BBF8"
            rows={2}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm font-mono focus:border-blue-500 focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-600 mt-1">
            세션 만료 시 새로 입력해야 합니다 (보통 30분~2시간)
          </p>
        </div>

        {/* 열람실 ID */}
        <div className="bg-gray-900 rounded-xl p-4">
          <label className="block text-sm text-gray-400 mb-2 font-medium">
            🏢 열람실 ID
          </label>
          <input
            type="number"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* 좌석 번호 */}
        <div className="bg-gray-900 rounded-xl p-4">
          <label className="block text-sm text-gray-400 mb-2 font-medium">
            💺 모니터링 좌석 (쉼표 구분)
          </label>
          <input
            type="text"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            placeholder="40,41,42,43,44,45"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-600 mt-1">
            모니터링할 좌석 번호를 쉼표로 구분하여 입력
          </p>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-2">
          <button
            onClick={save}
            className={`flex-1 py-3 rounded-xl font-bold text-lg transition-all ${
              saved
                ? "bg-green-600"
                : "bg-blue-600 hover:bg-blue-500 active:scale-95"
            }`}
          >
            {saved ? "✅ 저장됨!" : "💾 저장"}
          </button>
          <button
            onClick={testConnection}
            disabled={testing}
            className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-xl font-bold text-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {testing ? "⏳ 테스트 중..." : "🔍 연결 테스트"}
          </button>
        </div>

        {/* 테스트 결과 */}
        {testResult && (
          <div
            className={`rounded-xl p-3 text-sm animate-slide-down ${
              testResult.startsWith("✅")
                ? "bg-green-900/30 border border-green-500/30 text-green-400"
                : "bg-red-900/30 border border-red-500/30 text-red-400"
            }`}
          >
            {testResult}
          </div>
        )}
      </div>

      {/* 쿠키 확인 방법 */}
      <div className="mt-6 bg-gray-900 rounded-xl p-4">
        <h2 className="font-bold mb-3 text-base">📖 쿠키 확인 방법</h2>
        <ol className="text-sm text-gray-400 space-y-2">
          <li className="flex gap-2">
            <span className="text-blue-400 font-bold shrink-0">1.</span>
            <span>
              PC 브라우저에서{" "}
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                wseat.yonsei.ac.kr
              </code>{" "}
              로그인
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400 font-bold shrink-0">2.</span>
            <span>
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                F12
              </code>{" "}
              → Application 탭 → Cookies
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400 font-bold shrink-0">3.</span>
            <span>JSESSIONID 값 복사</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400 font-bold shrink-0">4.</span>
            <span>위 입력란에 붙여넣기 후 저장</span>
          </li>
        </ol>

        <div className="mt-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-2.5 text-xs text-yellow-500">
          ⚠️ 팁: 쿠키가 자주 만료되면, wseat 사이트를 별도 탭에 켜두면 세션이
          더 오래 유지됩니다.
        </div>
      </div>
    </main>
  );
}
