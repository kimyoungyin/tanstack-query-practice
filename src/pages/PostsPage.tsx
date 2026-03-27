import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchPosts, isFirstFetch } from "@/fetchPosts";

export default function PostsPage() {
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

            <section className="card stack-md">
                <h2 className="section-title">게시물 목록</h2>
                <p className="muted">
                    캐시 제어 버튼은 좌측 패널로 이동했습니다. 우측 패널에서 상태를
                    확인하며 동작을 비교해보세요.
                </p>
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
