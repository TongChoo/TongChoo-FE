import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
import logo from "../../assets/변기_logo.png";
import { useAuthStore } from "../../store/useAuthStore";

const initialForm = {
    email: "",
    password: "",
    nickname: "",
};

function validateSignupForm(form) {
    const fieldErrors = {};

    if (!form.email.trim()) fieldErrors.email = "이메일을 입력해주세요.";
    else if (!form.email.includes("@"))
        fieldErrors.email = "올바른 이메일 형식으로 입력해주세요.";

    if (!form.password) fieldErrors.password = "비밀번호를 입력해주세요.";
    else if (form.password.length < 8 || form.password.length > 20) {
        fieldErrors.password = "비밀번호는 8자 이상 20자 이하여야 합니다.";
    }

    if (!form.nickname.trim()) fieldErrors.nickname = "닉네임을 입력해주세요.";
    else if (form.nickname.trim().length > 20)
        fieldErrors.nickname = "닉네임은 20자 이하여야 합니다.";

    return fieldErrors;
}

export default function SignupPage() {
    const [form, setForm] = useState(initialForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 회원가입 API도 성공하면 로그인 API처럼 토큰을 내려준다.
    // 그래서 별도 로그인 화면을 다시 거치지 않고 바로 로그인 상태로 저장할 수 있다.
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        setErrorMessage("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationErrors = validateSignupForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        try {
            setIsSubmitting(true);
            const tokenResponse = await authApi.signup({
                email: form.email.trim(),
                password: form.password,
                nickname: form.nickname.trim(),
            });
            // 받은 토큰을 저장해서 "가입 완료 + 로그인 완료" 상태로 만든다.
            login(tokenResponse);
            // 가입 후에는 서비스 소개 랜딩으로 이동한다.
            // 로그인된 랜딩에서는 CTA가 "변명 만들러 가기"로 바뀐다.
            navigate("/", { replace: true });
        } catch (error) {
            if (error.data && typeof error.data === "object") {
                setFieldErrors(error.data);
            } else if (
                error.status === 409 &&
                error.message.includes("이메일")
            ) {
                setFieldErrors({ email: error.message });
            } else if (
                error.status === 409 &&
                error.message.includes("닉네임")
            ) {
                setFieldErrors({ nickname: error.message });
            } else {
                setErrorMessage(error.message || "회원가입에 실패했습니다.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-[calc(100vh-90px)] flex items-center justify-center px-6 py-16 bg-white">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center text-center">
                    <img
                        src={logo}
                        alt="변기 로고"
                        className="w-16 h-16 object-contain"
                    />
                    <h1 className="mt-5 text-3xl font-bold text-navy-950">
                        회원가입
                    </h1>
                    <p className="mt-2.5 text-sm font-normal text-navy-500">
                        변명 기록과 등급을 계속 이어가려면 계정이 필요해요.
                    </p>
                </div>

                {errorMessage && (
                    <p
                        role="alert"
                        className="mt-6 text-sm font-medium text-danger-text"
                    >
                        {errorMessage}
                    </p>
                )}

                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-bold text-navy-700"
                        >
                            이메일
                        </label>
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
                        {fieldErrors.email && (
                            <p
                                role="alert"
                                className="mt-1.5 text-sm font-medium text-danger-text"
                            >
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-bold text-navy-700"
                        >
                            비밀번호
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            minLength={8}
                            maxLength={20}
                            autoComplete="new-password"
                            value={form.password}
                            onChange={handleChange}
                            className="mt-1.5 w-full rounded-md border border-border-input px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition"
                        />
                        {fieldErrors.password && (
                            <p
                                role="alert"
                                className="mt-1.5 text-sm font-medium text-danger-text"
                            >
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="nickname"
                            className="block text-sm font-bold text-navy-700"
                        >
                            닉네임
                        </label>
                        <input
                            type="text"
                            id="nickname"
                            name="nickname"
                            required
                            maxLength={20}
                            value={form.nickname}
                            onChange={handleChange}
                            className="mt-1.5 w-full rounded-md border border-border-input px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-[#a3b2c7] focus:outline-none focus:border-brand-primary transition"
                        />
                        {fieldErrors.nickname && (
                            <p
                                role="alert"
                                className="mt-1.5 text-sm font-medium text-danger-text"
                            >
                                {fieldErrors.nickname}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 text-base font-bold text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? "가입 중..." : "회원가입"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm font-normal text-navy-500">
                    이미 계정이 있으신가요?{" "}
                    <Link
                        to="/login"
                        className="font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
                    >
                        로그인
                    </Link>
                </p>
            </div>
        </main>
    );
}
