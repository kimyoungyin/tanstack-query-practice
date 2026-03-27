배포 링크: [hhttps://tanstack-query-visualizer.netlify.app/](https://tanstack-query-visualizer.netlify.app/)

# 개요

이 프로젝트를 Tanstack-Query를 깊게 이해하고 활용법을 학습하기 위해 만들어진 레포지토리입니다.

실제 Tanstack-Query의 동작원리를 UI로 확인할 수 있도록 하여 이후 캐싱이나 최적화가 필요한 웹앱 프로젝트에서 원활히 활용할 수 있도록 하는 것에 목적이 있습니다.

또한 이 레포지토리에서는 TanStack Query의 **주요 메서드와 옵션**을 실제 코드와 화면을 통해 함께 익힐 수 있습니다.

- `useQuery`, `useMutation`: 서버 상태 조회와 변경, 로딩/에러 상태 관리
- `queryClient.invalidateQueries`, `removeQueries`, `resetQueries`, `clear`: 캐시 무효화·삭제·리셋
- `staleTime`, `gcTime`: 캐시 수명과 가비지 컬렉션 시점 제어
- `isPending`, `isFetching`: 초기 로딩 vs 백그라운드 리페치 상태 구분

# 0. Tanstack Query 실습 전 주요 개념 정리

## Tanstack Query의 필요성

다들 상태 관리 라이브러리(zustand, recoil, redux 등)를 사용해보신 적이 있으신가요?

위와 같은 상태 관리 라이브러리들은 '클라이언트 단 상태(모달 오픈 여부 등)'는 관리하기 유용하지만, '비동기 및 서버 상태 관리'에는 적합하지 않다는 단점이 있었습니다(공식 문서 왈).

여기서 말하는 서버 상태는 어떤 특징이 있을까요? 대략 정리하면 다음과 같습니다.

- 클라이언트에서 제어 및 소유하지 않는 위치에서 관리됨
- 비동기 API가 필요
- 소유권 공유로 인해 '사용자가 모르는 사이에' 다른 사용자가 변경(mutate)할 수 있음(즉, 신선하지 않은 상태일 수 있음)

이러한 특징을 잘 핸들링하기 위해 Tanstack Query는 Context API를 기반으로 하여 적절한 캐싱 전략을 사용하여 **서버 상태**를 잘 관리할 수 있도록 합니다.

> Tanstack Query는 캐싱 기반이기에, useContext와 같은 훅이 막을 수 없는 '하위 컴포넌트가 전부 렌더링되는 현상'을 피해갈 수 있습니다.

개발하려는 서비스가 백엔드(서버 측)가 필요하고 이들의 상태를 잘 추상화된 코드로 관리하여 UX 또한 개선하고 싶다면,

Tanstack Query는 좋은 선택이 될 것입니다.

## stale-while-revalidate(SWR)와 Tanstack-Query

이는 Tanstack-Query에서만 제공하는 툴이 아니라 HTTP에서도 사용되기도 하는 '캐싱 전략'입니다.

SWR의 핵심을 한 마디로 정리하면 다음과 같습니다.

> 오래된 데이터가 데이터가 없는 것보다 낫다!

SWR 전략에서는 데이터가 'stale(상함, 오래됨)'하다고 판단되었을 때 바로 stale한 데이터를 버리고 로딩 상태로 돌입하지 않습니다.

'백그라운드'에서 fresh한 데이터를 받아오는 동안(Fetching)에는 stale한 데이터(캐시)를 보여주다가, fetch가 종료(idle)되면 자연스럽게 stale한 데이터를 fresh한 데이터로 바꿔치기 해주는 것이죠.

> 나중에 실습을 통해 자세히 알 수 있겠지만, 캐싱된 데이터가 있다는 가정하에 백그라운드에서 fresh한 데이터를 background에서 가져오고 있는지는 useQuery와 같은 훅이 return하는 값인 `isFetching`값으로 알 수 있습니다.

이는 결국 **로딩 상태를 유저가 경험하는 것을 최소화하고, 항상 데이터를 보고 있을 수 있다**는 측면에서 UX 측면에서도 굉장히 좋은 방식이라고도 할 수 있습니다.

## staleTime과 gcTime

queryClient, useQuery 등 Tanstack-Query에서 제공하는 클래스 및 훅의 인자로 `staleTime`과 `gcTime`을 설정할 수 있는데,

이는 Tanstack Query에서 캐싱된 데이터를 관리하는데 핵심입니다.

- `staleTime`: `staleTime`이 지나기 전까지 쿼리 데이터를 '신선(fresh)'하다고 간주합니다. 반대로 `staleTime`이 지나면 데이터는 '상한 것(stale)이라 판단하고, 해당 쿼리를 사용하는 컴포넌트에 다시 접근했을 때 백그라운드에서 서버에 쿼리 데이터를 다시 요청합니다.
- `gcTime`: 쿼리 데이터가 현재 스크린에서 사용될 때는 'active' 상태이지만, 사용되지 않으면 'inactive' 상태로 변경됩니다. 이 상태에서 `gcTime`이 지나기 전까지는 쿼리 데이터가 캐싱되어 존재합니다. 하지만 `gcTime` 이상 이 데이터를 사용하지 않으면 더 이상 메모리에 저장할 필요가 없다고 판단하여 메모리에서 캐시를 제거합니다. 즉, `가비지 콜렉팅`을 수행해야하는 시간이라고 볼 수 있습니다.

보통의 경우에는 staleTime보다 gcTime을 길게 설정하여, "어느 정도는 데이터를 캐싱하여 저장하여 보여주다가, 특정 시간 이상 캐시를 사용하지 않으면 가비지 콜렉팅을 통해 메모리에서 제거하는" 방식을 사용합니다.

캐시를 위와 같은 설정을 통해 관리하면 **불필요한 API 호출을 방지**하여 서버 부담을 줄여준다는 장점이 있지만, **데이터의 실시간성이 부족하고, 클라이언트 측 부하(메모리 과다)**가 있을 수 있어 적절히 사용해야 한다는 것을 꼭 염두해야 합니다.

### 이 프로젝트에서는...

staleTime과 gcTime을 커스텀으로 설정할 수 있도록 하여, 데이터가 언제 상하고 가비지 콜렉팅되는지 주기적으로 추적하는데 도움이 되도록 하였습니다.

일반적인 서비스와 다르게 '초 단위'로 짧게 설정하여, 실시간으로 캐싱된 데이터를 추적해보세요!

---

# 2. 현재 페이지 구성과 학습 포인트

## HomePage (`/`)

- TanStack Query 실습의 **허브 페이지**입니다.
- 주요 기능:
    - 전체 캐시를 무효화/완전 삭제하는 버튼 제공
    - `["posts"]` 쿼리 캐시 유무를 `StatusBox`로 시각화
    - `PostsPage`로 이동하는 네비게이션 제공

## PostsPage (`/posts`)

- **기본 개념 학습용 메인 페이지**입니다.
- 학습 포인트:
    - `useQuery`로 게시물 목록 로딩
    - `isPending`, `isFetching` 상태를 `StatusBox`로 시각화
    - `queryClient.invalidateQueries`, `removeQueries`, `resetQueries` 버튼으로 캐시 무효화/삭제/리셋 동작 비교
    - `useMutation` + `queryClient.setQueryData`로 새 게시물 추가 시 캐시 업데이트

---

# 3. 상태 전이 시나리오 (회귀 체크리스트)

아래 시나리오는 `CacheControl` 패널의 상태 표시가 TanStack Query v5 동작과 일치하는지 검증하기 위한 기준입니다.

## 전제 조건

- `["posts"]` 쿼리는 `PostsPage`에서만 구독됩니다.
- `HomePage`는 `posts` 쿼리를 구독하지 않습니다.
- 기본 예시 값: `staleTime = 6000ms`, `gcTime = 12000ms`
- Freshness 표기 기준:
    - `fresh`: 데이터가 있고 stale이 아님
    - `stale`: 데이터가 있지만 staleTime 경과 또는 invalidated
    - `없음`: 데이터 자체가 없음(미생성/삭제/GC 완료)

## 시나리오 A: 홈에서 prefetch 후 시간 경과

1. 홈(`/`) 진입 직후
    - 기대값:
        - activity: `DELETED/MISSING`
        - freshness: `없음`
        - status/fetchStatus: `없음`
2. `prefetchQuery` 클릭
    - 기대값:
        - activity: `INACTIVE`
        - status: `success`
        - fetchStatus: 완료 후 `idle`
        - freshness: `fresh`
3. `staleTime` 경과 대기(약 6초)
    - 기대값:
        - activity: `INACTIVE`
        - freshness: `stale`
4. `gcTime`까지 추가 대기(총 약 12초)
    - 기대값:
        - activity: `DELETED/MISSING`
        - freshness: `없음`
        - status/fetchStatus: `없음`

## 시나리오 B: posts에서 stale 만든 뒤 홈으로 이동

1. `clear` 클릭으로 시작 상태 초기화
2. `/posts` 이동 후 초기 요청 완료 대기
    - 기대값:
        - activity: `ACTIVE`
        - freshness: `fresh`
3. `/posts`에서 `invalidateQueries` 클릭
    - 기대값:
        - active 구독 중이므로 백그라운드 refetch 가능
        - 최종 freshness는 `stale` 또는 빠르게 재검증 후 `fresh`로 복귀 가능
4. 즉시 홈(`/`) 이동
    - 기대값:
        - activity: `INACTIVE`
        - stale 상태였던 경우 홈에서도 `stale` 유지
        - 홈 이동 시 `stale -> fresh` 역전이 발생하지 않아야 함

## 시나리오 C: 주요 메서드별 기대 변화

- `refetchQueries`
    - 매칭 쿼리를 즉시 재요청합니다.
    - active/inactive 여부와 옵션에 따라 실제 네트워크 요청 대상이 달라질 수 있습니다.
- `invalidateQueries`
    - 쿼리를 stale로 마킹합니다.
    - 기본값에서는 active 쿼리만 즉시 refetch합니다.
- `prefetchQuery`
    - 미리 캐시를 채우며, 홈에서는 보통 `INACTIVE + fresh/stale` 흐름을 확인할 수 있습니다.
- `resetQueries`
    - 쿼리 상태를 초기화하고 active 쿼리는 다시 요청할 수 있습니다.
- `removeQueries`
    - 매칭 쿼리 엔트리를 캐시에서 제거하여 `없음` 상태로 전환됩니다.
- `clear`
    - Query/Mutation 캐시 전체를 비우며 `posts`도 `없음` 상태가 됩니다.

## 체크 포인트 요약

- `fresh -> stale -> 없음` 흐름은 가능해야 합니다.
- `삭제(없음)`은 stale 때문이 아니라 `inactive + gcTime` 조건으로 발생합니다.
- `HomePage`는 미구독 페이지이므로 activity는 `INACTIVE` 또는 `DELETED/MISSING`이 정상입니다.

---

# 1. 기본 셋업

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
    </StrictMode>,
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
