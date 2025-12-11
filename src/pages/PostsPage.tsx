import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DEFAULT from "@/constants";
import StatusBox from "@/components/StatusBox";

// 첫 번째 로딩(isPending일 때 첫 로딩인지, gcTime 이후라 리페칭하는 것인지 확인하기 위함)
let isFirstFetch = true;

// Mock API 함수들
const fetchPostsClosure = () => {
    let count = 0; // 몇 번째 호출인지 카운트

    return async (): Promise<Post[]> => {
        if (isFirstFetch) {
            isFirstFetch = false;
        }
        // 실제 API 호출을 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, DEFAULT.API_DELAY));
        count++;
        // 임의 데이터 반환
        return [
            {
                id: 1,
                title: "TanStack Query 기초" + count,
                body: "캐싱과 서버 상태 관리에 대해 알아보자",
                userId: 1,
            },
            {
                id: 2,
                title: "useQuery 훅 사용법" + count,
                body: "데이터 페칭의 새로운 패러다임",
                userId: 2,
            },
            {
                id: 3,
                title: "캐시 무효화 전략" + count,
                body: "언제 어떻게 캐시를 업데이트할까",
                userId: 1,
            },
            {
                id: 4,
                title: "Optimistic Updates" + count,
                body: "사용자 경험을 향상시키는 기법",
                userId: 3,
            },
            {
                id: 5,
                title: "Error Handling" + count,
                body: "에러 상황을 우아하게 처리하기",
                userId: 2,
            },
        ];
    };
};

const fetchPosts = fetchPostsClosure();

const createPost = async (newPost: Omit<Post, "id">): Promise<Post> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
        id: Date.now(), // 임시 ID
        ...newPost,
    };
};

export default function PostsPage() {
    const queryClient = useQueryClient();

    // 게시물 목록 조회 쿼리
    const {
        data: posts,
        isPending,
        error,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ["posts"],
        queryFn: fetchPosts,
    });

    // 게시물 생성 뮤테이션
    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: (newPost) => {
            // 캐시 업데이트 방법 1: 직접 업데이트
            queryClient.setQueryData(
                ["posts"],
                (oldPosts: Post[] | undefined) => {
                    return oldPosts ? [...oldPosts, newPost] : [newPost];
                }
            );
        },
        onError: () => {
            console.error("❌ 게시물 생성 실패:", error);
        },
    });

    // 새 게시물 생성 핸들러
    const handleCreatePost = () => {
        const newPost = {
            title: `새 게시물 ${Date.now()}`,
            body: "이것은 Optimistic Update 테스트용 게시물입니다.",
            userId: 1,
        };
        createPostMutation.mutate(newPost);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "20px" }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    ← 홈으로
                </Link>
            </div>
            <h1>📝 게시물 목록</h1>
            <h2>부제: useQuery 알아보기</h2>
            {/* 데이터 상태 표시 */}
            <StatusBox
                status={isFetching || isPending}
                title="상태"
                description={
                    isPending
                        ? "🔄 게시물 로딩 중...(pending)"
                        : isFetching
                        ? "🔄 백그라운드에서 업데이트 중...(fetching)"
                        : "✅ 최신 데이터(fresh)"
                }
            />

            {/* isPending */}
            <StatusBox
                status={isPending}
                title="isPending"
                description={isPending.toString()}
            />

            {/* isFetching */}
            <StatusBox
                status={isFetching}
                title="isFetching"
                description={isFetching.toString()}
            />
            {/* 컨트롤 버튼들 */}
            <div
                style={{
                    marginBottom: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    flexWrap: "wrap",
                }}
            >
                <button onClick={() => refetch()} disabled={isFetching}>
                    🔄 수동 새로고침 (refetch)
                </button>
                <button
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending}
                >
                    {createPostMutation.isPending
                        ? "생성 중..."
                        : "📝 새 게시물 추가 (createPostMutation.mutate)"}
                </button>
                <button
                    onClick={() =>
                        queryClient.invalidateQueries({ queryKey: ["posts"] })
                    }
                >
                    🗑️ 캐시 무효화(stale 처리, queryClient.invalidateQueries)
                </button>
                <button
                    onClick={() =>
                        queryClient.removeQueries({ queryKey: ["posts"] })
                    }
                >
                    💥 캐시 완전 삭제(queryClient.removeQueries)
                </button>
            </div>

            {/* 게시물 목록 */}
            {isPending ? (
                <div style={{ padding: "20px", textAlign: "center" }}>
                    <h2>🔄 게시물 로딩 중...(pending)</h2>
                    <p>
                        {isFirstFetch
                            ? "첫 번째 로딩입니다."
                            : "gcTime 이후라 메모리에서 삭제되었습니다. 다시 로딩합니다."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "15px" }}>
                    {posts?.map((post) => (
                        <div
                            key={post.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                padding: "15px",
                                backgroundColor: "#f8f9fa",
                            }}
                        >
                            <h3 style={{ margin: "0 0 10px 0" }}>
                                <Link
                                    to={`/posts/${post.id}`}
                                    style={{
                                        textDecoration: "none",
                                        color: "#007bff",
                                    }}
                                >
                                    {post.title}
                                </Link>
                            </h3>
                            <p style={{ margin: "0 0 10px 0", color: "#666" }}>
                                {post.body}
                            </p>
                            <small style={{ color: "#888" }}>
                                작성자 ID: {post.userId}
                            </small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
