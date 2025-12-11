import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";

// Mock API 함수들
const fetchPostDetail = async (postId: string): Promise<PostDetail> => {
    console.log(`📖 게시물 ${postId} 상세 정보 로딩...`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 임의 상세 데이터 생성
    const id = parseInt(postId);
    return {
        id,
        title: `게시물 ${id}의 상세 내용`,
        body: `이것은 게시물 ${id}의 상세 내용입니다. TanStack Query의 개별 아이템 캐싱을 테스트하기 위한 페이지입니다. 이 데이터는 목록과는 별도로 캐시됩니다.`,
        userId: Math.floor(Math.random() * 5) + 1,
        author: ["김개발", "이프론트", "박백엔드", "최풀스택", "정데이터"][
            Math.floor(Math.random() * 5)
        ],
        createdAt: "2024-01-15T10:30:00Z",
        tags: ["TanStack Query", "React", "TypeScript", "캐싱"],
        likes: Math.floor(Math.random() * 100) + 10,
        comments: [
            {
                id: 1,
                postId: id,
                author: "댓글러1",
                content: "좋은 글이네요! TanStack Query 정말 유용합니다.",
                createdAt: "2024-01-15T11:00:00Z",
            },
            {
                id: 2,
                postId: id,
                author: "댓글러2",
                content: "캐싱 전략에 대해 더 자세히 알고 싶어요.",
                createdAt: "2024-01-15T11:30:00Z",
            },
        ],
    };
};

const likePost = async (postId: number): Promise<{ likes: number }> => {
    console.log(`👍 게시물 ${postId} 좋아요 추가`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        likes: Math.floor(Math.random() * 100) + 50, // 임의의 새로운 좋아요 수
    };
};

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    // 게시물 상세 정보 조회
    const {
        data: post,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["post", id],
        queryFn: () => fetchPostDetail(id!),
        enabled: !!id, // id가 있을 때만 쿼리 실행
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    // 좋아요 뮤테이션
    const likeMutation = useMutation({
        mutationFn: () => likePost(parseInt(id!)),
        onSuccess: (data) => {
            // Optimistic Update: 즉시 UI 업데이트
            queryClient.setQueryData(
                ["post", id],
                (oldPost: PostDetail | undefined) => {
                    if (!oldPost) return oldPost;
                    return {
                        ...oldPost,
                        likes: data.likes,
                    };
                }
            );

            console.log("✅ 좋아요가 업데이트되었습니다");
        },
        onError: (error) => {
            console.error("❌ 좋아요 실패:", error);
        },
    });

    // 관련 데이터 미리 가져오기
    const handlePrefetchRelated = () => {
        // 다음/이전 게시물 미리 로드
        const currentId = parseInt(id!);
        const nextId = currentId + 1;
        const prevId = currentId - 1;

        if (prevId > 0) {
            queryClient.prefetchQuery({
                queryKey: ["post", prevId.toString()],
                queryFn: () => fetchPostDetail(prevId.toString()),
                staleTime: 5 * 60 * 1000,
            });
        }

        queryClient.prefetchQuery({
            queryKey: ["post", nextId.toString()],
            queryFn: () => fetchPostDetail(nextId.toString()),
            staleTime: 5 * 60 * 1000,
        });

        console.log(`🔮 관련 게시물 (${prevId}, ${nextId}) 미리 로드 완료`);
    };

    // 캐시에서 목록 데이터 확인
    const handleCheckListCache = () => {
        const postsListCache = queryClient.getQueryData(["posts"]);
        const currentPostCache = queryClient.getQueryData(["post", id]);

        console.log("=== 캐시 비교 ===");
        console.log("📝 Posts 목록 캐시:", postsListCache);
        console.log("📖 현재 게시물 캐시:", currentPostCache);

        // 목록에서 현재 게시물 찾기
        if (Array.isArray(postsListCache)) {
            const postInList = (postsListCache as Post[]).find(
                (p) => p.id === parseInt(id!)
            );
            console.log("📋 목록에서 찾은 게시물:", postInList);
            console.log(
                "🔄 상세와 목록 데이터 일치:",
                postInList?.title === post?.title
            );
        }
    };

    if (isLoading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>📖 게시물 상세 정보 로딩 중...</h2>
                <p>게시물 {id}의 상세 정보를 불러오고 있습니다.</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
                <h2>❌ 게시물을 불러올 수 없습니다</h2>
                <p>{error?.message}</p>
                <Link to="/posts">← 게시물 목록으로 돌아가기</Link>
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>❓ 게시물을 찾을 수 없습니다</h2>
                <Link to="/posts">← 게시물 목록으로 돌아가기</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            {/* 네비게이션 */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    ← 홈으로
                </Link>
                <span>|</span>
                <Link to="/posts" style={{ textDecoration: "none" }}>
                    📝 게시물 목록
                </Link>
            </div>

            {/* 상태 표시 */}
            <div
                style={{
                    backgroundColor: isFetching ? "#fff3cd" : "#d4edda",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "20px",
                }}
            >
                <strong>캐시 상태:</strong>{" "}
                {isFetching
                    ? "🔄 백그라운드 업데이트 중..."
                    : "✅ 캐시된 데이터"}
            </div>

            {/* 게시물 내용 */}
            <article
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff",
                }}
            >
                <header style={{ marginBottom: "20px" }}>
                    <h1 style={{ margin: "0 0 10px 0" }}>{post.title}</h1>
                    <div style={{ color: "#666", fontSize: "14px" }}>
                        <span>✍️ {post.author}</span>
                        <span style={{ margin: "0 10px" }}>|</span>
                        <span>
                            📅 {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{ margin: "0 10px" }}>|</span>
                        <span>👍 {post.likes}개</span>
                    </div>
                </header>

                <div style={{ marginBottom: "20px" }}>
                    <p style={{ lineHeight: "1.6" }}>{post.body}</p>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <strong>🏷️ 태그:</strong>
                    <div
                        style={{
                            display: "flex",
                            gap: "5px",
                            marginTop: "5px",
                        }}
                    >
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                style={{
                                    backgroundColor: "#e9ecef",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 액션 버튼들 */}
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "20px",
                    }}
                >
                    <button
                        onClick={() => likeMutation.mutate()}
                        disabled={likeMutation.isPending}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        {likeMutation.isPending ? "⏳" : "👍"} 좋아요
                    </button>
                    <button
                        onClick={handlePrefetchRelated}
                        style={{ padding: "8px 16px" }}
                    >
                        🔮 관련 게시물 미리 로드
                    </button>
                    <button
                        onClick={handleCheckListCache}
                        style={{ padding: "8px 16px" }}
                    >
                        📊 캐시 비교
                    </button>
                </div>
            </article>

            {/* 댓글 섹션 */}
            <section style={{ marginTop: "30px" }}>
                <h3>💬 댓글 ({post.comments.length}개)</h3>
                <div style={{ display: "grid", gap: "10px" }}>
                    {post.comments.map((comment) => (
                        <div
                            key={comment.id}
                            style={{
                                border: "1px solid #eee",
                                borderRadius: "4px",
                                padding: "10px",
                                backgroundColor: "#f8f9fa",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "14px",
                                    color: "#666",
                                    marginBottom: "5px",
                                }}
                            >
                                <strong>{comment.author}</strong>
                                <span style={{ marginLeft: "10px" }}>
                                    {new Date(
                                        comment.createdAt
                                    ).toLocaleString()}
                                </span>
                            </div>
                            <p style={{ margin: "0" }}>{comment.content}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 네비게이션 */}
            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "15px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                }}
            >
                <Link
                    to={`/posts/${parseInt(id!) - 1}`}
                    style={{ textDecoration: "none" }}
                >
                    ← 이전 게시물
                </Link>
                <Link
                    to={`/posts/${parseInt(id!) + 1}`}
                    style={{ textDecoration: "none" }}
                >
                    다음 게시물 →
                </Link>
            </div>

            {/* 학습 노트 */}
            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#e7f3ff",
                    borderRadius: "4px",
                }}
            >
                <h3>🎓 개별 아이템 캐싱 학습 포인트</h3>
                <ul>
                    <li>
                        <strong>개별 쿼리 키:</strong> ['post', id]로 각
                        게시물을 별도 캐시
                    </li>
                    <li>
                        <strong>enabled 옵션:</strong> id가 있을 때만 쿼리 실행
                    </li>
                    <li>
                        <strong>Optimistic Update:</strong> 좋아요 버튼으로 즉시
                        UI 업데이트
                    </li>
                    <li>
                        <strong>Prefetch:</strong> 관련 게시물 미리 로드로 UX
                        향상
                    </li>
                    <li>
                        <strong>캐시 독립성:</strong> 목록과 상세 데이터가
                        별도로 관리됨
                    </li>
                </ul>
            </div>
        </div>
    );
}
