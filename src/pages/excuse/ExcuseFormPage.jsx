import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { excuseApi } from "../../api/excuseApi";
import { metaApi } from "../../api/metaApi";
import { useExcuseStore } from "../../store/useExcuseStore";

const fallbackTargets = [
  { code: "TEACHER", label: "선생님" },
  { code: "PARENT", label: "부모님" },
  { code: "FRIEND", label: "친구" },
  { code: "LOVER", label: "연인" },
  { code: "TEAM_LEAD", label: "팀장" },
  { code: "TEAM_MEMBER", label: "팀원" },
  { code: "CUSTOM", label: "직접 입력" },
];

const fallbackTones = [
  { code: "MILD", label: "순한맛" },
  { code: "SLICK", label: "능글맞은맛" },
  { code: "DESPERATE", label: "목숨 걸기" },
  { code: "BULLSHIT", label: "개소리 모드" },
];

function OptionDropdown({ placeholder, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.code === value);

  return (
    <div className="relative">
      <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 rounded-md border border-border-input bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-primary transition"
        >
          <span className={selectedOption ? "text-navy-900" : "text-[#a3b2c7]"}>
            {selectedOption?.label ?? placeholder}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-navy-300 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {isOpen && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-20 mt-1.5 bg-white border border-border-soft rounded-md py-1"
          >
            {options.map((option) => {
              const isSelected = option.code === value;

              return (
                <li key={option.code} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.code);
                      setIsOpen(false);
                    }}
                    className={
                      isSelected
                        ? "w-full text-left px-3.5 py-2.5 text-sm font-medium text-white bg-brand-primary cursor-pointer"
                        : "w-full text-left px-3.5 py-2.5 text-sm font-normal text-navy-900 hover:bg-surface-soft cursor-pointer"
                    }
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
  );
}

export default function ExcuseFormPage() {
  const [situation, setSituation] = useState("");
  const [target, setTarget] = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  const [tone, setTone] = useState("");
  const [targets, setTargets] = useState(fallbackTargets);
  const [tones, setTones] = useState(fallbackTones);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [metaNotice, setMetaNotice] = useState("");
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setLatestExcuse = useExcuseStore((state) => state.setLatestExcuse);

  useEffect(() => {
    let isMounted = true;

    async function loadMeta() {
      try {
        setIsLoadingMeta(true);
        const meta = await metaApi.getMeta();

        if (!isMounted) return;

        setTargets(meta.targets?.length ? meta.targets : fallbackTargets);
        setTones(meta.tones?.length ? meta.tones : fallbackTones);
        setMetaNotice("");
      } catch {
        if (!isMounted) return;

        // /api/meta는 선택지 목록을 가져오는 API다.
        // 이 API가 잠깐 실패해도 사용자가 화면을 아예 못 쓰면 안 되므로,
        // 프론트에 박아둔 기본 선택지를 대신 보여준다.
        setTargets(fallbackTargets);
        setTones(fallbackTones);
        setMetaNotice("선택지 정보를 불러오지 못해서 기본 옵션으로 표시 중이에요.");
      } finally {
        if (isMounted) setIsLoadingMeta(false);
      }
    }

    loadMeta();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedTargetDescription = targetDescription.trim();

    if (!situation.trim() || !target || !tone || (target === "CUSTOM" && !normalizedTargetDescription)) {
      setErrorMessage("위기 상황과 상대, 강도를 모두 입력해주세요.");
      setFieldErrors({
        situation: !situation.trim() ? "위기 상황을 입력해주세요." : "",
        target: !target ? "변명 상대를 선택해주세요." : "",
        targetDescription:
          target === "CUSTOM" && !normalizedTargetDescription
            ? "관계를 직접 입력해주세요."
            : "",
        tone: !tone ? "변명 강도를 선택해주세요." : "",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setFieldErrors({});

      const excuse = await excuseApi.createExcuse({
        situation: situation.trim(),
        target,
        targetDescription: target === "CUSTOM" ? normalizedTargetDescription : undefined,
        tone,
      });

      // 생성 결과는 바로 다음 화면에서 필요하다.
      // 그래서 zustand + sessionStorage에 저장해 새로고침에도 한 번은 복구할 수 있게 한다.
      setLatestExcuse({
        ...excuse,
        situation: situation.trim(),
      });
      navigate("/excuses/result");
    } catch (error) {
      if (error.data && typeof error.data === "object") {
        setFieldErrors(error.data);
      } else {
        setErrorMessage(error.message || "변명 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 bg-white">
      <h1 className="text-3xl font-bold text-navy-950">지금 무슨 위기인가요?</h1>
      <p className="mt-2 text-base font-normal text-navy-500">
        위기 상황을 자세히 적어주시면, AI가 상대와 강도에 맞춰 변명을 만들고 성공 확률까지 계산해드려요.
      </p>
      {metaNotice && (
        <p role="status" className="mt-4 text-sm font-medium text-brand-primary">
          {metaNotice}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8">
        {/* 2단 레이아웃: 위기 상황(좌, 넓게) / 상대·강도 선택 + 제출 버튼(우, 좁게)을 나란히 둬서
            제출 버튼이 텍스트 입력 아래로 한참 밀려 내려가지 않고 첫 화면에서 바로 보이게 한다.
            좌측 카드에는 브랜드 컬러 top accent(border-t-4)를 얇게 둘러 화이트 배경 사이에 포인트를 준다. */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
          <section className="bg-white border border-border-soft border-t-4 border-t-brand-primary rounded-2xl p-8 sm:p-10">
            <label htmlFor="situation" className="block text-xl font-bold text-navy-950">
              위기 상황을 알려주세요
            </label>
            <p className="mt-1 text-sm font-normal text-navy-500">
              최대한 자세히 적을수록 AI가 더 그럴듯한 변명을 만들어요
            </p>

            <textarea
              id="situation"
              name="situation"
              required
              maxLength={500}
              rows={12}
              placeholder="예: 팀 프로젝트 회의에 늦잠 자서 못 갔다"
              value={situation}
              onChange={(event) => {
                setSituation(event.target.value);
                setErrorMessage("");
                setFieldErrors((prev) => ({ ...prev, situation: "" }));
              }}
              className="mt-5 w-full rounded-md border border-border-input bg-white px-4 py-3.5 text-base text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition resize-none"
            />
            <span className="mt-1.5 block text-right text-xs font-normal text-navy-500">
              {situation.length}/500
            </span>
            {fieldErrors.situation && (
              <p role="alert" className="mt-1.5 text-sm font-medium text-danger-text">
                {fieldErrors.situation}
              </p>
            )}
          </section>

          <section className="bg-white border border-border-soft rounded-2xl">
            <div className="p-8 sm:p-9">
              <h2 className="text-xl font-bold text-navy-950">누구에게, 얼마나 뻔뻔하게?</h2>
              <p className="mt-1 text-sm font-normal text-navy-300">
                예: 팀장에게는 능글맞은맛으로
              </p>
              <div className="mt-6 flex flex-col gap-5">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-navy-500">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-brand-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="8" r="3.5" />
                      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
                    </svg>
                    변명 상대
                  </span>
                  <div className="mt-1.5">
                    <OptionDropdown
                      placeholder="선택하세요"
                      value={target}
                      options={targets}
                      onChange={(value) => {
                        setTarget(value);
                        if (value !== "CUSTOM") setTargetDescription("");
                        setErrorMessage("");
                        setFieldErrors((prev) => ({
                          ...prev,
                          target: "",
                          targetDescription: "",
                        }));
                      }}
                    />
                  </div>
                  {fieldErrors.target && (
                    <p role="alert" className="mt-1.5 text-sm font-medium text-danger-text">
                      {fieldErrors.target}
                    </p>
                  )}
                  {target === "CUSTOM" && (
                    <div className="mt-3">
                      <label htmlFor="target-description" className="block text-xs font-medium text-navy-500">
                        관계 직접 입력
                      </label>
                      <input
                        id="target-description"
                        name="targetDescription"
                        type="text"
                        maxLength={100}
                        placeholder="예: 회사 부장님, 지도교수님, 같은 팀의 친한 선배"
                        value={targetDescription}
                        onChange={(event) => {
                          setTargetDescription(event.target.value);
                          setErrorMessage("");
                          setFieldErrors((prev) => ({ ...prev, targetDescription: "" }));
                        }}
                        className="mt-1.5 w-full rounded-md border border-border-input bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition"
                      />
                      <span className="mt-1 block text-right text-xs font-normal text-navy-500">
                        {targetDescription.length}/100
                      </span>
                      {fieldErrors.targetDescription && (
                        <p role="alert" className="mt-1 text-sm font-medium text-danger-text">
                          {fieldErrors.targetDescription}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-navy-500">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-brand-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M8.5 14.5a2.5 2.5 0 0 0 2.5-2.5c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                    변명 강도
                  </span>
                  <div className="mt-1.5">
                    <OptionDropdown
                      placeholder="선택하세요"
                      value={tone}
                      options={tones}
                      onChange={(value) => {
                        setTone(value);
                        setErrorMessage("");
                        setFieldErrors((prev) => ({ ...prev, tone: "" }));
                      }}
                    />
                  </div>
                  {fieldErrors.tone && (
                    <p role="alert" className="mt-1.5 text-sm font-medium text-danger-text">
                      {fieldErrors.tone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-8 sm:px-9 py-7 border-t border-border-soft">
              <button
                type="submit"
                disabled={isLoadingMeta || isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {isSubmitting ? "변명 짜는 중..." : isLoadingMeta ? "선택지 불러오는 중..." : "변명 만들기"}
              </button>

              {errorMessage && (
                <p role="alert" className="mt-3 text-sm font-medium text-danger-text text-center">
                  {errorMessage}
                </p>
              )}
            </div>
          </section>
        </div>
      </form>
    </main>
  );
}
