import DEFAULT from "@/constants";

export let isFirstFetch = true;

const fetchPostsClosure = () => {
    let count = 0;

    return async (): Promise<Post[]> => {
        if (isFirstFetch) {
            isFirstFetch = false;
        }
        await new Promise((resolve) => setTimeout(resolve, DEFAULT.API_DELAY));
        count++;
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

export const fetchPosts = fetchPostsClosure();
