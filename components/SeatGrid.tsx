"use client";

interface SeatInfo {
  name: string;
  occupied: boolean;
}

interface Props {
  seats: SeatInfo[];
  newEmpty: string[];
}

export default function SeatGrid({ seats, newEmpty }: Props) {
  const sorted = [...seats].sort((a, b) => Number(a.name) - Number(b.name));

  return (
    <div className="grid grid-cols-3 gap-3">
      {sorted.map((seat) => {
        const isNew = newEmpty.includes(seat.name);
        const isEmpty = !seat.occupied;

        let cardClass =
          "rounded-2xl p-4 text-center transition-all duration-300 relative overflow-hidden ";

        if (isEmpty && isNew) {
          cardClass +=
            "new-seat-card bg-gradient-to-br from-green-400 to-green-600 text-white border-2 border-green-300";
        } else if (isEmpty) {
          cardClass +=
            "bg-gradient-to-br from-green-700 to-green-900 text-green-100 border border-green-600/30";
        } else {
          cardClass +=
            "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 border border-gray-700/30";
        }

        return (
          <div key={seat.name} className={cardClass}>
            {/* 새 빈 좌석일 때 반짝이는 효과 */}
            {isNew && (
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
            )}

            <div className="relative z-10">
              <div className="text-3xl mb-1">
                {isEmpty ? (isNew ? "✨" : "🟢") : "🔴"}
              </div>
              <div className="text-xl font-black">{seat.name}번</div>
              <div
                className={`text-xs mt-1 font-medium ${
                  isEmpty
                    ? isNew
                      ? "text-white font-bold"
                      : "text-green-200"
                    : "text-gray-500"
                }`}
              >
                {isEmpty ? (isNew ? "새로 빔!" : "비어있음") : "사용 중"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
