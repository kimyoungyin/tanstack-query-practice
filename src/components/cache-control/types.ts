export type PostsCacheActivity = "active" | "inactive" | "missing";

export type PostsCacheFreshness = "fresh" | "stale" | "missing";

export type PostsStatus = "pending" | "success" | "error" | "missing";

export type PostsFetchStatus = "fetching" | "paused" | "idle" | "missing";

export interface PostsQueryStatus {
    status: PostsStatus;
    fetchStatus: PostsFetchStatus;
    isPending: boolean;
    isFetching: boolean;
}
