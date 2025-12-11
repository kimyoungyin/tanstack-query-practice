import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface PostsResponse {
    posts: Post[];
    nextCursor: number | null;
    hasMore: boolean;
}

// Mock API 함수 - 페이지네이션 지원
const fetchInfinitePosts = async ({
    pageParam = 1,
}): Promise<PostsResponse> => {
    console.log(`📄 페이지 ${pageParam} 로딩 중...`);

    // 네트워크 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 페이지별 임의 데이터 생성
    const postsPerPage = 5;
    const startId = (pageParam - 1) * postsPerPage + 1;

    const posts: Post[] = Array.from({ length: postsPerPage }, (_, index) => ({
        id: startId + index,
        title: `무한 스크롤 게시물 ${startId + index}`,
        body: `이것은 ${pageParam}페이지의 ${
            index + 1
        }번째 게시물입니다. 무한 스크롤을 테스트하기 위한 내용입니다.`,
        userId: Math.floor(Math.random() * 5) + 1,
    }));

    // 최대 10페이지까지만 제공
    const hasMore = pageParam < 10;
    const nextCursor = hasMore ? pageParam + 1 : null;

    return {
        posts,
        nextCursor,
        hasMore,
    };
};

export default function InfinitePostsPage() {
    // useInfiniteQuery 사용
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["infinite-posts"],
        queryFn: fetchInfinitePosts,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
    });

    // 모든 페이지의 게시물을 하나의 배열로 합치기
    const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

    // 수동으로 다음 페이지 로드
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // 캐시 상태 확인
    const handleCheckInfiniteCache = () => {
        console.log("=== 무한 쿼리 캐시 분석 ===");
        console.log("📄 총 페이지 수:", data?.pages.length);
        console.log("📝 총 게시물 수:", allPosts.length);
        console.log("🔄 다음 페이지 있음:", hasNextPage);
        console.log("📦 전체 데이터:", data);

        data?.pages.forEach((page, index) => {
            console.log(`페이지 ${index + 1}:`, page.posts.length, "개 게시물");
        });
    };

    if (isLoading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>♾️ 무한 스크롤 게시물 로딩 중...</h2>
                <p>첫 번째 페이지를 불러오고 있습니다.</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
                <h2>❌ 무한 스크롤 로딩 실패</h2>
                <p>{error?.message}</p>
                <button onClick={() => refetch()}>다시 시도</button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "20px" }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    ← 홈으로
                </Link>
            </div>

            <h1>♾️ 무한 스크롤 게시물</h1>

            {/* 상태 정보 */}
            <div
                style={{
                    backgroundColor: "#e7f3ff",
                    padding: "15px",
                    borderRadius: "4px",
                    marginBottom: "20px",
                }}
            >
                <h3>📊 무한 쿼리 상태</h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "10px",
                    }}
                >
                    <div>
                        📄 <strong>로드된 페이지:</strong>{" "}
                        {data?.pages.length || 0}
                    </div>
                    <div>
                        📝 <strong>총 게시물:</strong> {allPosts.length}
                    </div>
                    <div>
                        🔄 <strong>다음 페이지:</strong>{" "}
                        {hasNextPage ? "있음" : "없음"}
                    </div>
                    <div>
                        ⏳ <strong>로딩 중:</strong>{" "}
                        {isFetchingNextPage ? "예" : "아니오"}
                    </div>
                </div>
            </div>

            {/* 컨트롤 버튼들 */}
            <div
                style={{
                    marginBottom: "20px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                }}
            >
                <button
                    onClick={handleLoadMore}
                    disabled={!hasNextPage || isFetchingNextPage}
                >
                    {isFetchingNextPage
                        ? "⏳ 로딩 중..."
                        : hasNextPage
                        ? "📄 다음 페이지 로드"
                        : "✅ 모든 페이지 로드됨"}
                </button>
                <button onClick={handleCheckInfiniteCache}>
                    📊 캐시 상태 분석
                </button>
                <button onClick={() => refetch()}>🔄 전체 새로고침</button>
            </div>

            {/* 게시물 목록 */}
            <div style={{ display: "grid", gap: "15px" }}>
                {allPosts.map((post, index) => (
                    <div
                        key={post.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "15px",
                            backgroundColor: "#f8f9fa",
                            position: "relative",
                        }}
                    >
                        {/* 페이지 구분을 위한 표시 */}
                        <div
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                backgroundColor: "#007bff",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                            }}
                        >
                            페이지 {Math.floor(index / 5) + 1}
                        </div>

                        <h3
                            style={{
                                margin: "0 0 10px 0",
                                paddingRight: "80px",
                            }}
                        >
                            {post.title}
                        </h3>
                        <p style={{ margin: "0 0 10px 0", color: "#666" }}>
                            {post.body}
                        </p>
                        <small style={{ color: "#888" }}>
                            ID: {post.id} | 작성자: {post.userId} | 순서:{" "}
                            {index + 1}
                        </small>
                    </div>
                ))}
            </div>

            {/* 로딩 인디케이터 */}
            {isFetchingNextPage && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "20px",
                        backgroundColor: "#fff3cd",
                        borderRadius: "4px",
                        margin: "20px 0",
                    }}
                >
                    <h3>⏳ 다음 페이지 로딩 중...</h3>
                    <p>새로운 게시물들을 불러오고 있습니다.</p>
                </div>
            )}

            {/* 끝 표시 */}
            {!hasNextPage && allPosts.length > 0 && (
                <div
                    style={{
                        textAlign: "center",
                        padding: "20px",
                        backgroundColor: "#d4edda",
                        borderRadius: "4px",
                        margin: "20px 0",
                    }}
                >
                    <h3>✅ 모든 게시물을 불러왔습니다!</h3>
                    <p>총 {allPosts.length}개의 게시물이 로드되었습니다.</p>
                </div>
            )}

            {/* 학습 노트 */}
            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "4px",
                }}
            >
                <h3>🎓 useInfiniteQuery 학습 포인트</h3>
                <ul>
                    <li>
                        <strong>initialPageParam:</strong> 첫 번째 페이지
                        파라미터 (1)
                    </li>
                    <li>
                        <strong>getNextPageParam:</strong> 다음 페이지 파라미터
                        결정 함수
                    </li>
                    <li>
                        <strong>data.pages:</strong> 각 페이지의 데이터를 배열로
                        관리
                    </li>
                    <li>
                        <strong>fetchNextPage():</strong> 다음 페이지 수동 로드
                    </li>
                    <li>
                        <strong>hasNextPage:</strong> 더 로드할 페이지가 있는지
                        확인
                    </li>
                    <li>
                        <strong>isFetchingNextPage:</strong> 다음 페이지 로딩
                        상태
                    </li>
                    <li>
                        <strong>캐시 효율성:</strong> 이전 페이지들은 캐시에
                        유지됨
                    </li>
                </ul>
            </div>
        </div>
    );
}
