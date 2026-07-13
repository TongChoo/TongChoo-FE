import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import logo from "../../assets/변기_logo.png";
import notebookMockup from "../../assets/notebook_mockUp.png";

const features = [
    {
        title: "AI 변명 생성",
        description: "상대와 강도만 고르면, 딱 맞는 변명이 바로 나와요.",
        icon: (
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        ),
    },
    {
        title: "성공 확률 분석",
        description: "현실성·설득력·의심 위험도까지 숫자로 확인해요.",
        icon: (
            <>
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                <path d="M12 12l4-4M8 12a4 4 0 1 1 8 0" />
            </>
        ),
    },
    {
        title: "후폭풍 예측",
        description: "며칠 뒤 상대가 무슨 질문을 할지 미리 보여드려요.",
        icon: (
            <>
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                <path d="M12 7v5l3.5 2" />
            </>
        ),
    },
    {
        title: "등급 시스템",
        description: "변명을 만들수록 경험치가 쌓여 등급이 올라가요.",
        icon: (
            <>
                <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" />
                <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
            </>
        ),
    },
];

const grades = [
    {
        label: "초보 변명러",
        className: "bg-white ring-1 ring-border-ring text-navy-950",
    },
    {
        label: "위기 생존자",
        className: "bg-[#bedafd] text-navy-950",
    },
    {
        label: "핑계 전문가",
        className: "bg-[#84bbf6] text-navy-950",
    },
    {
        label: "사회생활 마스터",
        className: "bg-[#4c98ee] text-navy-950",
    },
    {
        label: "변명의 신",
        className: "bg-brand-primary text-white",
    },
];

function PrimaryCta({ children, to, inverted = false }) {
    return (
        <Link
            to={to}
            className={
                inverted
                    ? "inline-block px-8 py-3 text-base font-bold text-brand-primary bg-white rounded-md hover:bg-brand-primary-soft transition-all"
                    : "inline-block px-6 py-3 text-base font-bold text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-all"
            }
        >
            {children}
        </Link>
    );
}

