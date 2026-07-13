// 라우트 가드 모음. Frontend.md §4.
// App.jsx에서 <Route element={<RequireAuth />}> / <Route element={<RedirectIfAuthenticated />}>로
// 감싸는 용도로만 쓰인다 (각 라우트 컴포넌트 안에서 개별적으로 인증 체크를 반복하지 않기 위함).
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

// Frontend.md §4: 인증 필요 라우트 가드. 토큰이 없으면 /login으로 리다이렉트한다.
export function RequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // 보호된 페이지는 로그인한 사람만 들어갈 수 있다.
    // 예를 들어 /create에 바로 들어왔는데 토큰이 없으면 /login으로 보낸다.
    // state.from에는 원래 가려던 위치를 남겨둘 수 있지만,
    // 현재 서비스 정책은 로그인 후 랜딩("/")으로 보내는 흐름을 사용한다.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

// Frontend.md §4: /signup, /login은 이미 로그인된 상태로 접근하면 랜딩으로 리다이렉트한다.
// 로그인 후 랜딩의 CTA가 "변명 만들러 가기"로 바뀌므로, 사용자는 소개 화면을 거쳐 자연스럽게 핵심 기능으로 진입한다.
export function RedirectIfAuthenticated() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    // 이미 로그인한 사용자가 /login 또는 /signup을 다시 볼 필요는 없다.
    // 그래서 랜딩으로 돌려보내고, 랜딩의 로그인 상태 CTA로 다음 행동을 유도한다.
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
