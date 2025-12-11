interface Post {
    id: number;
    title: string;
    body: string;
    userId: number;
}

interface PostDetail {
    id: number;
    title: string;
    body: string;
    userId: number;
    author: string;
    createdAt: string;
    tags: string[];
    likes: number;
    comments: Comment[];
}

interface User {
    id: number;
    name: string;
    email: string;
    company: string;
    posts: number;
}

interface Comment {
    id: number;
    postId: number;
    author: string;
    content: string;
    createdAt: string;
}