export default function LandingPage() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <>
            <main>
                <section
                    id="top"
                    aria-label="히어로"
                    className="bg-white scroll-mt-10"
                >
                    <div className="max-w-7xl mx-auto px-6 pt-15 py-20 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-14 items-center">
                        <div className="max-w-xl">
                            <span className="inline-block text-xs font-medium tracking-wide text-brand-primary">
                                AI 위기 대응 서비스
                            </span>
                            <h1 className="mt-5 text-4xl md:text-5xl leading-tight tracking-tight text-navy-950">
                                <span className="font-normal">
                                    갑자기 변명이 필요한 순간,
                                </span>
                                <br />
                                <span className="font-bold text-brand-primary">
                                    변기가
                                </span>{" "}
                                <span className="font-normal">
                                    대신 짜드립니다
                                </span>
                            </h1>
                            <p className="mt-5 text-lg font-normal text-navy-500 leading-relaxed">
                                상황이랑 상대만 알려주세요. AI가 상황에 맞는
                                변명을 만들고, 성공 확률과 후폭풍까지 미리
                                계산해서 보여드릴게요.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                {isAuthenticated ? (
                                    <PrimaryCta to="/create">
                                        변명 만들러 가기
                                    </PrimaryCta>
                                ) : (
                                    <>
                                        <PrimaryCta to="/signup">
                                            무료로 시작하기
                                        </PrimaryCta>
                                        <Link
                                            to="/login"
                                            className="px-6 py-3 text-base font-medium text-navy-950 border border-border-input rounded-md hover:bg-brand-primary-soft transition-colors"
                                        >
                                            로그인
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:flex justify-center relative">
                            <div className="absolute w-[26rem] h-[26rem] bg-brand-primary/20 rounded-full blur-3xl -z-10" />
                            <img
                                src={notebookMockup}
                                alt="변기 서비스의 변명 상세 화면이 담긴 노트북 목업"
                                className="w-full max-w-[760px] object-contain"
                            />
                        </div>
                    </div>
                </section>

                <section
                    aria-label="핵심 기능"
                    className="bg-white scroll-mt-20"
                >
                    <div className="max-w-7xl mx-auto px-6 py-20">
                        <div className="max-w-xl mx-auto text-center">
                            <p className="text-sm font-medium tracking-wide text-brand-primary">
                                한눈에 보는 변기의 기능
                            </p>
                            <h2 className="mt-1.5 text-2xl md:text-3xl font-bold text-navy-950">
                                변기가 하는 일
                            </h2>
                            <p className="mt-2 font-normal text-navy-500">
                                문장 하나 던져주고 끝나는 게 아니라, 위기 상황
                                전체를 분석합니다.
                            </p>
                        </div>

                        <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {features.map((feature) => (
                                <li
                                    key={feature.title}
                                    className="bg-white rounded-2xl border border-border-soft p-7 flex flex-col min-h-[200px]"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-brand-primary-soft text-brand-primary flex items-center justify-center shrink-0">
                                        <svg
                                            className="w-7 h-7"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            {feature.icon}
                                        </svg>
                                    </div>
                                    <h3 className="mt-4 text-lg font-bold text-navy-950">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm font-normal text-navy-500 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section
                    aria-label="결과 구성"
                    className="bg-white scroll-mt-20"
                >
                    <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 items-center">
                        <div>
                            <span className="inline-block text-xs font-medium tracking-wide text-brand-primary">
                                결과 구성
                            </span>
                            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-navy-950">
                                변명 한 번에 이만큼 나와요
                            </h2>
                            <p className="mt-2.5 font-normal text-navy-500 leading-relaxed">
                                단순히 문장 하나 뱉는 게 아니라, 분석 리포트와
                                후폭풍 타임라인까지 한 번에 받아볼 수 있어요.
                                경험치도 바로 쌓입니다.
                            </p>
                            <ul className="mt-6 space-y-3">
                                {[
                                    "현실성 · 설득력 · 의심 위험도 점수 확인",
                                    "N일 뒤 예상 질문과 붕괴 확률 타임라인",
                                    "상대 답장에 맞춘 후속 답변 후보 제공",
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2.5 text-sm font-normal text-navy-700"
                                    >
                                        <span className="mt-1.5 w-1.5 h-1.5 bg-brand-primary rounded-full shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <ol className="grid w-full max-w-xl gap-3 sm:grid-cols-2 lg:ml-auto">
                            {[
                                ["상황·관계 분석", "입력한 상황과 상대의 관계를 먼저 파악해요."],
                                ["메시지 생성", "분석 결과에 맞춰 필요한 문장을 만들어요."],
                                ["길이·사실 검사", "문장 길이와 앞뒤 사실이 맞는지 확인해요."],
                                ["후속 대응 준비", "예상 질문과 다음 답변까지 함께 준비해요."],
                            ].map(([title, description], index) => (
                                <li key={title} className="rounded-2xl border border-border-soft bg-white p-6">
                                    <span className="text-sm font-bold text-brand-primary">
                                        {index + 1}
                                    </span>
                                    <h3 className="mt-2 font-bold text-navy-950">{title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-navy-500">
                                        {description}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section
                    aria-label="등급 체계 미리보기"
                    className="bg-white scroll-mt-20"
                >
                    <div className="max-w-7xl mx-auto px-6 py-24">
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-navy-950">
                                등급 체계
                            </h2>
                            <p className="mt-4 text-lg font-normal text-navy-400">
                                변명을 만들수록 경험치가 쌓이고, 등급이
                                올라갑니다.
                            </p>
                        </div>

                        <ol className="mt-16 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-3">
                            {grades.map((grade, index) => (
                                <li key={grade.label} className="contents">
                                    <div
                                        className={`flex-1 rounded-2xl flex flex-col items-center justify-center text-center px-5 py-6 ${grade.className}`}
                                    >
                                        <p className="text-xl font-bold">
                                            {grade.label}
                                        </p>
                                    </div>
                                    {index < grades.length - 1 && (
                                        <div
                                            className="hidden lg:flex items-center justify-center text-[#c7d3e3] shrink-0"
                                            aria-hidden="true"
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M9 6l6 6-6 6" />
                                            </svg>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section
                    aria-label="하단 CTA"
                    className="relative overflow-hidden bg-navy-950"
                >
                    <svg
                        className="absolute inset-0 w-full h-full"
                        aria-hidden="true"
                    >
                        <defs>
                            <pattern
                                id="cta-dot-grid"
                                x="0"
                                y="0"
                                width="22"
                                height="22"
                                patternUnits="userSpaceOnUse"
                            >
                                <circle
                                    cx="2"
                                    cy="2"
                                    r="1.3"
                                    fill="#ffffff"
                                    fillOpacity="0.14"
                                />
                            </pattern>
                        </defs>
                        <rect
                            width="100%"
                            height="100%"
                            fill="url(#cta-dot-grid)"
                        />
                    </svg>

                    <div className="relative max-w-2xl mx-auto px-6 py-20 text-center">
                        <h2 className="text-2xl md:text-3xl text-white">
                            <span className="font-normal">지금 바로</span>{" "}
                            <span className="font-bold">첫 변명</span>
                            <span className="font-normal">을 만들어보세요</span>
                        </h2>
                        <p className="mt-3 font-normal text-[#a9c2e0]">
                            가입은 1분이면 충분해요. 변명은 AI가 대신
                            짜드릴게요.
                        </p>
                        <div className="mt-7">
                            <PrimaryCta
                                to={isAuthenticated ? "/create" : "/signup"}
                                inverted
                            >
                                {isAuthenticated
                                    ? "변명 만들러 가기"
                                    : "무료로 시작하기"}
                            </PrimaryCta>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border-footer bg-surface-footer">
                <div className="max-w-6xl mx-auto px-6 py-12 md:py-14">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-end">
                        <div>
                            <nav
                                className="flex flex-wrap gap-x-7 gap-y-3 text-sm md:text-base font-bold text-[#263c58]"
                                aria-label="푸터 메뉴"
                            >
                                <Link
                                    to="/create"
                                    className="hover:text-brand-primary transition-colors"
                                >
                                    변명 만들기
                                </Link>
                                <Link
                                    to="/excuses"
                                    className="hover:text-brand-primary transition-colors"
                                >
                                    내 기록
                                </Link>
                                <Link
                                    to="/rank"
                                    className="hover:text-brand-primary transition-colors"
                                >
                                    등급
                                </Link>
                            </nav>
                            <div className="mt-9 space-y-1.5 text-xs md:text-sm text-navy-300 leading-relaxed">
                                <p>
                                    <strong className="font-semibold text-navy-400">
                                        TongChoo
                                    </strong>{" "}
                                    | AI 기반 위기 상황 변명 생성 서비스
                                </p>
                                <p>
                                    일상의 위기를 게임처럼, AI가 변명부터
                                    후폭풍까지 분석해드려요.
                                </p>
                                <p className="pt-1">
                                    Copyright © 2026 TongChoo. All rights
                                    reserved.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/"
                            className="inline-flex md:flex-col items-center gap-3 md:gap-2 justify-self-start md:justify-self-end"
                            aria-label="변기 홈으로 이동"
                        >
                            <img
                                src={logo}
                                alt="변기 로고"
                                className="w-16 h-16 md:w-20 md:h-20 object-contain opacity-90"
                            />
                            <span className="text-lg font-bold tracking-tight text-navy-950">
                                변기
                            </span>
                        </Link>
                    </div>
                </div>
            </footer>
        </>
    );
}
