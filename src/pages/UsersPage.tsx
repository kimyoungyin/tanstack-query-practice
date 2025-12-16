import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DEFAULT from "@/constants";
import { useEffect, useState, useEffectEvent } from "react";

// Mock API 함수
const fetchUsers = async (): Promise<User[]> => {
    // 네트워크 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, DEFAULT.API_DELAY));

    // 임의 데이터 반환
    return [
        {
            id: 1,
            name: "김개발",
            email: "kim@example.com",
            company: "테크스타트업",
            posts: 15,
        },
        {
            id: 2,
            name: "이프론트",
            email: "lee@example.com",
            company: "웹에이전시",
            posts: 23,
        },
        {
            id: 3,
            name: "박백엔드",
            email: "park@example.com",
            company: "IT대기업",
            posts: 8,
        },
        {
            id: 4,
            name: "최풀스택",
            email: "choi@example.com",
            company: "스타트업",
            posts: 31,
        },
        {
            id: 5,
            name: "정데이터",
            email: "jung@example.com",
            company: "데이터회사",
            posts: 12,
        },
    ];
};

export default function UsersPage() {
    const queryClient = useQueryClient();

    // 사용자 목록 조회 쿼리
    const { data: users, isPending } = useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
    });

    const [userCaches, setUserCaches] = useState<boolean[]>(
        users?.map((user) => {
            return queryClient.getQueryData(["user", user.id]) !== undefined;
        }) ?? new Array(5).fill(false)
    );

    const updateUserCaches = useEffectEvent(() => {
        setUserCaches(
            users?.map((user) => {
                return (
                    queryClient.getQueryData(["user", user.id]) !== undefined
                );
            }) ?? new Array(5).fill(false)
        );
    });

    useEffect(() => {
        const interval = setInterval(() => {
            updateUserCaches();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // 특정 사용자 데이터를 미리 캐시하는 함수
    const handlePrefetchUser = (userId: number) => {
        queryClient.prefetchQuery({
            queryKey: ["user", userId],
            queryFn: async () => {
                await new Promise((resolve) =>
                    setTimeout(resolve, DEFAULT.API_DELAY)
                );

                const user = users?.find((u) => u.id === userId);
                setUserCaches((prev) => {
                    return prev.map((cache, index) =>
                        index === userId - 1 ? true : cache
                    );
                });
                return user
                    ? {
                          ...user,
                          bio: `${user.name}님의 상세 프로필입니다.`,
                          joinDate: "2023-01-15",
                          lastActive: new Date().toISOString(),
                      }
                    : null;
            },
        });
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "20px" }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    ← 홈으로
                </Link>
            </div>

            <h1>👥 사용자 목록</h1>
            <h2>부제: prefetchQuery로 상세 데이터 미리 불러오기</h2>

            {/* 학습 노트 */}
            <div
                style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "4px",
                }}
            >
                <h3>🎓 학습 포인트</h3>
                <p>
                    개별 사용자 쿼리 키: ["user", userId]로 사용자별 상세
                    데이터를 별도 캐시
                </p>
                <p>
                    버튼 기반 prefetch: "🔮 미리 로드" 버튼으로 명시적으로
                    prefetch 트리거
                </p>
                <p>
                    <strong>
                        이미 prefetch된 유저의 상세 정보 데이터(캐시)를 접근하는
                        속도가 일반 접근보다 빠름을 확인
                    </strong>
                </p>
                <p>
                    추후 응용 가능성: hover 시 prefetch를 트리거하도록 설정하면,
                    사용자 몰래 백그라운드에서 클릭하려한 상세 페이지 데이터를
                    미리 로드할 수 있음
                </p>
            </div>
            {isPending ? (
                <div style={{ padding: "20px", textAlign: "center" }}>
                    <h2>🔄 사용자 목록 로딩 중...(pending)</h2>
                </div>
            ) : (
                <>
                    <p>prefetch 캐시 상태: 1초마다 갱신됩니다.</p>
                    {/* 사용자 목록 */}
                    <div style={{ display: "grid", gap: "15px" }}>
                        {users?.map((user) => (
                            <div
                                key={user.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "8px",
                                    padding: "15px",
                                    backgroundColor: "#f8f9fa",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div>
                                        <h3 style={{ margin: "0 0 5px 0" }}>
                                            <Link
                                                to={`/users/${user.id}`}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "#007bff",
                                                }}
                                                // onMouseEnter={() =>
                                                //     handlePrefetchUser(user.id)
                                                // }
                                            >
                                                {user.name}
                                            </Link>
                                        </h3>
                                        <p
                                            style={{
                                                margin: "0 0 5px 0",
                                                color: "#666",
                                            }}
                                        >
                                            {user.email}
                                        </p>
                                        <p
                                            style={{
                                                margin: "0 0 5px 0",
                                                fontSize: "14px",
                                            }}
                                        >
                                            🏢 {user.company}
                                        </p>
                                        <p
                                            style={{
                                                margin: "0",
                                                fontSize: "14px",
                                                color: "#888",
                                            }}
                                        >
                                            📝 게시물 {user.posts}개
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handlePrefetchUser(user.id)
                                        }
                                        disabled={
                                            queryClient.getQueryData([
                                                "user",
                                                user.id,
                                            ]) !== undefined
                                        }
                                        style={{
                                            padding: "4px 8px",
                                            fontSize: "12px",
                                            backgroundColor: userCaches[
                                                user.id - 1
                                            ]
                                                ? "#6c757d"
                                                : "#007bff",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            cursor: userCaches[user.id - 1]
                                                ? "not-allowed"
                                                : "pointer",
                                        }}
                                    >
                                        {userCaches[user.id - 1]
                                            ? "🔮 미리 로드됨"
                                            : "🔮 미리 로드"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
