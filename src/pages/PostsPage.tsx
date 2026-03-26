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
            queryClient.setQueryData(
                ["posts"],
                (oldPosts: Post[] | undefined) => {
                    return oldPosts ? [newPost, ...oldPosts] : [newPost];
                },
            );
        },
    });

    // 새 게시물 생성 핸들러
    const handleCreatePost = () => {
        const newPost = {
            title: `새 게시물 ${Date.now()}`,
            body: "이것은 useMutation onSuccess 훅을 사용하여 Update 테스트용 게시물입니다.",
            userId: 1,
        };
        createPostMutation.mutate(newPost);
    };

    return (
        <div className="stack-lg">
            <div>
                <Link to="/">
                    ← 홈으로
                </Link>
            </div>
            <div className="stack-sm">
                <h1>게시물 목록</h1>
                <p className="muted">
                    `useQuery`의 pending/fetching 흐름과 캐시 제어 메서드를 함께
                    확인합니다.
                </p>
            </div>

            <section className="card stack-sm">
                <h2 className="section-title">쿼리 상태</h2>
                <StatusBox
                    status={isFetching || isPending}
                    title="전체 상태"
                    description={
                        isPending
                            ? "게시물 로딩 중 (pending)"
                            : isFetching
                              ? "백그라운드 업데이트 중 (fetching)"
                              : "최신 데이터 (fresh)"
                    }
                />

                <StatusBox
                    status={isPending}
                    title="isPending"
                    description={isPending ? "true" : "false"}
                />

                <StatusBox
                    status={isFetching}
                    title="isFetching"
                    description={isFetching ? "true" : "false"}
                />
            </section>

            <section className="card stack-md">
                <h2 className="section-title">캐시 제어</h2>
                <div className="button-row">
                    <button className="button-secondary" onClick={() => refetch()} disabled={isFetching}>
                        수동 새로고침 (refetch)
                    </button>
                    <p className="muted">
                        캐시를 기준으로 쿼리를 다시 실행해 최신 데이터를 가져옵니다.
                    </p>
                </div>

                <div className="button-row">
                    <button
                        className="button-primary"
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending}
                    >
                        {createPostMutation.isPending
                            ? "새 게시물 생성 중..."
                            : "새 게시물 추가 (mutation)"}
                    </button>
                    <p className="muted">
                        생성 성공 시 `queryClient.setQueryData()`로 목록 캐시를 바로
                        갱신합니다.
                    </p>
                </div>

                <div className="button-row">
                    <button
                        className="button-secondary"
                        disabled={!queryClient.getQueryData(["posts"])}
                        onClick={() =>
                            queryClient.invalidateQueries({ queryKey: ["posts"] })
                        }
                    >
                        캐시 무효화 (invalidateQueries)
                    </button>
                    <p className="muted">
                        데이터를 stale 처리하고 활성 쿼리는 재요청합니다.
                    </p>
                </div>

                <div className="button-row">
                    <button
                        className="button-danger-ghost"
                        onClick={() => {
                            queryClient.removeQueries({ queryKey: ["posts"] });
                        }}
                    >
                        캐시 제거 (removeQueries)
                    </button>
                    <p className="muted">
                        캐시 엔트리를 제거하지만, 이미 마운트된 화면의 데이터는 즉시
                        사라지지 않을 수 있습니다.
                    </p>
                </div>

                <div className="button-row">
                    <button
                        className="button-danger"
                        onClick={() =>
                            queryClient.resetQueries({ queryKey: ["posts"] })
                        }
                    >
                        캐시 초기화 및 재요청 (resetQueries)
                    </button>
                    <p className="muted">
                        활성 쿼리 데이터를 리셋한 뒤 즉시 다시 요청합니다.
                    </p>
                </div>
            </section>

            <section className="stack-md">
                <h2>게시물 목록</h2>
                <button className="button-secondary" onClick={() => refetch()} disabled={isFetching}>
                    {isFetching ? "업데이트 중..." : "목록 다시 불러오기"}
                </button>
                {isPending ? (
                    <div className="card stack-sm post-card">
                        <h3>게시물 로딩 중 (pending)</h3>
                        <p className="muted">
                            {isFirstFetch ? (
                                "첫 번째 로딩입니다."
                            ) : (
                                <>
                                    gcTime 이후/캐시 삭제 메서드 호출 후
                                    <br />
                                    메모리에서 삭제되었습니다.
                                    <br />
                                    다시 로딩합니다.
                                </>
                            )}
                        </p>
                    </div>
                ) : (
                    posts?.map((post) => (
                        <article key={post.id} className="card stack-sm post-card">
                            <h3>{post.title}</h3>
                            <p className="muted">{post.body}</p>
                            <small className="muted">
                                작성자 ID: {post.userId}
                            </small>
                        </article>
                    ))
                )}
            </section>
        </div>
    );
}
