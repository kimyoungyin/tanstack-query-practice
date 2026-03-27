import type { ReactNode } from "react";
import type { PostsQueryStatus } from "./types";

interface PostsQueryStatusSectionProps {
    postsQueryStatus: PostsQueryStatus;
    learningPoint: ReactNode;
}

export default function PostsQueryStatusSection({
    postsQueryStatus,
    learningPoint,
}: PostsQueryStatusSectionProps) {
    return (
        <section className="page stack-sm">
            <div className="section-heading-row">
                <h3>주요 Posts 쿼리 상태 값</h3>
                {learningPoint}
            </div>
            <div className="query-status-grid" aria-label="쿼리 상태 4가지 값">
                <div className="query-status-row">
                    <strong>isPending</strong>
                    <div className="status-candidates">
                        <span
                            className={`status-option ${
                                postsQueryStatus.isPending ? "status-option-active" : ""
                            }`}
                        >
                            true
                        </span>
                        <span
                            className={`status-option ${
                                !postsQueryStatus.isPending ? "status-option-active" : ""
                            }`}
                        >
                            false
                        </span>
                    </div>
                </div>

                <div className="query-status-row">
                    <strong>isFetching</strong>
                    <div className="status-candidates">
                        <span
                            className={`status-option ${
                                postsQueryStatus.isFetching ? "status-option-active" : ""
                            }`}
                        >
                            true
                        </span>
                        <span
                            className={`status-option ${
                                !postsQueryStatus.isFetching ? "status-option-active" : ""
                            }`}
                        >
                            false
                        </span>
                    </div>
                </div>

                <div className="query-status-row">
                    <strong>status</strong>
                    <div className="status-candidates">
                        <span
                            className={`status-option ${
                                postsQueryStatus.status === "pending"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            pending
                        </span>
                        <span
                            className={`status-option ${
                                postsQueryStatus.status === "success"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            success
                        </span>
                        <span
                            className={`status-option ${
                                postsQueryStatus.status === "error"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            error
                        </span>
                        <span
                            className={`status-option ${
                                postsQueryStatus.status === "missing"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            없음
                        </span>
                    </div>
                </div>

                <div className="query-status-row">
                    <strong>fetchStatus</strong>
                    <div className="status-candidates">
                        <span
                            className={`status-option ${
                                postsQueryStatus.fetchStatus === "fetching"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            fetching
                        </span>
                        <span
                            className={`status-option ${
                                postsQueryStatus.fetchStatus === "paused"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            paused
                        </span>
                        <span
                            className={`status-option ${
                                postsQueryStatus.fetchStatus === "idle"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            idle
                        </span>
                        <span
                            className={`status-option ${
                                postsQueryStatus.fetchStatus === "missing"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            없음
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
