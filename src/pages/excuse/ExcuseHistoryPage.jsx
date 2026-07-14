import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { excuseApi } from "../../api/excuseApi";
import Dropdown from "../../components/common/Dropdown";

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

const sortOptions = [
    { code: "latest", label: "최신순" },
    { code: "aftermath", label: "후폭풍 임박순" },
];

function formatTargetTone(excuse) {
    const target =
        excuse.target === "CUSTOM"
            ? excuse.targetDescription || targetLabels.CUSTOM
            : targetLabels[excuse.target] ?? excuse.target;

    return `${target} · ${toneLabels[excuse.tone] ?? excuse.tone}`;
}

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

function SkeletonRow({ isLast }) {
    return (
        <tr
            className={[
                "animate-pulse",
                isLast ? "" : "border-b border-border-soft",
            ].join(" ")}
        >
            <td className="px-6 py-6">
                <div className="h-4 w-3/4 bg-border-soft rounded-md" />
                <div className="mt-2 h-3 w-1/3 bg-border-soft rounded-md" />
            </td>
            <td className="px-4 py-6">
                <div className="h-4 w-24 bg-border-soft rounded-md" />
            </td>
            <td className="px-4 py-6">
                <div className="h-4 w-10 bg-border-soft rounded-md" />
            </td>
            <td className="px-4 py-6">
                <div className="h-4 w-12 bg-border-soft rounded-md" />
            </td>
            <td className="px-4 py-6">
                <div className="h-4 w-28 bg-border-soft rounded-md" />
            </td>
            <td className="px-6 py-6 text-right">
                <div className="ml-auto h-5 w-5 bg-border-soft rounded-md" />
            </td>
        </tr>
    );
}

function SkeletonCard() {
    return (
        <li className="border border-border-soft rounded-lg p-5 animate-pulse">
            <div className="h-4 w-4/5 bg-border-soft rounded-md" />
            <div className="mt-3 flex flex-wrap gap-3">
                <div className="h-3 w-20 bg-border-soft rounded-md" />
                <div className="h-3 w-10 bg-border-soft rounded-md" />
                <div className="h-3 w-12 bg-border-soft rounded-md" />
            </div>
            <div className="mt-3 h-3 w-28 bg-border-soft rounded-md" />
        </li>
    );
}

function AftermathBadge({ days }) {
    if (days === null || days === undefined) {
        return (
            <span className="text-sm font-normal text-navy-300">&mdash;</span>
        );
    }

    const isSoon = days <= 1;
    const label = days === 0 ? "D-day" : `D-${days}`;

    return (
        <span
            className={[
                "text-sm font-bold whitespace-nowrap",
                isSoon ? "text-suspicion-high-text" : "text-brand-primary",
            ].join(" ")}
        >
            {label}
        </span>
    );
}

