import { useEffect, useState } from "react";
import { userApi } from "../../api/userApi";

const gradeTiers = [
  {
    code: "NOVICE",
    label: "초보 변명러",
    minXp: 0,
    bg: "#ffffff",
    text: "#0b2a55",
    ring: true,
  },
  {
    code: "SURVIVOR",
    label: "위기 생존자",
    minXp: 200,
    bg: "#bedafd",
    text: "#0b2a55",
  },
  {
    code: "EXCUSE_EXPERT",
    label: "핑계 전문가",
    minXp: 500,
    bg: "#84bbf6",
    text: "#0b2a55",
  },
  {
    code: "SOCIAL_MASTER",
    label: "사회생활 마스터",
    minXp: 900,
    bg: "#4c98ee",
    text: "#0b2a55",
  },
  {
    code: "EXCUSE_GOD",
    label: "변명의 신",
    minXp: 1400,
    bg: "#157EFB",
    text: "#ffffff",
  },
];

function TrophyIcon({ className = "w-8 h-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 sm:w-7 sm:h-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 sm:w-7 sm:h-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function GradeNode({ tier, index, currentIndex, totalXp, nextTier }) {
  const isAchieved = index < currentIndex;
  const isCurrent = index === currentIndex;
  const isLocked = index > currentIndex;
  const nodeSizeClass = isCurrent
    ? "w-16 h-16 sm:w-20 sm:h-20"
    : "w-14 h-14 sm:w-16 sm:h-16";
  const nodeRingClass = isCurrent
    ? "ring-4 ring-brand-primary/25"
    : tier.ring && !isLocked
      ? "ring-1 ring-border-ring"
      : "";
  const nodeColor = {
    backgroundColor: isLocked ? "#eef1f5" : tier.bg,
    color: isLocked ? "#a9b4c4" : tier.text,
  };

  const labelColorClass = isCurrent
    ? "text-brand-primary"
    : isLocked
      ? "text-[#a9b4c4]"
      : "text-navy-950";
  const caption = isAchieved
    ? "달성 완료"
    : isCurrent
      ? nextTier
        ? `다음 등급까지 ${Math.max(nextTier.minXp - totalXp, 0)} XP`
        : "최고 등급"
      : `앞으로 ${Math.max(tier.minXp - totalXp, 0)} XP`;

  return (
    <li className="relative z-10 flex flex-row sm:flex-1 sm:flex-col items-center gap-4 sm:gap-0">
      <div className="flex h-16 sm:h-20 items-center justify-center sm:w-full shrink-0">
        <div
          className={[
            "relative shrink-0 rounded-full flex items-center justify-center transition-all mx-auto",
            nodeSizeClass,
            nodeRingClass,
          ].join(" ")}
          style={nodeColor}
          aria-hidden="true"
        >
          {isAchieved ? (
            <CheckIcon />
          ) : isLocked ? (
            <LockIcon />
          ) : (
            <TrophyIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          )}
        </div>
      </div>

      <div className="sm:mt-3 sm:text-center">
        <p className={`text-sm font-bold ${labelColorClass}`}>{tier.label}</p>
        <p className="mt-0.5 text-xs font-normal text-navy-300">{caption}</p>
      </div>
    </li>
  );
}

export default function RankPage() {
  const [rank, setRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRank() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await userApi.getMyRank();
        if (isMounted) setRank(data);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "등급 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRank();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentIndex = (() => {
    if (!rank?.grade) return 0;
    const index = gradeTiers.findIndex((tier) => tier.code === rank.grade);
    return index >= 0 ? index : 0;
  })();

  const currentTier = gradeTiers[currentIndex];
  const nextTier = gradeTiers[currentIndex + 1] ?? null;
  const totalXp = rank?.totalXp ?? 0;
  const excuseCount = rank?.excuseCount ?? 0;
  const xpToNext = rank?.xpToNext ?? (nextTier ? Math.max(nextTier.minXp - totalXp, 0) : 0);
  const progressMax = nextTier ? nextTier.minXp - currentTier.minXp : 1;
  const progressValue = nextTier ? Math.max(totalXp - currentTier.minXp, 0) : progressMax;
  const progressPercent = nextTier ? Math.min(Math.round((progressValue / progressMax) * 100), 100) : 100;
  const isMaxGrade = !nextTier || rank?.nextGrade === null;
  const pathProgressRatio = currentIndex / (gradeTiers.length - 1);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 bg-white">
      <h1 className="text-2xl font-bold text-navy-950">내 등급</h1>

      {errorMessage && (
        <p role="alert" className="mt-4 text-sm font-medium text-danger-text">
          {errorMessage}
        </p>
      )}

      <section aria-label="등급 현황" className="mt-6 border border-border-soft rounded-lg">
        <div className="p-6 sm:p-8">
          {isLoading ? (
            <p className="text-sm font-medium text-navy-500">등급 정보를 불러오는 중...</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={[
                      "w-16 h-16 rounded-full flex items-center justify-center shrink-0",
                      currentTier.ring ? "ring-1 ring-border-ring" : "",
                    ].join(" ")}
                    style={{ backgroundColor: currentTier.bg, color: currentTier.text }}
                    aria-hidden="true"
                  >
                    <TrophyIcon />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-brand-primary">{rank?.gradeLabel ?? currentTier.label}</p>
                    <p className="mt-1 text-sm font-normal text-navy-500">
                      누적 경험치 <strong className="font-bold text-navy-900">{totalXp} XP</strong>
                    </p>
                  </div>
                </div>
                <p className="text-sm font-normal text-navy-500 shrink-0">
                  지금까지 만든 변명 <strong className="font-bold text-navy-900">{excuseCount}개</strong>
                </p>
              </div>

              {isMaxGrade ? (
                <p className="mt-4 text-sm font-bold text-brand-primary">
                  🏆 최고 등급 달성 — 변명의 신
                </p>
              ) : (
                <div className="mt-5">
                  <div
                    className="h-2.5 bg-border-soft rounded-md overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progressValue}
                    aria-valuemin={0}
                    aria-valuemax={progressMax}
                    aria-label="다음 등급까지 진행률"
                  >
                    <div className="h-full bg-brand-primary" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <p className="mt-2 text-sm font-normal text-navy-500">
                    <strong className="font-bold text-brand-primary">{xpToNext} XP</strong>만 더 모으면{" "}
                    <strong className="font-bold text-navy-900">{rank?.nextGradeLabel ?? nextTier?.label}</strong>예요.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 sm:p-8 border-t border-border-soft">
          <h2 className="text-base font-bold text-navy-950">등급 체계</h2>
          <div className="relative mt-6">
            <span
              className="hidden sm:block absolute left-[10%] right-[10%] top-10 h-1 rounded-full bg-border-soft"
              aria-hidden="true"
            />
            <span
              className="hidden sm:block absolute left-[10%] top-10 h-1 rounded-full bg-brand-primary"
              style={{ width: `calc(80% * ${pathProgressRatio})` }}
              aria-hidden="true"
            />
            <ol className="relative flex flex-col sm:flex-row gap-5 sm:gap-0">
              {gradeTiers.map((tier, index) => (
                <GradeNode
                  key={tier.code}
                  tier={tier}
                  index={index}
                  currentIndex={currentIndex}
                  totalXp={totalXp}
                  nextTier={nextTier}
                />
              ))}
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
