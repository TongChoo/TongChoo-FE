import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import logo from "../../assets/변기_logo.png";
import { useAuthStore } from "../../store/useAuthStore";

const initialForm = {
  email: "",
  password: "",
};

function validateLoginForm(form) {
  if (!form.email.trim()) return "이메일을 입력해주세요.";
  if (!form.email.includes("@")) return "올바른 이메일 형식으로 입력해주세요.";
  if (!form.password) return "비밀번호를 입력해주세요.";
  return "";
}

export default function LoginPage() {
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // useAuthStore.login은 로그인 성공 응답을 localStorage와 전역 상태에 저장한다.
  // 쉽게 말하면 "이 사용자는 로그인된 사람이다"라는 표식을 브라우저에 남기는 함수다.
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateLoginForm(form);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      const tokenResponse = await authApi.login({
        email: form.email.trim(),
        password: form.password,
      });
      // 백엔드가 준 accessToken/nickname/expiresIn을 저장한다.
      // 이후 보호된 API를 호출할 때 api/client.js가 이 토큰을 자동으로 Authorization 헤더에 붙인다.
      login(tokenResponse);
      // 로그인 직후에는 바로 기능 화면으로 밀어 넣지 않고 랜딩으로 보낸다.
      // 랜딩은 로그인 상태를 보고 CTA를 "변명 만들러 가기"로 바꿔 보여준다.
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-90px)] flex items-center justify-center px-6 py-16 bg-white">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="변기 로고" className="w-16 h-16 object-contain" />
          <h1 className="mt-5 text-3xl font-bold text-navy-950">로그인</h1>
          <p className="mt-2.5 text-sm font-normal text-navy-500">
            다시 만나서 반가워요. 계정으로 로그인하세요.
          </p>
        </div>

        {errorMessage && (
          <p role="alert" className="mt-6 text-sm font-medium text-danger-text bg-danger-bg rounded-md px-3.5 py-2.5">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-navy-700">이메일</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-border-input px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-navy-700">비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-border-input px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 text-base font-bold text-white bg-brand-primary rounded-md shadow-[0_4px_10px_rgba(21,126,251,0.18)] hover:bg-brand-primary-hover hover:shadow-[0_5px_12px_rgba(21,126,251,0.22)] transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-normal text-navy-500">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="font-bold text-brand-primary hover:text-brand-primary-hover transition-colors">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
