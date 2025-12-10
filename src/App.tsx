import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import PostsPage from "@/pages/PostsPage";
import UsersPage from "@/pages/UsersPage";
import InfinitePostsPage from "@/pages/InfinitePostsPage";
import PostDetailPage from "@/pages/PostDetailPage";
import CacheControl from "@/CacheControl";

function App() {
    return (
        <Router>
            <div style={{ display: "flex", gap: "20px", minHeight: "100vh" }}>
                <div
                    style={{
                        backgroundColor: "#f8f9fa",
                        color: "#000",
                    }}
                >
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/posts" element={<PostsPage />} />
                        <Route path="/posts/:id" element={<PostDetailPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route
                            path="/infinite-posts"
                            element={<InfinitePostsPage />}
                        />
                        <Route
                            path="*"
                            element={
                                <div
                                    style={{
                                        padding: "20px",
                                        textAlign: "center",
                                    }}
                                >
                                    <h2>❓ 페이지를 찾을 수 없습니다</h2>
                                    <p>요청하신 페이지가 존재하지 않습니다.</p>
                                    <a href="/">홈으로 돌아가기</a>
                                </div>
                            }
                        />
                    </Routes>
                </div>
                <CacheControl />
            </div>
        </Router>
    );
}

export default App;
