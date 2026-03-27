import DEFAULT from "@/constants";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";

interface SectionLearningPointProps {
    title: string;
    points: ReactNode[];
    footnote?: ReactNode;
}

function SectionLearningPoint({
    title,
    points,
    footnote,
}: SectionLearningPointProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="section-learning-trigger"
                onClick={() => setIsOpen(true)}
                type="button"
                aria-label={title}
                title={title}
            >
                i
            </button>
            {isOpen ? (
                createPortal(
                    <div
                        className="section-learning-modal-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className="card stack-sm section-learning-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="section-learning-modal-header">
                                <h4>{title}</h4>
                                <button
                                    type="button"
                                    className="section-learning-close"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="학습 포인트 닫기"
                                >
                                    ×
                                </button>
                            </div>
                            <ul>
                                {points.map((point, index) => (
                                    <li key={`${title}-${index}`}>{point}</li>
                                ))}
                            </ul>
                            {footnote ? <p className="muted">{footnote}</p> : null}
                        </div>
                    </div>,
                    document.body,
                )
            ) : null}
        </>
    );
}

export default function CacheControl() {
    const [postsCacheActivity, setPostsCacheActivity] = useState<
        "active" | "inactive" | "missing"
    >("missing");
    const [postsQueryStatus, setPostsQueryStatus] = useState({
        status: "",
        fetchStatus: "idle",
        isPending: false,
        isFetching: false,
    });
    const [postsCacheFreshness, setPostsCacheFreshness] = useState<
        "fresh" | "stale" | "missing"
    >("missing");

    const queryClient = useQueryClient();
    const { pathname } = useLocation();

    const staleTimeValue = Number(
        localStorage.getItem("staleTime") || DEFAULT.STALE_TIME,
    );
    const gcTimeValue = Number(localStorage.getItem("gcTime") || DEFAULT.GC_TIME);

    const resetOptions = () => {
        localStorage.removeItem("staleTime");
        localStorage.removeItem("gcTime");
        window.location.reload();
    };

    useEffect(() => {
        const updatePostsCacheActivity = () => {
            const state = queryClient.getQueryState(["posts"]);
            if (!state) {
                setPostsQueryStatus({
                    status: "",
                    fetchStatus: "idle",
                    isPending: false,
                    isFetching: false,
                });
                setPostsCacheFreshness("missing");
            } else {
                const isPendingNow = state.status === "pending";
                const isFetchingNow = state.fetchStatus === "fetching";
                const hasData = Boolean(queryClient.getQueryData(["posts"]));
                const isFreshByTime =
                    hasData &&
                    Date.now() - state.dataUpdatedAt <= staleTimeValue;

                setPostsQueryStatus({
                    status: state.status,
                    fetchStatus: state.fetchStatus,
                    isPending: isPendingNow,
                    isFetching: isFetchingNow,
                });
                setPostsCacheFreshness(
                    hasData ? (isFreshByTime ? "fresh" : "stale") : "missing",
                );
            }
            if (!state) {
                setPostsCacheActivity("missing");
                return;
            }

            const activeQueries = queryClient.getQueriesData({
                queryKey: ["posts"],
                exact: true,
                type: "active",
            });
            if (activeQueries.length > 0) {
                setPostsCacheActivity("active");
                return;
            }

            const inactiveQueries = queryClient.getQueriesData({
                queryKey: ["posts"],
                exact: true,
                type: "inactive",
            });
            if (inactiveQueries.length > 0) {
                setPostsCacheActivity("inactive");
                return;
            }

            setPostsCacheActivity(pathname === "/posts" ? "active" : "inactive");
        };

        updatePostsCacheActivity();
        const unsubscribe = queryClient
            .getQueryCache()
            .subscribe(updatePostsCacheActivity);
        return () => unsubscribe();
    }, [pathname, queryClient, staleTimeValue]);

    return (
        <aside className="control-rail stack-md" aria-label="캐시 옵션 제어 패널">
                <section className="page stack-md">
                    <div className="stack-sm section-heading-row">
                        <h2>staleTime / gcTime 설정</h2>
                        <SectionLearningPoint
                            title="학습 포인트"
                            points={[
                                <>
                                    <strong>staleTime:</strong> 현재{" "}
                                    {staleTimeValue}ms ({staleTimeValue / 1000}초)
                                </>,
                                <>
                                    <strong>gcTime:</strong> 현재 {gcTimeValue}ms (
                                    {gcTimeValue / 1000}초)
                                </>,
                            ]}
                        />
                    </div>
                    <p className="muted">
                        staleTime/gcTime을 조절한 뒤 새로고침하면 즉시 반영됩니다.
                    </p>

                    <div className="stack-sm">
                        <label htmlFor="staleTime">Stale Time (ms)</label>
                        <input
                            id="staleTime"
                            defaultValue={
                                localStorage.getItem("staleTime") || DEFAULT.STALE_TIME
                            }
                            onChange={(e) =>
                                localStorage.setItem("staleTime", e.target.value)
                            }
                        />
                    </div>

                    <div className="stack-sm">
                        <label htmlFor="gcTime">GC Time (ms)</label>
                        <input
                            id="gcTime"
                            defaultValue={localStorage.getItem("gcTime") || DEFAULT.GC_TIME}
                            onChange={(e) => localStorage.setItem("gcTime", e.target.value)}
                        />
                    </div>

                    <div className="button-row">
                        <button
                            className="button-primary"
                            onClick={() => window.location.reload()}
                        >
                            새로고침하여 옵션 적용
                        </button>
                        <button className="button-danger" onClick={resetOptions}>
                            옵션 초기화 및 새로고침
                        </button>
                    </div>
                </section>

                <section className="page stack-sm">
                    <div className="section-heading-row">
                        <h3>주요 Posts 쿼리 상태 값</h3>
                        <SectionLearningPoint
                            title="학습 포인트"
                            points={[
                                "status는 pending/success/error의 3가지 공식 상태만 가집니다.",
                                "fetchStatus는 fetching/paused/idle 중 하나입니다.",
                                "isPending, isFetching은 위 상태를 읽기 쉽게 만든 파생 플래그입니다.",
                            ]}
                        />
                    </div>
                    <div className="query-status-grid" aria-label="쿼리 상태 4가지 값">
                        <div className="query-status-row">
                            <strong>isPending</strong>
                            <div className="status-candidates">
                                <span
                                    className={`status-option ${
                                        postsQueryStatus.isPending
                                            ? "status-option-active"
                                            : ""
                                    }`}
                                >
                                    true
                                </span>
                                <span
                                    className={`status-option ${
                                        !postsQueryStatus.isPending
                                            ? "status-option-active"
                                            : ""
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
                                        postsQueryStatus.isFetching
                                            ? "status-option-active"
                                            : ""
                                    }`}
                                >
                                    true
                                </span>
                                <span
                                    className={`status-option ${
                                        !postsQueryStatus.isFetching
                                            ? "status-option-active"
                                            : ""
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
                            </div>
                        </div>
                    </div>
                </section>

                <section className="page stack-sm">
                    <div className="section-heading-row">
                        <h3>Posts 캐시 데이터 Freshness</h3>
                        <SectionLearningPoint
                            title="학습 포인트"
                            points={[
                                "Fresh/Stale은 staleTime과 dataUpdatedAt 비교로 판별합니다.",
                                "캐시 엔트리가 없으면 없음 상태로 표시됩니다.",
                            ]}
                        />
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
                                ? "캐시 데이터가 있고 staleTime 내에 있어 fresh 상태입니다."
                                : postsCacheFreshness === "stale"
                                  ? "캐시 데이터가 있으나 staleTime이 지나 stale 상태입니다."
                                  : "posts 캐시 데이터가 현재 메모리에 없습니다."}
                        </span>
                    </div>
                </section>

                <section className="page stack-sm">
                    <div className="section-heading-row">
                        <h3>Posts 쿼리 타입 (active / inactive)</h3>
                        <SectionLearningPoint
                            title="학습 포인트"
                            points={[
                                <>
                                    <strong>Inactive 쿼리:</strong> 기본값
                                    `refetchType: "active"`에서는 즉시 refetch되지
                                    않고 stale 처리만 됩니다.
                                </>,
                                <>
                                    <strong>Query Key 매칭:</strong> 키가 다르거나
                                    `exact: true`면 대상 쿼리를 놓칠 수 있습니다.
                                </>,
                                <>
                                    <strong>`enabled: false` 쿼리:</strong> 자동
                                    refetch 대상이 아니므로 직접 `refetch`해야 합니다.
                                </>,
                                <>
                                    <strong>Race Condition:</strong> mutation 직후
                                    서버 반영 전에 refetch하면 옛 데이터가 다시 올 수
                                    있습니다.
                                </>,
                            ]}
                            footnote={
                                <>
                                    즉시 재요청이 필요하면 `refetchType: "all"`을
                                    검토하고, 보수적으로는 `onSuccess`/`onSettled`에서
                                    invalidate를 호출하는 패턴이 안전합니다.
                                </>
                            }
                        />
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
                                ? "현재 관찰 중인 쿼리입니다."
                                : postsCacheActivity === "inactive"
                                  ? "캐시에 있으나 현재 페이지에서 사용 중이 아닙니다."
                                  : "posts 캐시가 삭제되었거나 아직 생성되지 않았습니다."}
                        </span>
                    </div>
                    <div className="status-candidates" aria-label="후보 상태">
                        <span
                            className={`status-option ${
                                postsCacheActivity === "active"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            active
                        </span>
                        <span
                            className={`status-option ${
                                postsCacheActivity === "inactive"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            inactive
                        </span>
                        <span
                            className={`status-option ${
                                postsCacheActivity === "missing"
                                    ? "status-option-active"
                                    : ""
                            }`}
                        >
                            deleted/missing
                        </span>
                    </div>
                </section>
            </aside>
    );
}
