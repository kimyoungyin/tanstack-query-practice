import DEFAULT from "@/constants";

export default function CacheControl() {
    const staleTimeValue = Number(
        localStorage.getItem("staleTime") || DEFAULT.STALE_TIME,
    );
    const gcTimeValue = Number(localStorage.getItem("gcTime") || DEFAULT.GC_TIME);

    const resetOptions = () => {
        localStorage.removeItem("staleTime");
        localStorage.removeItem("gcTime");
        window.location.reload();
    };

    return (
        <aside className="page stack-md">
            <div className="stack-sm">
                <h2>캐시 옵션 제어</h2>
                <p className="muted">
                    값을 변경한 뒤 새로고침하면 Query 옵션에 반영됩니다.
                </p>
            </div>

            <div className="card stack-sm">
                <h3>학습 포인트</h3>
                <ul>
                    <li>
                        <strong>staleTime:</strong> 데이터가 "신선한" 상태로
                        유지되는 시간 (현재 {staleTimeValue}ms /{" "}
                        {staleTimeValue / 1000}초)
                    </li>
                    <li>
                        <strong>gcTime:</strong> 캐시가 메모리에 보관되는 시간
                        (현재 {gcTimeValue}ms / {gcTimeValue / 1000}초)
                    </li>
                    <li>
                        <strong>isPending:</strong> 첫 페칭 혹은 gcTime 이후라
                        메모리에서 삭제되었을 때 true, 그 외 false
                    </li>
                    <li>
                        <strong>isFetching:</strong> staleTime 이후라 메모리에서
                        삭제되었을 때 백그라운드 페칭 중이므로 true, 그 외 false
                    </li>
                    <li>
                        <strong>Mutation:</strong> 데이터 변경 후 캐시 업데이트
                    </li>
                    <li>
                        <strong>
                            다른 페이지로 이동 후 돌아오면 캐시된 데이터를 즉시
                            표시
                        </strong>
                    </li>
                </ul>
            </div>

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
                    onChange={(e) =>
                        localStorage.setItem("gcTime", e.target.value)
                    }
                />
            </div>

            <div className="button-row">
                <button className="button-primary" onClick={() => window.location.reload()}>
                    새로고침하여 옵션 적용
                </button>
                <button className="button-danger" onClick={resetOptions}>
                    옵션 초기화 및 새로고침
                </button>
            </div>
        </aside>
    );
}
