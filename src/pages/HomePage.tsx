import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function HomePage() {
    const queryClient = useQueryClient();

    // 캐시 상태를 확인하는 함수
    const handleCheckCache = () => {
        console.log("=== 현재 캐시 상태 ===");
        console.log("Posts 캐시:", queryClient.getQueryData(["posts"]));
        console.log("Users 캐시:", queryClient.getQueryData(["users"]));
        console.log("모든 쿼리 캐시:", queryClient.getQueryCache().getAll());
    };

    // 모든 캐시를 무효화하는 함수
    const handleInvalidateAll = () => {
        queryClient.invalidateQueries();
        console.log("모든 캐시가 무효화되었습니다");
    };

    // 특정 캐시를 제거하는 함수
    const handleClearCache = () => {
        queryClient.clear();
        console.log("모든 캐시가 제거되었습니다");
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
                    <li>Optimistic Updates</li>
                </ul>
            </div>

            <div style={{ marginBottom: "30px" }}>
                <h2>🧪 캐시 디버깅 도구</h2>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                        onClick={handleCheckCache}
                        style={{ padding: "8px 16px" }}
                    >
                        캐시 상태 확인
                    </button>
                    <button
                        onClick={handleInvalidateAll}
                        style={{ padding: "8px 16px" }}
                    >
                        모든 캐시 무효화
                    </button>
                    <button
                        onClick={handleClearCache}
                        style={{ padding: "8px 16px" }}
                    >
                        캐시 완전 삭제
                    </button>
                </div>
                <p
                    style={{
                        fontSize: "14px",
                        color: "#666",
                        marginTop: "10px",
                    }}
                >
                    💡 개발자 도구 콘솔을 열어서 캐시 상태를 확인해보세요
                </p>
            </div>

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
                        📝 Posts 페이지 - 게시물 목록 (useQuery 기본)
                    </Link>
                    <Link
                        to="/users"
                        style={{
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            textDecoration: "none",
                            backgroundColor: "#f8f9fa",
                        }}
                    >
                        👥 Users 페이지 - 사용자 목록 (캐시 시간 설정)
                    </Link>
                    <Link
                        to="/infinite-posts"
                        style={{
                            padding: "12px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            textDecoration: "none",
                            backgroundColor: "#f8f9fa",
                        }}
                    >
                        ♾️ Infinite Posts - 무한 스크롤 (useInfiniteQuery)
                    </Link>
                </nav>
            </div>

            <div
                style={{
                    backgroundColor: "#fff3cd",
                    padding: "15px",
                    borderRadius: "4px",
                }}
            >
                <h3>🎯 실습 가이드</h3>
                <ol>
                    <li>각 페이지를 방문해서 데이터가 로딩되는 것을 확인</li>
                    <li>
                        다른 페이지로 이동한 후 다시 돌아와서 캐시된 데이터 확인
                    </li>
                    <li>캐시 디버깅 도구로 캐시 상태 실시간 확인</li>
                </ol>
            </div>
        </div>
    );
}
