import { Clock, ShieldAlert } from "lucide-react";
import { WebcamProctor } from "../webcam-proctor";
import { CalculatorWidget } from "../calculator";

type ExamHeaderProps = {
  title: string;
  isStrict: boolean;
  timeLeft: number | null;
  warnings: number;
  currentQuestion: number;
  totalQuestions: number;
  onWarning: (msg: string) => void;
  onModelLoaded: () => void;
  onCameraDenied: (err?: string) => void;
};

export function ExamHeader({
  title,
  isStrict,
  timeLeft,
  warnings,
  currentQuestion,
  totalQuestions,
  onWarning,
  onModelLoaded,
  onCameraDenied,
}: ExamHeaderProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isLowTime      = timeLeft !== null && timeLeft < 300;
  const isCriticalTime = timeLeft !== null && timeLeft < 60;

  return (
    <div className="sticky top-0 z-40 bg-[#071117] border-b border-[#2C333A] mb-6 shadow-[var(--shadow-md)]">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">

        {/* Left: Title & Progress */}
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-white hidden md:block text-sm">{title}</h1>
          <div className="bg-[#0B1824] border border-[#2C333A] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7FC5DD]">
            Q {currentQuestion} / {totalQuestions}
          </div>
        </div>

        {/* Center: Timer */}
        {timeLeft !== null && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <div
              className={`flex items-center gap-2 px-4 py-1.5 font-mono text-lg font-bold transition-colors ${
                isCriticalTime
                  ? "bg-[#3D1A1A] text-[#E06060] border border-[var(--error)] animate-pulse"
                  : isLowTime
                    ? "bg-[#3D2A00] text-[var(--warning)] border border-[#6A4E20]"
                    : "bg-[#0B1824] text-white border border-[#2C333A]"
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {/* Right: Tools & Proctoring */}
        <div className="flex items-center gap-3">
          <CalculatorWidget />

          {isStrict && (
            <div className="flex items-center gap-2.5 bg-[#0B1824] border border-[#2C333A] pl-3 pr-1 py-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7FC5DD]">
                <ShieldAlert className={`w-4 h-4 ${warnings > 0 ? "text-[#E06060]" : "text-[#7FC5DD]"}`} />
                <span className="hidden sm:inline">Warnings:</span>
                <span className={warnings > 0 ? "text-[#E06060]" : ""}>{warnings}/3</span>
              </div>
              <div className="w-9 h-9 overflow-hidden border border-[#2C333A] shrink-0 [&>div]:scale-[0.25] [&>div]:origin-top-left [&>div]:-ml-[60px] [&>div]:-mt-[40px]">
                <WebcamProctor
                  onWarning={onWarning}
                  onModelLoaded={onModelLoaded}
                  onCameraDenied={onCameraDenied}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar — Darion Blue */}
      <div className="h-0.5 w-full bg-[#0B1824]">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
        />
      </div>
    </div>
  );
}
