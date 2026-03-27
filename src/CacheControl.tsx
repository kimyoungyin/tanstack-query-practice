import DEFAULT from "@/constants";
import {
    CacheTimingSection,
    PostsActivitySection,
    PostsFreshnessSection,
    PostsQueryStatusSection,
    SectionLearningPoint,
} from "@/components/cache-control";
import type {
    PostsCacheActivity,
    PostsCacheFreshness,
    PostsQueryStatus,
} from "@/components/cache-control";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function CacheControl() {
    const [postsCacheActivity, setPostsCacheActivity] = useState<PostsCacheActivity>(
        "missing",
    );
    const [postsQueryStatus, setPostsQueryStatus] = useState<PostsQueryStatus>({
        status: "missing",
        fetchStatus: "missing",
        isPending: false,
        isFetching: false,
    });
    const [postsCacheFreshness, setPostsCacheFreshness] =
        useState<PostsCacheFreshness>("missing");

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
        ): PostsCacheFreshness => {
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
                <CacheTimingSection
                    staleTimeInputValue={
                        localStorage.getItem("staleTime") || String(DEFAULT.STALE_TIME)
                    }
                    gcTimeInputValue={localStorage.getItem("gcTime") || String(DEFAULT.GC_TIME)}
                    onStaleTimeChange={(value) => localStorage.setItem("staleTime", value)}
                    onGcTimeChange={(value) => localStorage.setItem("gcTime", value)}
                    onReload={() => window.location.reload()}
                    onResetOptions={resetOptions}
                    learningPoint={
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
                    }
                />

                <PostsQueryStatusSection
                    postsQueryStatus={postsQueryStatus}
                    learningPoint={
                        <SectionLearningPoint
                            title="학습 포인트"
                            points={[
                                "status는 pending/success/error의 3가지 공식 상태만 가집니다.",
                                "fetchStatus는 fetching/paused/idle 중 하나입니다.",
                                "isPending, isFetching은 위 상태를 읽기 쉽게 만든 파생 플래그입니다.",
                                "캐시에 해당 쿼리 엔트리 자체가 없으면 이 패널에서는 status/fetchStatus를 '없음'으로 표시합니다.",
                            ]}
                        />
                    }
                />

                <PostsFreshnessSection
                    postsCacheFreshness={postsCacheFreshness}
                    learningPoint={
                        <SectionLearningPoint
                            title="학습 포인트"
                            points={[
                                "Freshness는 데이터 유무 + 쿼리 stale 여부를 함께 봅니다.",
                                "fresh: 데이터가 있고 stale이 아닐 때입니다.",
                                "stale: 데이터가 있지만 staleTime 경과 또는 invalidate로 stale 처리된 상태입니다.",
                                "없음: posts 데이터 자체가 없을 때(쿼리 미생성/삭제/초기 로딩 중 데이터 없음)입니다.",
                            ]}
                        />
                    }
                />

                <PostsActivitySection
                    postsCacheActivity={postsCacheActivity}
                    learningPoint={
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
                    }
                />
            </aside>
    );
}
