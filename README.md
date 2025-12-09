# 개요

이 프로젝트를 Tanstack-Query를 깊게 이해하고 활용법을 학습하기 위해 만들어진 레포지토리입니다.

실제 Tanstack-Query의 동작원리를 UI로 확인할 수 있도록 하여 이후 캐싱이나 최적화가 필요한 웹앱 프로젝트에서 원활히 활용할 수 있도록 하는 것에 목적이 있습니다.

# 기본 셋업

## TanStack Query v5 설치 및 설정

### 1. 패키지 설치

```bash
npm install @tanstack/react-query
```

### 2. QueryProvider 설정

`src/query-provider.tsx` 파일을 생성하여 QueryClient 인스턴스를 생성하고 QueryProvider 컴포넌트를 만듭니다.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1분
        },
    },
});

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
```

### 3. App에 QueryProvider 적용

`src/main.tsx`에서 App 컴포넌트를 QueryProvider로 감쌉니다.

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { QueryProvider } from "@/query-provider";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryProvider>
            <App />
        </QueryProvider>
    </StrictMode>
);
```

## @ Alias 설정

### 1. Vite 설정 (`vite.config.ts`)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
```

### 2. TypeScript 설정 (`tsconfig.app.json`)

```json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": ["./src/*"]
        }
    }
}
```

### 3. 사용 예시

기존 상대 경로 import를 `@` alias로 변경할 수 있습니다:

```tsx
// 기존
import App from "./App.tsx";
import { QueryProvider } from "./query-provider.tsx";
import "./index.css";

// @ alias 사용
import App from "@/App";
import { QueryProvider } from "@/query-provider";
import "@/index.css";
```
