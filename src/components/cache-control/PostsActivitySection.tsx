import type { ReactNode } from "react";
import type { PostsCacheActivity } from "./types";

interface PostsActivitySectionProps {
    postsCacheActivity: PostsCacheActivity;
    learningPoint: ReactNode;
}

export default function PostsActivitySection({
    postsCacheActivity,
    learningPoint,
}: PostsActivitySectionProps) {
    return (
        <section className="page stack-sm">
            <div className="section-heading-row">
                <h3>Posts 쿼리 타입 (active / inactive)</h3>
                {learningPoint}
            </div>
            <div className="query-activity-row">
                <span
                    className={`status-pill ${
                        postsCacheActivity === "active"
                            ? "status-success"
                            : postsCacheActivity === "inactive"
                              ? "status-warning"
                              : "status-neutral"
                    }`}
                >
                    {postsCacheActivity === "active"
                        ? "ACTIVE"
                        : postsCacheActivity === "inactive"
                          ? "INACTIVE"
                          : "DELETED/MISSING"}
                </span>
                <span className="muted">
                    {postsCacheActivity === "active"
                        ? "posts를 구독하는 옵저버(useQuery)가 있을 때."
                        : postsCacheActivity === "inactive"
                          ? "구독자가 없을 때. 캐시는 gcTime 동안 남을 수 있음."
                          : "posts 캐시 엔트리가 없거나 아직 만들어지지 않았을 때."}
                </span>
            </div>
            <div className="status-candidates" aria-label="후보 상태">
                <span
                    className={`status-option ${
                        postsCacheActivity === "active" ? "status-option-active" : ""
                    }`}
                >
                    active
                </span>
                <span
                    className={`status-option ${
                        postsCacheActivity === "inactive" ? "status-option-active" : ""
                    }`}
                >
                    inactive
                </span>
                <span
                    className={`status-option ${
                        postsCacheActivity === "missing" ? "status-option-active" : ""
                    }`}
                >
                    deleted/missing
                </span>
            </div>
        </section>
    );
}
