"use client";

interface AlertLog {
  time: string;
  seats: string[];
}

interface Props {
  logs: AlertLog[];
}

export default function AlertHistory({ logs }: Props) {
  if (logs.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm text-gray-500 mb-2 font-medium">📋 감지 기록</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {logs
          .slice()
          .reverse()
          .map((log, i) => (
            <div
              key={i}
              className="bg-gray-900 rounded-lg p-2.5 flex justify-between items-center text-sm"
            >
              <span className="text-gray-400">{log.time}</span>
              <span className="text-green-400 font-bold">
                {log.seats.sort((a, b) => Number(a) - Number(b)).join(", ")}번
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