export default function ExcuseHistoryPage() {
    const navigate = useNavigate();
    const [excusePage, setExcusePage] = useState({
        content: [],
        pageNumber: 0,
        totalPages: 1,
        totalElements: 0,
    });
    const [page, setPage] = useState(0);
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("latest");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        async function loadExcuses() {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const data = await excuseApi.getMyExcuses({ page, size: 10 });

                if (!isMounted) return;
                setExcusePage({
                    content: data.content ?? [],
                    pageNumber: data.pageNumber ?? page,
                    totalElements: data.totalElements ?? 0,
                    totalPages: data.totalPages ?? 1,
                });
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(
                        error.message || "변명 기록을 불러오지 못했습니다."
                    );
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadExcuses();

        return () => {
            isMounted = false;
        };
    }, [page]);

    const visibleExcuses = useMemo(() => {
        const filtered = excusePage.content.filter((excuse) =>
            (excuse.situation ?? "")
                .toLowerCase()
                .includes(query.trim().toLowerCase())
        );

        return filtered.sort((a, b) => {
            if (sortBy === "aftermath") {
                const daysA =
                    a.nextAftermathInDays === null ||
                    a.nextAftermathInDays === undefined
                        ? Infinity
                        : Number(a.nextAftermathInDays);
                const daysB =
                    b.nextAftermathInDays === null ||
                    b.nextAftermathInDays === undefined
                        ? Infinity
                        : Number(b.nextAftermathInDays);
                return daysA - daysB;
            }

            return new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);
        });
    }, [excusePage.content, query, sortBy]);

    const currentPage = (excusePage.pageNumber ?? page) + 1;
    const totalPages = Math.max(excusePage.totalPages ?? 1, 1);

    return (
        <main className="max-w-7xl mx-auto px-6 py-12 bg-white">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-navy-950">내 기록</h1>
                <p className="text-sm font-normal text-navy-500">
                    총{" "}
                    <span className="font-bold text-navy-900">
                        {excusePage.totalElements}
                    </span>
                    개
                </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <svg
                        viewBox="0 0 24 24"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3b2c7]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <label htmlFor="search-input" className="sr-only">
                        상황으로 검색
                    </label>
                    <input
                        type="search"
                        id="search-input"
                        placeholder="상황으로 검색"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="w-full rounded-md border border-border-input pl-10 pr-3.5 py-2.5 text-sm text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition"
                    />
                </div>

                <div className="relative flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-navy-500 whitespace-nowrap">
                        정렬
                    </span>
                    <div className="min-w-[168px]">
                        <Dropdown
                            label="정렬"
                            value={sortBy}
                            options={sortOptions}
                            onChange={setSortBy}
                            panelClassName="absolute right-0 top-full z-20 mt-1.5 w-[200px] bg-white border border-border-soft rounded-md shadow-[0_8px_24px_rgba(11,42,85,0.10)] py-1"
                        />
                    </div>
                </div>
            </div>

            {errorMessage && (
                <p
                    role="alert"
                    className="mt-4 text-sm font-medium text-danger-text"
                >
                    {errorMessage}
                </p>
            )}

            <div className="mt-4 hidden md:block border border-border-soft rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left">
                        <thead>
                            <tr className="text-xs font-normal text-navy-300 border-b border-border-soft">
                                <th
                                    scope="col"
                                    className="px-6 py-4 font-normal"
                                >
                                    상황
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-4 font-normal"
                                >
                                    상대 · 강도
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-4 font-normal"
                                >
                                    성공 확률
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-4 font-normal"
                                >
                                    후폭풍
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-4 font-normal"
                                >
                                    생성 시각
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-4 font-normal"
                                >
                                    <span className="sr-only">상세 보기</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }, (_, index) => (
                                    <SkeletonRow
                                        key={index}
                                        isLast={index === 4}
                                    />
                                ))
                            ) : visibleExcuses.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-sm font-normal text-navy-300"
                                    >
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                visibleExcuses.map((excuse, index) => (
                                    <tr
                                        key={excuse.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                            navigate(`/excuses/${excuse.id}`)
                                        }
                                        onKeyDown={(event) => {
                                            if (
                                                event.key === "Enter" ||
                                                event.key === " "
                                            ) {
                                                event.preventDefault();
                                                navigate(
                                                    `/excuses/${excuse.id}`
                                                );
                                            }
                                        }}
                                        className={[
                                            "hover:bg-surface-soft focus-visible:bg-surface-soft focus-visible:outline-none transition-colors cursor-pointer",
                                            index !== visibleExcuses.length - 1
                                                ? "border-b border-border-soft"
                                                : "",
                                        ].join(" ")}
                                    >
                                        <td className="px-6 py-6 text-base font-medium text-navy-900">
                                            {excuse.situation}
                                            {Number(excuse.roundNumber) > 1 && (
                                                <span className="mt-1 block text-xs font-bold text-brand-primary">
                                                    {excuse.roundNumber}라운드까지 진행
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-6">
                                            <span className="text-sm font-medium text-brand-primary whitespace-nowrap">
                                                {formatTargetTone(excuse)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-6 text-base font-bold text-brand-primary whitespace-nowrap">
                                            {excuse.successRate ?? 0}%
                                        </td>
                                        <td className="px-4 py-6">
                                            <AftermathBadge
                                                days={
                                                    excuse.nextAftermathInDays
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-6 text-sm font-normal text-navy-300 whitespace-nowrap">
                                            {formatDateTime(excuse.createdAt)}
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 ml-auto text-[#a3b2c7]"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M9 6l6 6-6 6" />
                                            </svg>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ul className="mt-4 md:hidden flex flex-col gap-3">
                {isLoading ? (
                    Array.from({ length: 4 }, (_, index) => (
                        <SkeletonCard key={index} />
                    ))
                ) : visibleExcuses.length === 0 ? (
                    <li className="px-5 py-10 text-center text-sm font-normal text-navy-300 border border-border-soft rounded-lg">
                        검색 결과가 없습니다.
                    </li>
                ) : (
                    visibleExcuses.map((excuse) => (
                        <li key={excuse.id}>
                            <Link
                                to={`/excuses/${excuse.id}`}
                                className="block border border-border-soft rounded-lg p-5 hover:bg-surface-soft transition-colors"
                            >
                                <p className="text-base font-medium text-navy-900">
                                    {excuse.situation}
                                </p>
                                {Number(excuse.roundNumber) > 1 && (
                                    <span className="mt-1 block text-xs font-bold text-brand-primary">
                                        {excuse.roundNumber}라운드까지 진행
                                    </span>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                                    <span className="font-medium text-brand-primary">
                                        {formatTargetTone(excuse)}
                                    </span>
                                    <span className="font-bold text-brand-primary">
                                        {excuse.successRate ?? 0}%
                                    </span>
                                    <AftermathBadge
                                        days={excuse.nextAftermathInDays}
                                    />
                                </div>
                                <p className="mt-2 text-xs font-normal text-navy-300">
                                    {formatDateTime(excuse.createdAt)}
                                </p>
                            </Link>
                        </li>
                    ))
                )}
            </ul>

            <nav
                aria-label="페이지네이션"
                className="mt-6 flex items-center justify-center gap-4"
            >
                <button
                    type="button"
                    disabled={page <= 0 || isLoading}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    className="px-4 py-2 text-sm font-medium text-navy-950 border border-border-input rounded-md hover:bg-brand-primary-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    이전
                </button>
                <span className="text-sm font-medium text-navy-500">
                    {currentPage} / {totalPages}
                </span>
                <button
                    type="button"
                    disabled={page >= totalPages - 1 || isLoading}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 text-sm font-medium text-navy-950 border border-border-input rounded-md hover:bg-brand-primary-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    다음
                </button>
            </nav>
        </main>
    );
}
