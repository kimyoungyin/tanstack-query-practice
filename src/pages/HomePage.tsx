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
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>TanStack Query 실습 홈</h1>

            <div style={{ marginBottom: "30px" }}>
                <h2>📚 학습 목표</h2>
                <ul>
                    <li>쿼리 캐싱 동작 이해</li>
                    <li>백그라운드 리페칭 확인</li>
                    <li>캐시 무효화 및 업데이트</li>
                    <li>로딩 상태 및 에러 처리</li>
                </ul>
            </div>

            <div style={{ marginBottom: "30px" }}>
                <h2>🧪 캐시 디버깅 도구</h2>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        marginBottom: "20px",
                    }}
                >
                    <button
                        onClick={handleInvalidateAll}
                        style={{ padding: "8px 16px" }}
                    >
                        모든 캐시 무효화(queryClient.invalidateQueries)
                        <div>
                            - 학습 포인트: 캐시데이터는 제공되지만, stale하다고
                            간주됩니다. 다시 쿼리에 접근하면 refetch가
                            진행됩니다.
                        </div>
                    </button>
                    <button
                        onClick={handleClearCache}
                        style={{ padding: "8px 16px" }}
                    >
                        캐시 완전 삭제(queryClient.clear)
                        <div>
                            - 학습 포인트: 캐시데이터가 완전히 삭제됩니다. 다시
                            쿼리에 접근하면 pending 상태가 됩니다.
                        </div>
                    </button>
                </div>
                <hr />
                <h3>캐시 상태: 1초마다 갱신됩니다.</h3>
                <StatusBox
                    status={hasPostsCache}
                    title="Posts 캐시"
                    description={hasPostsCache ? "있음" : "없음"}
                />
            </div>
            <hr />
            <div style={{ marginBottom: "30px" }}>
                <h2>🔗 페이지 이동</h2>
                <nav
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    <Link
                        to="/posts"
                        style={{
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            textDecoration: "none",
                            backgroundColor: "#f8f9fa",
                        }}
                    >
                        📝 Posts 페이지 - 게시물 목록 (useQuery와 캐시)
                    </Link>
                </nav>
            </div>
        </div>
    );
}
