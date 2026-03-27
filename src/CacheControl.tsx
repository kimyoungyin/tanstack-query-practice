import DEFAULT from "@/constants";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
        status: "missing" as "pending" | "success" | "error" | "missing",
        fetchStatus: "missing" as "fetching" | "paused" | "idle" | "missing",
        isPending: false,
        isFetching: false,
    });
    const [postsCacheFreshness, setPostsCacheFreshness] = useState<
        "fresh" | "stale" | "missing"
    >("missing");

    const queryClient = useQueryClient();

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
        const resolveFreshness = (
            hasData: boolean,
            dataUpdatedAt: number,
            isInvalidated: boolean,
        ): "fresh" | "stale" | "missing" => {
            if (!hasData) return "missing";
            if (isInvalidated) return "stale";
            const isStaleByTime = Date.now() - dataUpdatedAt > staleTimeValue;
            return isStaleByTime ? "stale" : "fresh";
        };

        const updatePostsCacheActivity = () => {
            const query = queryClient
                .getQueryCache()
                .find({ queryKey: ["posts"], exact: true });

            if (!query) {
                setPostsQueryStatus({
                    status: "missing",
                    fetchStatus: "missing",
                    isPending: false,
                    isFetching: false,
                });
                setPostsCacheFreshness("missing");
                setPostsCacheActivity("missing");
                return;
            } else {
                const state = query.state;
                const isPendingNow = state.status === "pending";
                const isFetchingNow = state.fetchStatus === "fetching";
                const hasData = state.data != null;
                const freshnessNow = resolveFreshness(
                    hasData,
                    state.dataUpdatedAt,
                    state.isInvalidated,
                );

                setPostsQueryStatus({
                    status: state.status,
                    fetchStatus: state.fetchStatus,
                    isPending: isPendingNow,
                    isFetching: isFetchingNow,
                });
                setPostsCacheFreshness(freshnessNow);
                setPostsCacheActivity(query.isActive() ? "active" : "inactive");
            }
        };

        updatePostsCacheActivity();
        const intervalId = setInterval(updatePostsCacheActivity, 500);
        const unsubscribe = queryClient
            .getQueryCache()
            .subscribe(updatePostsCacheActivity);
        return () => {
            clearInterval(intervalId);
            unsubscribe();
        };
    }, [queryClient, staleTimeValue]);

    return (
        <aside className="control-rail stack-md" aria-label="캐시 옵션 제어 패널">
                <section className="page stack-md">
                    <div className="stack-sm section-heading-row">
                        <h2>staleTime / gcTime 설정</h2>
                        <SectionLearningPoint
                            title="학습 포인트"
                            points={[
                                <>
                                    <strong>staleTime 기준:</strong> `dataUpdatedAt +
                                    staleTime`까지를 <strong>fresh</strong>로 보고,
                                    이후에는 <strong>stale</strong>로 판단합니다.
                                    현재 {staleTimeValue}ms ({staleTimeValue / 1000}초)
                                    입니다.
                                </>,
                                <>
                                    <strong>gcTime 기준:</strong> 쿼리가
                                    <strong> inactive</strong>가 된 뒤 캐시에
                                    얼마나 남겨둘지 결정합니다. 현재 {gcTimeValue}
                                    ms ({gcTimeValue / 1000}초)이며, active 쿼리는
                                    GC 대상이 아닙니다.
                                </>,
                                <>
                                    <strong>자동 재요청 판단:</strong> staleTime은
                                    재요청 트리거(마운트/포커스/리커넥트 등)에서
                                    백그라운드 refetch 여부 판단에 쓰이고, gcTime은
                                    메모리 제거 시점 판단에 쓰입니다.
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
                            type="button"
                            className="button-control button-control--primary"
                            onClick={() => window.location.reload()}
                            aria-label="저장한 staleTime·gcTime으로 페이지 새로고침 (localStorage 반영)"
                        >
                            <span className="button-control__label">
                                저장한 설정으로 새로고침
                            </span>
                            <span className="button-control__method">
                                staleTime / gcTime
                            </span>
                        </button>
                        <button
                            type="button"
                            className="button-control button-control--reset"
                            onClick={resetOptions}
                            aria-label="localStorage의 staleTime·gcTime을 지우고 새로고침"
                        >
                            <span className="button-control__label">
                                저장된 옵션 지우고 새로고침
                            </span>
                            <span className="button-control__method">
                                localStorage 초기화
                            </span>
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
                                "캐시에 해당 쿼리 엔트리 자체가 없으면 이 패널에서는 status/fetchStatus를 '없음'으로 표시합니다.",
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

                <section className="page stack-sm">
                    <div className="section-heading-row">
                        <h3>Posts 캐시 데이터 Freshness</h3>
                        <SectionLearningPoint
                            title="학습 포인트"
                            points={[
                                "Freshness는 데이터 유무 + 쿼리 stale 여부를 함께 봅니다.",
                                "fresh: 데이터가 있고 stale이 아닐 때입니다.",
                                "stale: 데이터가 있지만 staleTime 경과 또는 invalidate로 stale 처리된 상태입니다.",
                                "없음: posts 데이터 자체가 없을 때(쿼리 미생성/삭제/초기 로딩 중 데이터 없음)입니다.",
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
                                ? "posts 데이터가 있고 stale 상태가 아니므로 fresh입니다."
                                : postsCacheFreshness === "stale"
                                  ? "posts 데이터는 있지만 stale입니다. (staleTime 경과 또는 invalidate)"
                                  : "posts 데이터가 없어 Freshness를 계산할 대상이 없습니다."}
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
                                    <strong>active:</strong> `useQuery` 등으로 해당
                                    `queryKey`를 <strong>구독하는 옵저버가 1개 이상</strong>
                                    있을 때입니다. 화면에 마운트된 컴포넌트가 데이터를
                                    “쓰고 있는” 상태에 가깝습니다.
                                </>,
                                <>
                                    <strong>inactive:</strong> 마지막 옵저버가
                                    사라져 <strong>구독자가 0</strong>이 되었을
                                    때입니다. 쿼리/캐시 엔트리는 곧바로 사라지지 않고
                                    `gcTime` 동안 남을 수 있습니다.
                                </>,
                                <>
                                    <strong>다시 active:</strong> 같은 키로 `useQuery`가
                                    다시 마운트되면 inactive였던 캐시를{" "}
                                    <strong>즉시 재사용</strong>할 수 있고, 데이터가
                                    stale이면 백그라운드 refetch 등이 이어질 수 있습니다.
                                </>,
                                <>
                                    <strong>`QueryClient` 필터와의 관계:</strong>{" "}
                                    `getQueriesData` 등의{" "}
                                    <code>type: &quot;active&quot; | &quot;inactive&quot;</code>는
                                    위 구독 여부 기준으로 쿼리를 고릅니다.
                                    `invalidateQueries`의 `refetchType`(기본{" "}
                                    <code>&quot;active&quot;</code>)은{" "}
                                    <strong>별개</strong>로, 무효화 뒤 누구를 refetch할지를
                                    정하는 옵션입니다.
                                </>,
                            ]}
                            footnote={
                                <>
                                    inactive는 “데이터가 틀렸다”가 아니라 “지금은 아무도 구독하지
                                    않는다”는 상태입니다. GC 시점은 `gcTime`으로 조절합니다.
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
                                ? "posts를 구독하는 옵저버(useQuery)가 있을 때."
                                : postsCacheActivity === "inactive"
                                  ? "구독자가 없을 때. 캐시는 gcTime 동안 남을 수 있음."
                                  : "posts 캐시 엔트리가 없거나 아직 만들어지지 않았을 때."}
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
