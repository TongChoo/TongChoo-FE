import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { excuseApi } from "../../api/excuseApi";
import CopyTextButton from "../../components/excuse/CopyTextButton";
import ReplyThreadSection from "../../components/excuse/ReplyThreadSection";
import { useExcuseStore } from "../../store/useExcuseStore";
import { formatAftermathWhen } from "../../utils/aftermath";

const targetLabels = {
    TEACHER: "선생님",
    PARENT: "부모님",
    FRIEND: "친구",
    LOVER: "연인",
    TEAM_LEAD: "팀장",
    TEAM_MEMBER: "팀원",
    CUSTOM: "기타",
};

const toneLabels = {
    MILD: "순한맛",
    SLICK: "능글맞은맛",
    DESPERATE: "목숨 걸기",
    BULLSHIT: "개소리 모드",
};

const suspicionClassNames = {
    LOW: "text-suspicion-low-text",
    MEDIUM: "text-suspicion-medium-text",
    HIGH: "text-suspicion-high-text",
};

function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function MetricCard({ label, children }) {
    return (
        <div className="py-3 bg-surface-soft rounded-md text-center">
            <dt className="text-[11px] font-normal text-navy-500">{label}</dt>
            <dd className="mt-0.5 text-lg font-bold text-brand-primary">
                {children}
            </dd>
        </div>
    );
}

function DotList({
    items,
    color = "bg-brand-primary",
    textColor = "text-navy-700",
    emptyText,
}) {
    if (!items?.length) {
        return <p className="text-sm font-normal text-navy-500">{emptyText}</p>;
    }

    return (
        <ul className="space-y-2">
            {items.map((item) => (
                <li
                    key={item}
                    className={`flex items-start gap-2 text-sm font-normal ${textColor}`}
                >
                    <span
                        className={`mt-1.5 w-1.5 h-1.5 ${color} rounded-full shrink-0`}
                    />
                    {item}
                </li>
            ))}
        </ul>
    );
}

