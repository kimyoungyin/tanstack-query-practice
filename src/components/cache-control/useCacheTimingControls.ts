import DEFAULT from "@/constants";

export default function useCacheTimingControls() {
    // CacheControl 입력값과 새로고침/초기화 동작을 로컬스토리지 기준으로 캡슐화합니다.
    const staleTimeInputValue =
        localStorage.getItem("staleTime") || String(DEFAULT.STALE_TIME);
    const gcTimeInputValue = localStorage.getItem("gcTime") || String(DEFAULT.GC_TIME);

    const staleTimeValue = Number(staleTimeInputValue);
    const gcTimeValue = Number(gcTimeInputValue);

    const setStaleTime = (value: string) => {
        localStorage.setItem("staleTime", value);
    };

    const setGcTime = (value: string) => {
        localStorage.setItem("gcTime", value);
    };

    const reload = () => {
        window.location.reload();
    };

    const resetOptions = () => {
        localStorage.removeItem("staleTime");
        localStorage.removeItem("gcTime");
        window.location.reload();
    };

    return {
        staleTimeInputValue,
        gcTimeInputValue,
        staleTimeValue,
        gcTimeValue,
        setStaleTime,
        setGcTime,
        reload,
        resetOptions,
    };
}
