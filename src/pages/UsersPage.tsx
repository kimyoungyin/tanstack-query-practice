import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// 임의 데이터 타입 정의
interface User {
    id: number;
    name: string;
    email: string;
    company: string;
    posts: number;
}

// Mock API 함수
const fetchUsers = async (): Promise<User[]> => {
    console.log("👥 Users API 호출됨");

    // 네트워크 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));

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

    // 사용자 목록 조회 쿼리 - Posts와 다른 캐시 설정
    const {
        data: users,
        isLoading,
        isError,
        error,
        isFetching,
        dataUpdatedAt,
        refetch,
    } = useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
        staleTime: 2 * 60 * 1000, // 2분간 fresh (Posts보다 짧음)
        gcTime: 5 * 60 * 1000, // 5분간 캐시 보관 (Posts보다 짧음)
        refetchOnWindowFocus: true, // 윈도우 포커스시 리페치 활성화
        refetchInterval: 30000, // 30초마다 자동 리페치
        refetchIntervalInBackground: false, // 백그라운드에서는 자동 리페치 비활성화
    });

    // 특정 사용자 데이터를 미리 캐시하는 함수
    const handlePrefetchUser = (userId: number) => {
        queryClient.prefetchQuery({
            queryKey: ["user", userId],
            queryFn: async () => {
                console.log(`🔮 사용자 ${userId} 데이터 미리 가져오기`);
                await new Promise((resolve) => setTimeout(resolve, 500));

                const user = users?.find((u) => u.id === userId);
                return user
                    ? {
                          ...user,
                          bio: `${user.name}님의 상세 프로필입니다.`,
                          joinDate: "2023-01-15",
                          lastActive: new Date().toISOString(),
                      }
                    : null;
            },
            staleTime: 5 * 60 * 1000,
        });
    };

    // 캐시 상태 분석
    const handleAnalyzeCache = () => {
        const usersCache = queryClient.getQueryData(["users"]);
        const postsCache = queryClient.getQueryData(["posts"]);
        const allQueries = queryClient.getQueryCache().getAll();

        console.log("=== 캐시 분석 ===");
        console.log("👥 Users 캐시:", usersCache);
        console.log("📝 Posts 캐시:", postsCache);
        console.log("📊 전체 쿼리 개수:", allQueries.length);
        console.log(
            "⏰ Users 마지막 업데이트:",
            new Date(dataUpdatedAt).toLocaleTimeString()
        );

        allQueries.forEach((query) => {
            console.log(
                `🔑 Query Key: ${JSON.stringify(query.queryKey)}, State: ${
                    query.state.status
                }`
            );
        });
    };

    if (isLoading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>👥 사용자 목록 로딩 중...</h2>
                <p>Users 페이지는 Posts보다 로딩이 조금 더 오래 걸립니다.</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
                <h2>❌ 사용자 데이터 로딩 실패</h2>
                <p>{error?.message}</p>
                <button onClick={() => refetch()}>다시 시도</button>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "20px" }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    ← 홈으로
                </Link>
            </div>

            <h1>👥 사용자 목록</h1>

            {/* 상태 및 설정 정보 */}
            <div
                style={{
                    backgroundColor: "#e7f3ff",
                    padding: "15px",
                    borderRadius: "4px",
                    marginBottom: "20px",
                }}
            >
                <h3>⚙️ 이 페이지의 캐시 설정</h3>
                <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                    <li>
                        <strong>staleTime:</strong> 2분 (Posts: 5분)
                    </li>
                    <li>
                        <strong>gcTime:</strong> 5분 (Posts: 10분)
                    </li>
                    <li>
                        <strong>refetchInterval:</strong> 30초마다 자동 새로고침
                    </li>
                    <li>
                        <strong>refetchOnWindowFocus:</strong> 활성화
                    </li>
                </ul>
                <div
                    style={{
                        backgroundColor: isFetching ? "#fff3cd" : "#d4edda",
                        padding: "8px",
                        borderRadius: "4px",
                        marginTop: "10px",
                    }}
                >
                    <strong>현재 상태:</strong>{" "}
                    {isFetching ? "🔄 업데이트 중..." : "✅ 최신 상태"}
                </div>
            </div>

            {/* 컨트롤 버튼들 */}
            <div
                style={{
                    marginBottom: "20px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                }}
            >
                <button onClick={() => refetch()} disabled={isFetching}>
                    🔄 수동 새로고침
                </button>
                <button onClick={handleAnalyzeCache}>📊 캐시 분석</button>
                <button
                    onClick={() =>
                        queryClient.invalidateQueries({ queryKey: ["users"] })
                    }
                >
                    🗑️ Users 캐시 무효화
                </button>
                <button
                    onClick={() =>
                        queryClient.removeQueries({ queryKey: ["users"] })
                    }
                >
                    💥 Users 캐시 완전 삭제
                </button>
            </div>

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
                                        onMouseEnter={() =>
                                            handlePrefetchUser(user.id)
                                        }
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
                                onClick={() => handlePrefetchUser(user.id)}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    backgroundColor: "#e9ecef",
                                    border: "1px solid #ddd",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                🔮 미리 로드
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 학습 노트 */}
            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "4px",
                }}
            >
                <h3>🎓 학습 포인트</h3>
                <ul>
                    <li>
                        <strong>다른 캐시 설정:</strong> Posts와 다른 staleTime,
                        gcTime 적용
                    </li>
                    <li>
                        <strong>자동 리페치:</strong> 30초마다 백그라운드에서
                        데이터 업데이트
                    </li>
                    <li>
                        <strong>Prefetch:</strong> 마우스 호버시 상세 페이지
                        데이터 미리 로드
                    </li>
                    <li>
                        <strong>윈도우 포커스:</strong> 다른 탭에서 돌아올 때
                        자동 새로고침
                    </li>
                    <li>
                        <strong>캐시 비교:</strong> Posts와 Users의 캐시 상태
                        비교 가능
                    </li>
                </ul>
            </div>
        </div>
    );
}
