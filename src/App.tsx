import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import PostsPage from "@/pages/PostsPage";
import CacheControl from "@/CacheControl";

function App() {
    return (
        <Router>
            <div className="app-shell">
                <div className="page">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/posts" element={<PostsPage />} />
                        <Route
                            path="*"
                            element={
                                <div className="stack-md">
                                    <h2>페이지를 찾을 수 없습니다</h2>
                                    <p className="muted">
                                        요청하신 페이지가 존재하지 않습니다.
                                    </p>
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
