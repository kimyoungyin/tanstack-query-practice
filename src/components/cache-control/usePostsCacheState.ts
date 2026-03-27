import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
    PostsCacheActivity,
    PostsCacheFreshness,
    PostsQueryStatus,
} from "./types";

const INITIAL_POSTS_QUERY_STATUS: PostsQueryStatus = {
    status: "missing",
    fetchStatus: "missing",
    isPending: false,
    isFetching: false,
};

export default function usePostsCacheState(staleTimeValue: number) {
    const [postsCacheActivity, setPostsCacheActivity] =
        useState<PostsCacheActivity>("missing");
    const [postsQueryStatus, setPostsQueryStatus] = useState<PostsQueryStatus>(
        INITIAL_POSTS_QUERY_STATUS,
    );
    const [postsCacheFreshness, setPostsCacheFreshness] =
        useState<PostsCacheFreshness>("missing");

    const queryClient = useQueryClient();

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
                setPostsQueryStatus(INITIAL_POSTS_QUERY_STATUS);
                setPostsCacheFreshness("missing");
                setPostsCacheActivity("missing");
                return;
            }

            const state = query.state;
            const hasData = state.data != null;
            const freshnessNow = resolveFreshness(
                hasData,
                state.dataUpdatedAt,
                state.isInvalidated,
            );

            setPostsQueryStatus({
                status: state.status,
                fetchStatus: state.fetchStatus,
                isPending: state.status === "pending",
                isFetching: state.fetchStatus === "fetching",
            });
            setPostsCacheFreshness(freshnessNow);
            setPostsCacheActivity(query.isActive() ? "active" : "inactive");
        };

        // 1) mount 직후 현재 상태를 즉시 동기화합니다.
        // 2) QueryCache subscribe로 invalidate/remove 등 이벤트 변화에 즉시 반응합니다.
        // 3) interval 폴링으로 시간 경과에 따른 fresh->stale 전환 누락을 보정합니다.
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

    return {
        postsCacheActivity,
        postsQueryStatus,
        postsCacheFreshness,
    };
}
