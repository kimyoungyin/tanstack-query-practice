import type { ReactNode } from "react";
import type { PostsCacheFreshness } from "./types";

interface PostsFreshnessSectionProps {
    postsCacheFreshness: PostsCacheFreshness;
    learningPoint: ReactNode;
}

export default function PostsFreshnessSection({
    postsCacheFreshness,
    learningPoint,
}: PostsFreshnessSectionProps) {
    return (
        <section className="page stack-sm">
            <div className="section-heading-row">
                <h3>Posts 캐시 데이터 Freshness</h3>
                {learningPoint}
            </div>
            <div className="query-activity-row">
                <span
                    className={`status-pill ${
                        postsCacheFreshness === "fresh"
                            ? "status-success"
                            : postsCacheFreshness === "stale"
                              ? "status-warning"
                              : "status-neutral"
                    }`}
                >
                    {postsCacheFreshness === "fresh"
                        ? "Fresh"
                        : postsCacheFreshness === "stale"
                          ? "Stale"
                          : "없음"}
                </span>
                <span className="muted">
                    {postsCacheFreshness === "fresh"
                        ? "posts 데이터가 있고 stale 상태가 아니므로 fresh입니다."
                        : postsCacheFreshness === "stale"
                          ? "posts 데이터는 있지만 stale입니다. (staleTime 경과 또는 invalidate)"
                          : "posts 데이터가 없어 Freshness를 계산할 대상이 없습니다."}
                </span>
            </div>
        </section>
    );
}
