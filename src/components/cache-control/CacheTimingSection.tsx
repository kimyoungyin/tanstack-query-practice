import type { ReactNode } from "react";

interface CacheTimingSectionProps {
    staleTimeInputValue: string;
    gcTimeInputValue: string;
    onStaleTimeChange: (value: string) => void;
    onGcTimeChange: (value: string) => void;
    onReload: () => void;
    onResetOptions: () => void;
    learningPoint: ReactNode;
}

export default function CacheTimingSection({
    staleTimeInputValue,
    gcTimeInputValue,
    onStaleTimeChange,
    onGcTimeChange,
    onReload,
    onResetOptions,
    learningPoint,
}: CacheTimingSectionProps) {
    return (
        <section className="page stack-md">
            <div className="stack-sm section-heading-row">
                <h2>staleTime / gcTime 설정</h2>
                {learningPoint}
            </div>
            <p className="muted">
                staleTime/gcTime을 조절한 뒤 새로고침하면 즉시 반영됩니다.
            </p>

            <div className="stack-sm">
                <label htmlFor="staleTime">Stale Time (ms)</label>
                <input
                    id="staleTime"
                    defaultValue={staleTimeInputValue}
                    onChange={(e) => onStaleTimeChange(e.target.value)}
                />
            </div>

            <div className="stack-sm">
                <label htmlFor="gcTime">GC Time (ms)</label>
                <input
                    id="gcTime"
                    defaultValue={gcTimeInputValue}
                    onChange={(e) => onGcTimeChange(e.target.value)}
                />
            </div>

            <div className="button-row">
                <button
                    type="button"
                    className="button-control button-control--primary"
                    onClick={onReload}
                    aria-label="저장한 staleTime·gcTime으로 페이지 새로고침 (localStorage 반영)"
                >
                    <span className="button-control__label">
                        저장한 설정으로 새로고침
                    </span>
                    <span className="button-control__method">staleTime / gcTime</span>
                </button>
                <button
                    type="button"
                    className="button-control button-control--reset"
                    onClick={onResetOptions}
                    aria-label="localStorage의 staleTime·gcTime을 지우고 새로고침"
                >
                    <span className="button-control__label">
                        저장된 옵션 지우고 새로고침
                    </span>
                    <span className="button-control__method">localStorage 초기화</span>
                </button>
            </div>
        </section>
    );
}
