"use client";

import { useEffect, useState } from "react";

interface Props {
  seats: string[];
  onDismiss: () => void;
}

export default function FullScreenAlert({ seats, onDismiss }: Props) {
  const [visible, setVisible] = useState(true);
  const [flashPhase, setFlashPhase] = useState(true);

  useEffect(() => {
    const flashTimer = setInterval(() => {
      setFlashPhase((prev) => !prev);
    }, 400);

    // 15초 후 자동 닫힘
    const autoClose = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 15000);

    return () => {
      clearInterval(flashTimer);
      clearTimeout(autoClose);
    };
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{
        backgroundColor: flashPhase
          ? "rgba(22, 163, 74, 0.95)"
          : "rgba(5, 46, 22, 0.95)",
        transition: "background-color 0.3s",
      }}
      onClick={() => {
        setVisible(false);
        onDismiss();
      }}
    >
      {/* 큰 아이콘 */}
      <div className="text-8xl mb-4 animate-bounce">🚨</div>

      {/* 메인 텍스트 */}
      <div className="text-white text-center">
        <h1
          className="text-4xl font-black mb-3 animate-scale-pulse"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.5)" }}
        >
          빈 좌석 발견!
        </h1>

        {/* 좌석 번호들 */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {seats
            .sort((a, b) => Number(a) - Number(b))
            .map((seat) => (
              <div
                key={seat}
                className="bg-white text-green-800 text-3xl font-black rounded-2xl px-6 py-4 animate-shake"
                style={{
                  boxShadow: "0 0 30px rgba(255,255,255,0.5)",
                }}
              >
                {seat}번
              </div>
            ))}
        </div>

        <p className="text-xl font-bold opacity-90 animate-pulse">
          지금 바로 예약하세요!
        </p>

        {/* 시각 정보 */}
        <p className="text-sm opacity-60 mt-4">
          {new Date().toLocaleTimeString("ko-KR")} 감지
        </p>
      </div>

      {/* 닫기 안내 */}
      <div className="absolute bottom-8 text-white/50 text-sm">
        화면을 터치하면 닫힙니다
      </div>
    </div>
  );
}
