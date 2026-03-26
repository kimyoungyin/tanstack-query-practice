import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import StatusBox from "@/components/StatusBox";

export default function HomePage() {
    const queryClient = useQueryClient();

    const [hasPostsCache, setHasPostsCache] = useState(false);

    // 1초마다 캐시 상태를 확인하는 효과
    useEffect(() => {
        const interval = setInterval(() => {
            setHasPostsCache(!!queryClient.getQueryData(["posts"]));
        }, 1000);
        return () => clearInterval(interval);
    }, [queryClient]);

    // 모든 캐시를 무효화하는 함수
    const handleInvalidateAll = () => {
        queryClient.invalidateQueries();
    };

    // 특정 캐시를 제거하는 함수
    const handleClearCache = () => {
        queryClient.clear();
    };

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

            <section className="section card stack-md">
                <h2 className="section-title">캐시 디버깅 도구</h2>
                <div className="button-row">
                    <button
                        className="button-primary"
                        onClick={handleInvalidateAll}
                    >
                        모든 캐시 무효화
                    </button>
                    <p className="muted">
                        `queryClient.invalidateQueries()`:
                        <br />
                        캐시 데이터는 유지되지만 stale 상태로 전환되어 이후 접근 시
                        다시 요청됩니다.
                    </p>
                    <button
                        className="button-danger"
                        onClick={handleClearCache}
                    >
                        캐시 완전 삭제
                    </button>
                    <p className="muted">
                        `queryClient.clear()`:
                        <br />
                        캐시 데이터가 완전히 삭제되어 다음 접근 시 pending
                        상태부터 시작합니다.
                    </p>
                </div>
                <h3>캐시 상태 (1초 주기 갱신)</h3>
                <StatusBox
                    status={hasPostsCache}
                    title="Posts 캐시"
                    description={hasPostsCache ? "있음" : "없음"}
                />
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
