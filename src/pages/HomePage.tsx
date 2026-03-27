import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className="stack-lg">
            <div className="stack-sm">
                <h1>TanStack Query 실습 홈</h1>
                <p className="muted">
                    캐시 수명과 리패치 흐름을 직접 조작하며 기본 개념을 익히는
                    학습용 페이지입니다.
                </p>
            </div>

            <section className="section card">
                <h2 className="section-title">학습 목표</h2>
                <ul>
                    <li>쿼리 캐싱 동작 이해</li>
                    <li>백그라운드 리페칭 확인</li>
                    <li>캐시 무효화 및 업데이트</li>
                    <li>로딩 상태 및 에러 처리</li>
                </ul>
            </section>

            <section className="section card stack-sm">
                <h2 className="section-title">페이지 이동</h2>
                <nav className="stack-sm">
                    <Link to="/posts" className="card">
                        Posts 페이지 - 게시물 목록과 캐시 상태 확인
                    </Link>
                </nav>
            </section>
        </div>
    );
}
