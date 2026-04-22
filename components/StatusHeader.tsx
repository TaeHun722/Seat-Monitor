"use client";

interface Props {
  isRunning: boolean;
  loading: boolean;
  countdown: number;
  cookieValid: boolean;
  checkCount: number;
}

export default function StatusHeader({
  isRunning,
  loading,
  countdown,
  cookieValid,
  checkCount,
}: Props) {
  return (
    <div className="bg-gray-900 rounded-xl p-3 mb-4 flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            !isRunning
              ? "bg-gray-600"
              : loading
              ? "bg-yellow-400 animate-pulse"
              : "bg-green-400 animate-pulse"
          }`}
        />
        <span className="text-gray-300">
          {!isRunning
            ? "대기 중"
            : loading
            ? "조회 중..."
            : `다음 조회 ${countdown}초`}
        </span>
      </div>

      <div className="flex items-center gap-3 text-gray-500">
        <span>#{checkCount}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            cookieValid
              ? "bg-green-900/50 text-green-400"
              : "bg-red-900/50 text-red-400"
          }`}
        >
          {cookieValid ? "🔗 연결됨" : "🔴 미연결"}
        </span>
      </div>
    </div>
  );
}
