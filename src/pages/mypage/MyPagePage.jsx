import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { excuseApi } from "../../api/excuseApi";
import { userApi } from "../../api/userApi";
import { useAuthStore } from "../../store/useAuthStore";

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

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function AftermathCountdownBadge({ days }) {
  if (days === null || days === undefined) return null;

  const isSoon = days <= 1;
  const label = days === 0 ? "D-day" : `D-${days}`;

  return (
    <span
      className={[
        "text-xs font-bold whitespace-nowrap shrink-0",
        isSoon ? "text-danger-text" : "text-brand-primary",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function DefaultAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <circle cx="50" cy="50" r="50" fill="#eef1f5" />
      <circle cx="50" cy="40" r="18" fill="#c3cbd6" />
      <path d="M50 60c-20 0-36 12-36 30v10h72V90c0-18-16-30-36-30z" fill="#c3cbd6" />
    </svg>
  );
}

export default function MyPagePage() {
  const [profile, setProfile] = useState(null);
  const [recentExcuses, setRecentExcuses] = useState([]);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameSuccess, setNicknameSuccess] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [pageError, setPageError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const updateAuthNickname = useAuthStore((state) => state.updateNickname);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function loadMyPage() {
      try {
        setIsLoading(true);
        setPageError("");

        const [profileData, excusePage] = await Promise.all([
          userApi.getMyProfile(),
          excuseApi.getMyExcuses({ page: 0, size: 5 }),
        ]);

        if (!isMounted) return;

        setProfile(profileData);
        setNickname(profileData.nickname ?? "");
        setRecentExcuses(excusePage.content ?? []);
      } catch (error) {
        if (isMounted) {
          setPageError(error.message || "마이페이지 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadMyPage();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleNicknameSubmit(event) {
    event.preventDefault();
    const nextNickname = nickname.trim();

    if (!nextNickname) {
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }

    try {
      setIsSavingNickname(true);
      setNicknameError("");
      setNicknameSuccess("");

      const updatedProfile = await userApi.updateNickname({ nickname: nextNickname });
      setProfile(updatedProfile);
      updateAuthNickname(updatedProfile.nickname);
      setNicknameSuccess("닉네임이 변경되었습니다.");
    } catch (error) {
      const fieldError = error.data?.nickname;
      setNicknameError(fieldError || error.message || "닉네임 변경에 실패했습니다.");
    } finally {
      setIsSavingNickname(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 20) {
      setPasswordError("새 비밀번호는 8자 이상 20자 이하여야 합니다.");
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError("");
      setPasswordSuccess("");

      await userApi.updatePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setPasswordSuccess("비밀번호가 변경되었습니다.");
    } catch (error) {
      const fieldError = error.data?.currentPassword || error.data?.newPassword;
      setPasswordError(fieldError || error.message || "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 bg-white">
      {pageError && (
        <p role="alert" className="mb-4 text-sm font-medium text-danger-text">
          {pageError}
        </p>
      )}

      <section aria-label="마이페이지" className="border border-border-soft rounded-lg">
        <div className="p-6 sm:p-8">
          {isLoading ? (
            <p className="text-sm font-medium text-navy-500">마이페이지 정보를 불러오는 중...</p>
          ) : (
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-4 sm:gap-5">
              <div className="shrink-0">
                {/* docs/ui/mypage.html 기준: 기본 프로필은 인물 실루엣 SVG를 사용한다. */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#eef1f5] overflow-hidden flex items-center justify-center">
                  <DefaultAvatar />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl font-bold text-navy-950">{profile?.nickname ?? "사용자"}</h1>
                  <Link to="/rank" className="text-[10px] font-bold text-brand-primary hover:text-brand-primary-hover transition-colors whitespace-nowrap">
                    {profile?.gradeLabel ?? "등급"} &rarr;
                  </Link>
                </div>
                <p className="mt-1 text-sm font-normal text-navy-500">
                  <span>{profile?.email ?? "-"}</span>
                  <span className="mx-1.5 text-border-input">·</span>
                  가입일 <span>{formatDate(profile?.createdAt)}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 py-7 border-t border-border-soft">
          <h2 className="text-base font-bold text-navy-950">계정 설정</h2>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-border-soft gap-6 sm:gap-0">
            <div className="sm:pr-8">
              <h3 className="text-sm font-bold text-navy-700">닉네임 변경</h3>
              {/* PATCH /api/users/me: 닉네임 변경 성공 시 헤더 닉네임도 같이 갱신한다. */}
              <form onSubmit={handleNicknameSubmit} className="mt-3 flex flex-col gap-3">
                <label htmlFor="nickname" className="sr-only">새 닉네임</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  required
                  maxLength={20}
                  value={nickname}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setNicknameError("");
                    setNicknameSuccess("");
                  }}
                  className="w-full rounded-md border border-border-input px-3.5 py-2.5 text-sm text-navy-900 focus:outline-none focus:border-brand-primary transition"
                />
                <button
                  type="submit"
                  disabled={isSavingNickname}
                  className="self-start px-5 py-2.5 text-sm font-bold text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingNickname ? "저장 중..." : "저장"}
                </button>
              </form>
              {nicknameError && <p role="alert" className="mt-2 text-sm font-medium text-danger-text">{nicknameError}</p>}
              {nicknameSuccess && <p role="status" className="mt-2 text-sm font-medium text-suspicion-low-text">{nicknameSuccess}</p>}
            </div>

            <div className="sm:pl-8">
              <h3 className="text-sm font-bold text-navy-700">비밀번호 변경</h3>
              {/* PATCH /api/users/me/password: 성공해도 기존 JWT는 유지된다. */}
              <form onSubmit={handlePasswordSubmit} className="mt-3 flex flex-col gap-3">
                <div>
                  <label htmlFor="current-password" className="block text-xs font-medium text-navy-500">현재 비밀번호</label>
                  <input
                    type="password"
                    id="current-password"
                    name="currentPassword"
                    required
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => {
                      setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }));
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    className="mt-1 w-full rounded-md border border-border-input px-3.5 py-2.5 text-sm text-navy-900 focus:outline-none focus:border-brand-primary transition"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-xs font-medium text-navy-500">새 비밀번호</label>
                  <input
                    type="password"
                    id="new-password"
                    name="newPassword"
                    required
                    minLength={8}
                    maxLength={20}
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(event) => {
                      setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }));
                      setPasswordError("");
                      setPasswordSuccess("");
                    }}
                    className="mt-1 w-full rounded-md border border-border-input px-3.5 py-2.5 text-sm text-navy-900 focus:outline-none focus:border-brand-primary transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="self-start px-5 py-2.5 text-sm font-bold text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? "변경 중..." : "변경하기"}
                </button>
              </form>
              {passwordError && <p role="alert" className="mt-2 text-sm font-medium text-danger-text">{passwordError}</p>}
              {passwordSuccess && (
                <p role="status" className="mt-2 text-sm font-medium text-suspicion-low-text">
                  {passwordSuccess}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 pb-7 pt-5 border-t border-border-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-950">최근 변명</h2>
            <Link to="/excuses" className="text-sm font-bold text-brand-primary hover:text-brand-primary-hover transition-colors whitespace-nowrap">
              전체보기 &rarr;
            </Link>
          </div>
          <p className="mt-1 text-sm font-normal text-navy-500">
            아직 대비하지 못한 후폭풍이 있다면 D-day로 알려드려요.
          </p>

          <ul className="mt-3 divide-y divide-border-soft">
            {recentExcuses.length === 0 ? (
              <li className="rounded-lg border border-dashed border-[#cddcf0] bg-surface-soft px-6 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-primary shadow-[0_4px_12px_rgba(21,126,251,0.10)]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 4h12v4a6 6 0 0 1-12 0V4Z" />
                    <path d="M8 4V2h8v2M9 19h6M12 14v5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-bold text-navy-900">
                  아직 저장된 변명이 없어요
                </h3>
                <p className="mt-1.5 text-xs font-normal text-navy-500">
                  첫 번째 변명을 만들고 나만의 위기 대응 기록을 시작해보세요.
                </p>
                <Link
                  to="/create"
                  className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-brand-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-primary-hover"
                >
                  첫 변명 만들기
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </li>
            ) : (
              recentExcuses.map((excuse) => (
                <li key={excuse.id} className="py-4 flex items-center justify-between gap-4">
                  <Link to={`/excuses/${excuse.id}`} className="min-w-0 hover:text-brand-primary transition-colors">
                    <p className="text-sm font-normal text-navy-900 truncate">{excuse.situation}</p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-medium text-brand-primary whitespace-nowrap">
                        {excuse.target === "CUSTOM"
                          ? excuse.targetDescription || targetLabels.CUSTOM
                          : targetLabels[excuse.target] ?? excuse.target} · {toneLabels[excuse.tone] ?? excuse.tone}
                      </span>
                      <span className="text-xs font-normal text-navy-300 whitespace-nowrap">{formatDate(excuse.createdAt)}</span>
                    </div>
                  </Link>
                  <AftermathCountdownBadge days={excuse.nextAftermathInDays} />
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-bold text-danger-text hover:text-[#c8342f] transition-colors"
        >
          로그아웃
        </button>
      </div>
    </main>
  );
}
