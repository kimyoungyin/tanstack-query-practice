import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import DEFAULT from "@/constants";

type UserDetail = User & {
    bio: string;
    joinDate: string;
    lastActive: string;
};

// Mock API: 개별 사용자 상세 정보 조회
const fetchUserDetail = async (userId: number): Promise<UserDetail | null> => {
    console.log(`👤 사용자 ${userId} 상세 API 호출`);

    // 네트워크 지연 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, DEFAULT.API_DELAY));

    const baseUsers: User[] = [
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

    const user = baseUsers.find((u) => u.id === userId);

    if (!user) {
        return null;
    }

    return {
        ...user,
        bio: `${user.name}님의 상세 프로필입니다. TanStack Query의 prefetchQuery로 미리 불러온 데이터를 사용하는지 확인할 수 있습니다.`,
        joinDate: "2023-01-15",
        lastActive: new Date().toISOString(),
    };
};

export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const userId = Number(id);

    const {
        data: user,
        isLoading,
        isError,
        error,
        isFetching,
    } = useQuery<UserDetail | null>({
        queryKey: ["user", userId],
        queryFn: () => fetchUserDetail(userId),
        enabled: Number.isFinite(userId),
    });

    // 현재 캐시 상태를 콘솔에서 비교해보는 버튼
    const handleCheckUserCache = () => {
        const cachedUser = queryClient.getQueryData<UserDetail | null>([
            "user",
            userId,
        ]);
        console.log("📦 현재 ['user', userId] 캐시:", cachedUser);
    };

    if (!id || !Number.isFinite(userId)) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>❓ 올바르지 않은 사용자 ID입니다.</h2>
                <Link to="/users">← 사용자 목록으로 돌아가기</Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>👤 사용자 상세 정보 로딩 중...</h2>
                <p>사용자 {userId}의 상세 정보를 불러오고 있습니다.</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
                <h2>❌ 사용자 정보를 불러올 수 없습니다</h2>
                <p>{(error as Error)?.message}</p>
                <Link to="/users">← 사용자 목록으로 돌아가기</Link>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>❓ 사용자를 찾을 수 없습니다</h2>
                <Link to="/users">← 사용자 목록으로 돌아가기</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            {/* 네비게이션 */}
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    ← 홈으로
                </Link>
                <span>|</span>
                <Link to="/users" style={{ textDecoration: "none" }}>
                    👥 사용자 목록
                </Link>
            </div>

            {/* 상태 표시 */}
            <div
                style={{
                    backgroundColor: isFetching ? "#fff3cd" : "#d4edda",
                    padding: "10px",
                    borderRadius: "4px",
                    marginBottom: "20px",
                }}
            >
                <strong>캐시 상태:</strong>{" "}
                {isFetching
                    ? "🔄 백그라운드에서 업데이트 중..."
                    : "✅ 캐시된 데이터(또는 prefetch된 데이터) 사용 중"}
            </div>

            {/* 사용자 상세 정보 */}
            <article
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    backgroundColor: "#fff",
                }}
            >
                <header style={{ marginBottom: "20px" }}>
                    <h1 style={{ margin: "0 0 10px 0" }}>{user.name}</h1>
                    <div style={{ color: "#666", fontSize: "14px" }}>
                        <span>📧 {user.email}</span>
                        <span style={{ margin: "0 10px" }}>|</span>
                        <span>🏢 {user.company}</span>
                        <span style={{ margin: "0 10px" }}>|</span>
                        <span>📝 게시물 {user.posts}개</span>
                    </div>
                </header>

                <div style={{ marginBottom: "20px" }}>
                    <h3>📄 프로필 소개</h3>
                    <p style={{ lineHeight: "1.6" }}>{user.bio}</p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "20px",
                        fontSize: "14px",
                        color: "#555",
                    }}
                >
                    <div>
                        <strong>가입일</strong>
                        <div>
                            📅 {new Date(user.joinDate).toLocaleDateString()}
                        </div>
                    </div>
                    <div>
                        <strong>마지막 활동</strong>
                        <div>
                            ⏱ {new Date(user.lastActive).toLocaleString()}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                    <button
                        onClick={handleCheckUserCache}
                        style={{ padding: "8px 16px" }}
                    >
                        📦 ['user', {userId}] 캐시 확인 (콘솔)
                    </button>
                </div>
            </article>

            {/* 학습 노트 */}
            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#e7f3ff",
                    borderRadius: "4px",
                }}
            >
                <h3>🎓 prefetch 학습 포인트</h3>
                <ul>
                    <li>
                        <strong>쿼리 키 재사용:</strong> Users 목록 페이지에서
                        prefetch할 때 사용한 ["user", userId] 쿼리 키를 그대로
                        사용합니다.
                    </li>
                    <li>
                        <strong>prefetch 여부 확인:</strong> Users 페이지에서
                        사용자에 마우스를 올리거나 "🔮 미리 로드"를 눌러 둔 뒤
                        이 페이지로 이동하면, 첫 렌더에서 캐시된 데이터를 바로
                        사용합니다.
                    </li>
                    <li>
                        <strong>백그라운드 업데이트:</strong> staleTime이
                        지났다면, 캐시 데이터를 보여주면서 isFetching이 true가
                        되고 백그라운드에서 데이터를 새로 가져옵니다.
                    </li>
                    <li>
                        <strong>캐시 검사 버튼:</strong> "📦 ['user', id] 캐시
                        확인" 버튼으로 queryClient.getQueryData를 통해 현재 캐시
                        상태를 콘솔에서 직접 확인할 수 있습니다.
                    </li>
                </ul>
            </div>
        </div>
    );
}
