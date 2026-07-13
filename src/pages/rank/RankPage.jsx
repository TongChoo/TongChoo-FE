import { useEffect, useMemo, useState } from "react";
import { userApi } from "../../api/userApi";

const gradeTiers = [
  {
    code: "NOVICE",
    label: "초보 변명러",
    minXp: 0,
    className: "bg-white ring-1 ring-border-ring text-navy-950 shadow-[0_4px_12px_rgba(11,42,85,0.035)]",
  },
  {
    code: "SURVIVOR",
    label: "위기 생존자",
    minXp: 200,
    className: "bg-[#bedafd] text-navy-950 shadow-[0_4px_12px_rgba(21,126,251,0.07)]",
  },
  {
    code: "EXCUSE_EXPERT",
    label: "핑계 전문가",
    minXp: 500,
    className: "bg-[#84bbf6] text-navy-950 shadow-[0_5px_13px_rgba(21,126,251,0.09)]",
  },
  {
    code: "SOCIAL_MASTER",
    label: "사회생활 마스터",
    minXp: 900,
    className: "bg-[#4c98ee] text-navy-950 shadow-[0_5px_14px_rgba(21,126,251,0.11)]",
  },
  {
    code: "EXCUSE_GOD",
    label: "변명의 신",
    minXp: 1400,
    className: "bg-brand-primary text-white shadow-[0_6px_16px_rgba(21,126,251,0.14)]",
  },
];

function TrophyIcon() {
  return (
    <svg
      className="w-8 h-8"
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

function CheckBadge() {
  return (
    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-suspicion-low-text text-white flex items-center justify-center ring-2 ring-white" aria-label="달성 완료">
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
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

  const currentIndex = useMemo(() => {
    if (!rank?.grade) return 0;
    const index = gradeTiers.findIndex((tier) => tier.code === rank.grade);
    return index >= 0 ? index : 0;
  }, [rank?.grade]);

  const currentTier = gradeTiers[currentIndex];
  const nextTier = gradeTiers[currentIndex + 1] ?? null;
  const totalXp = rank?.totalXp ?? 0;
  const excuseCount = rank?.excuseCount ?? 0;
  const xpToNext = rank?.xpToNext ?? (nextTier ? Math.max(nextTier.minXp - totalXp, 0) : 0);
  const progressMax = nextTier ? nextTier.minXp - currentTier.minXp : 1;
  const progressValue = nextTier ? Math.max(totalXp - currentTier.minXp, 0) : progressMax;
  const progressPercent = nextTier ? Math.min(Math.round((progressValue / progressMax) * 100), 100) : 100;
  const isMaxGrade = !nextTier || rank?.nextGrade === null;

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
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${currentTier.className}`} aria-hidden="true">
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
                    <strong className="font-bold text-navy-900">{rank?.nextGradeLabel ?? nextTier.label}</strong>예요.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 sm:p-8 border-t border-border-soft">
          <h2 className="text-base font-bold text-navy-950">등급 체계</h2>
          <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {gradeTiers.map((tier, index) => {
              const isCurrent = index === currentIndex;
              const isAchieved = index < currentIndex;
              const remainingXp = Math.max(tier.minXp - totalXp, 0);

              return (
                <li
                  key={tier.code}
                  className={[
                    "relative rounded-2xl px-5 py-4 text-center",
                    tier.className,
                    isCurrent ? "ring-2 ring-brand-primary ring-offset-2" : "",
                  ].join(" ")}
                >
                  {isAchieved && <CheckBadge />}
                  <p className="text-base font-bold">{tier.label}</p>
                  <p className={tier.code === "EXCUSE_GOD" ? "mt-1 text-xs font-normal text-white/80" : "mt-1 text-xs font-normal text-navy-500"}>
                    {isAchieved ? `${tier.minXp} XP~` : remainingXp > 0 ? `앞으로 ${remainingXp} XP` : `${tier.minXp} XP~`}
                  </p>
                  {isCurrent && (
                    <span className="mt-2 inline-block text-[10px] font-bold text-brand-primary">
                      현재 등급
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </main>
  );
}
