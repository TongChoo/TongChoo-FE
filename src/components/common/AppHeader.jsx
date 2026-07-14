// 공통 헤더. Frontend.md §3.4 AppHeader.
// 모든 화면(랜딩 포함)에서 AppLayout을 통해 재사용되며,
// 중앙 네비게이션은 서비스 핵심 기능만 두고 마이페이지는 우측 닉네임 링크로 진입한다.
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import logo from "../../assets/변기_logo.png";

// docs/ui/*.html 공통 헤더 기준:
// 중앙 메뉴는 "변명 만들기 / 내 기록 / 등급"만 두고,
// 마이페이지는 로그인 상태의 우측 닉네임 링크로 접근한다.
const NAV_ITEMS = [
    { to: "/create", label: "변명 만들기" },
    { to: "/excuses", label: "내 기록" },
    { to: "/rank", label: "등급" },
];

// react-router-dom의 NavLink는 className에 { isActive } 콜백을 넘겨줄 수 있다.
// 현재 경로와 일치하는 메뉴만 브랜드 컬러로 강조하고, 나머지는 hover 시에만 색이 바뀐다.
function navLinkClassName({ isActive }) {
    return isActive
        ? "text-brand-primary transition-colors"
        : "hover:text-brand-primary transition-colors";
}

export default function AppHeader() {
    const { isAuthenticated, nickname } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border-soft bg-white/95 backdrop-blur-sm relative">
            <div className="max-w-[1500px] mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-6 px-7 sm:px-10 lg:px-14 py-5 md:py-6">
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="flex items-center gap-3 shrink-0 justify-self-start"
                    aria-label="변기 홈으로 이동"
                >
                    <img
                        src={logo}
                        alt="변기 로고"
                        className="w-12 h-12 object-contain"
                    />
                    <span className="text-2xl font-bold tracking-tight text-navy-950">
                        변기
                    </span>
                </Link>

                <nav
                    className="hidden md:flex items-center justify-center gap-14 text-base font-semibold text-navy-700"
                    aria-label="서비스 메뉴"
                >
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={navLinkClassName}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-0.5 sm:gap-3 justify-self-end">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-navy-950 hover:bg-brand-primary-soft transition-colors"
                        aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-nav-menu"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            {isMenuOpen ? (
                                <path d="M6 6l12 12M18 6L6 18" />
                            ) : (
                                <path d="M4 7h16M4 12h16M4 17h16" />
                            )}
                        </svg>
                    </button>

                    {isAuthenticated ? (
                        <nav
                            className="flex items-center gap-2 sm:gap-3"
                            aria-label="회원 메뉴"
                        >
                            <NavLink
                                to="/mypage"
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    [
                                        "px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-bold whitespace-nowrap rounded-md transition-colors",
                                        isActive
                                            ? "text-brand-primary"
                                            : "text-navy-950 hover:text-brand-primary",
                                    ].join(" ")
                                }
                            >
                                {nickname ? `${nickname}님` : "마이페이지"}
                            </NavLink>
                        </nav>
                    ) : (
                        <nav
                            className="flex items-center gap-1.5 sm:gap-3"
                            aria-label="회원 메뉴"
                        >
                            <Link
                                to="/login"
                                onClick={closeMenu}
                                className="px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-normal whitespace-nowrap text-navy-950 hover:bg-brand-primary-soft rounded-md transition-colors"
                            >
                                로그인
                            </Link>
                            <Link
                                to="/signup"
                                onClick={closeMenu}
                                className="px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-bold whitespace-nowrap text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-all"
                            >
                                회원가입
                            </Link>
                        </nav>
                    )}
                </div>
            </div>

            {isMenuOpen && (
                <nav
                    id="mobile-nav-menu"
                    aria-label="서비스 메뉴 (모바일)"
                    className="md:hidden absolute left-0 right-0 top-full bg-white border-b border-border-soft shadow-[0_8px_16px_rgba(11,42,85,0.08)] flex flex-col px-7 sm:px-10 py-2"
                >
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={closeMenu}
                            className={({ isActive }) =>
                                [
                                    "px-2 py-3.5 text-base font-semibold border-b border-border-soft last:border-b-0",
                                    isActive
                                        ? "text-brand-primary"
                                        : "text-navy-700 hover:text-brand-primary",
                                ].join(" ")
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            )}
        </header>
    );
}