function AftermathTimeline({ aftermath }) {
    if (!aftermath?.length) {
        return (
            <p className="mt-4 text-sm font-normal text-navy-500">
                아직 예측된 후폭풍이 없어요.
            </p>
        );
    }

    return (
        <table className="mt-4 w-full">
            <caption className="sr-only">시점별 예상 질문과 붕괴 확률</caption>
            <thead>
                <tr className="text-left text-[11px] font-normal text-navy-300">
                    <th scope="col" className="pb-2 font-normal">
                        시점
                    </th>
                    <th scope="col" className="pb-2 font-normal">
                        예상 질문
                    </th>
                    <th scope="col" className="pb-2 font-normal text-right">
                        붕괴 확률
                    </th>
                </tr>
            </thead>
            <tbody>
                {aftermath.map((item) => (
                    <tr
                        key={`${item.when}-${item.question}`}
                    >
                        <td className="py-3 pr-3 align-top text-xs font-bold text-brand-primary whitespace-nowrap">
                            {formatAftermathWhen(item.when, item.dayOffset)}
                        </td>
                        <td className="py-3 pr-3 align-top text-sm font-normal text-navy-900">
                            "{item.question}"
                        </td>
                        <td className="py-3 align-top">
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-xs font-bold text-brand-primary">
                                    {item.collapseRate}%
                                </span>
                            </div>
                            <div
                                className="mt-1.5 h-2 w-24 ml-auto bg-border-soft rounded-md overflow-hidden"
                                role="progressbar"
                                aria-valuenow={item.collapseRate}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className="h-full bg-brand-primary"
                                    style={{ width: `${item.collapseRate}%` }}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default function ExcuseDetailPage() {
    const { excuseId } = useParams();
    const setLatestExcuse = useExcuseStore((state) => state.setLatestExcuse);
    const [excuse, setExcuse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notice, setNotice] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadExcuse() {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const data = await excuseApi.getExcuse(excuseId);
                if (isMounted) setExcuse(data);
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(
                        error.message || "변명 상세를 불러오지 못했습니다."
                    );
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadExcuse();

        return () => {
            isMounted = false;
        };
    }, [excuseId]);

    if (isLoading) {
        return (
            <main className="max-w-7xl mx-auto px-6 py-12 bg-white">
                <p className="text-sm font-medium text-navy-500">
                    변명 상세를 불러오는 중...
                </p>
            </main>
        );
    }

    if (errorMessage || !excuse) {
        return (
            <main className="max-w-7xl mx-auto px-6 py-12 bg-white">
                <Link
                    to="/excuses"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-brand-primary transition-colors"
                >
                    <span aria-hidden="true">&larr;</span> 내 변명 기록
                </Link>
                <p
                    role="alert"
                    className="mt-6 text-sm font-medium text-danger-text"
                >
                    {errorMessage || "변명 상세를 찾을 수 없습니다."}
                </p>
            </main>
        );
    }

    const analysis = excuse.analysis ?? {};
    const suspicionLevel = analysis.suspicionLevel ?? "MEDIUM";
    const targetLabel = excuse.target === "CUSTOM"
        ? excuse.targetDescription || targetLabels.CUSTOM
        : targetLabels[excuse.target] ?? excuse.target;
    const toneLabel = toneLabels[excuse.tone] ?? excuse.tone;
    const roundNumber = excuse.roundNumber ?? 1;

    return (
        <main className="max-w-7xl mx-auto px-6 py-12 bg-white">
            <Link
                to="/excuses"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-brand-primary transition-colors"
            >
                <span aria-hidden="true">&larr;</span> 내 변명 기록
            </Link>
            <h1 className="mt-3 text-2xl font-bold text-navy-950">변명 상세</h1>

            {notice && (
                <p
                    role="status"
                    className="mt-4 text-sm font-medium text-brand-primary"
                >
                    {notice}
                </p>
            )}

            <section
                aria-label="생성된 변명"
                className="mt-6 bg-surface-soft rounded-lg p-6 sm:p-8"
            >
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs font-normal text-navy-300">
                        <span>상황: {excuse.situation}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[11px] font-medium text-brand-primary">
                            {targetLabel} · {toneLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                            생성 시각 {formatDateTime(excuse.createdAt)}
                        </span>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-brand-primary whitespace-nowrap">
                        {roundNumber} / 5 라운드
                    </span>
                </div>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <blockquote className="text-xl sm:text-2xl font-medium text-navy-950 leading-snug border-l-4 border-brand-primary pl-4 sm:pl-5">
                        "{excuse.excuse}"
                    </blockquote>
                    <CopyTextButton
                        text={excuse.excuse}
                        className="shrink-0 self-start px-4 py-2 text-sm font-bold text-brand-primary border border-border-input rounded-md hover:bg-brand-primary-soft transition-colors"
                    />
                </div>
            </section>

            <section className="mt-6 px-0 py-6 sm:py-8" aria-labelledby="analysis-report-title">
                    <div>
                        <h2 id="analysis-report-title" className="text-base font-bold text-navy-950">
                            변명 분석 리포트
                        </h2>

                        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                            <MetricCard label="성공(생존) 확률">
                                {analysis.successRate ?? 0}%
                            </MetricCard>
                            <MetricCard label="현실성">
                                {analysis.realism ?? 0} / 5
                            </MetricCard>
                            <MetricCard label="설득력">
                                {analysis.persuasion ?? 0} / 5
                            </MetricCard>
                            <div className="py-3 bg-surface-soft rounded-md">
                                <dt className="text-[11px] font-normal text-navy-500">
                                    의심 위험도
                                </dt>
                                <dd className="mt-0.5">
                                    <span
                                        className={`text-sm font-bold ${
                                            suspicionClassNames[
                                                suspicionLevel
                                            ] ?? suspicionClassNames.MEDIUM
                                        }`}
                                    >
                                        {suspicionLevel}
                                    </span>
                                </dd>
                            </div>
                        </dl>

                        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                            <div>
                                <h3 className="text-sm font-bold text-navy-700">
                                    위험 요소
                                </h3>
                                <div className="mt-2">
                                    <DotList
                                        items={analysis.riskFactors}
                                        color="bg-suspicion-high-text"
                                        textColor="text-navy-500"
                                        emptyText="특별히 감지된 위험 요소가 없어요."
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-navy-700">
                                    기억해야 할 설정
                                </h3>
                                <div className="mt-2">
                                    <DotList
                                        items={excuse.remember}
                                        emptyText="아직 기억할 설정이 없어요."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-base font-bold text-navy-950">
                            후폭풍 타임라인
                        </h2>
                        <AftermathTimeline aftermath={excuse.aftermath} />
                    </div>
            </section>

            <ReplyThreadSection
                key={excuse.id}
                excuse={excuse}
                onReplySuccess={(replyResult) => {
                    setExcuse(replyResult);
                    setLatestExcuse(replyResult);
                    setNotice("상대방 답장에 이어지는 다음 변명을 준비했어요.");
                }}
                onSelectionSuccess={(selectionResult) => {
                    setExcuse(selectionResult);
                    setLatestExcuse(selectionResult);
                    setNotice("선택한 답장을 저장했어요.");
                }}
            />
        </main>
    );
}
