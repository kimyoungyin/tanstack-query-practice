배포 링크: [https://tanstack-query-visualizer.netlify.app/](https://tanstack-query-visualizer.netlify.app/)

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

# 1. 현재 페이지 구성과 학습 포인트

## 전체 레이아웃

현재 앱은 3열 학습 UI로 구성됩니다.

- 좌측: `LeftControl` (QueryClient 메서드 실행 패널)
- 중앙: 라우트 페이지(`HomePage`, `PostsPage`)
- 우측: `CacheControl` (상태 시각화/옵션 설정 패널)

## HomePage (`/`)

- `posts` 쿼리를 **구독하지 않는** 허브 페이지입니다.
- `PostsPage`로 이동하는 링크를 제공합니다.
- 이 페이지 자체는 데이터 렌더링보다 학습 흐름 진입점 역할에 가깝습니다.

## PostsPage (`/posts`)

- `["posts"]` 쿼리를 실제로 구독하는 페이지입니다.
- `useQuery({ queryKey: ["posts"] })`를 통해 목록을 렌더링합니다.
- 초기 pending 상태와 캐시 삭제 후 재요청 흐름을 화면에서 확인할 수 있습니다.

## LeftControl (`좌측`)

- `refetchQueries`, `invalidateQueries`, `prefetchQuery`, `resetQueries`, `removeQueries`, `clear`, `setQueryData`를 실행합니다.
- 각 버튼은 `["posts"]` 쿼리 상태/캐시에 서로 다른 영향을 주도록 구성되어 있습니다.

## CacheControl (`우측`)

- 현재는 섹션/훅 분리 구조로 리팩터링되어 가독성을 높였습니다.
- 주요 파일:
  - 섹션 컴포넌트: `src/components/cache-control/*Section.tsx`
  - 공용 학습 모달: `src/components/cache-control/SectionLearningPoint.tsx`
  - 상태 동기화 훅: `src/components/cache-control/usePostsCacheState.ts`
  - 옵션 제어 훅: `src/components/cache-control/useCacheTimingControls.ts`
  - 타입/배럴: `src/components/cache-control/types.ts`, `src/components/cache-control/index.ts`

---

# 2. 상태 전이 시나리오 (버튼 순서 체크리스트)

아래 순서대로 버튼을 눌러 `CacheControl` 표시값이 예상과 일치하는지 확인합니다.

## 전제

- `posts` 구독자는 `PostsPage`만 존재
- `HomePage`는 미구독
- 예시 기준값: `staleTime = 6000ms`, `gcTime = 12000ms`

## 순서

1. 홈(`/`)에서 `clear` 클릭  
   - 기대: `activity = DELETED/MISSING`, `freshness = 없음`, `status/fetchStatus = 없음`

2. 홈(`/`)에서 `prefetchQuery` 클릭  
   - 기대: `activity = INACTIVE`, `status = success`, `fetchStatus = idle`, `freshness = fresh`

3. `staleTime`(약 6초) 대기  
   - 기대: `activity = INACTIVE`, `freshness = stale`

4. `gcTime`까지 추가 대기(총 약 12초)  
   - 기대: `activity = DELETED/MISSING`, `freshness = 없음`

5. `PostsPage` 이동  
   - 기대: `activity = ACTIVE`  
   - 초기엔 `pending/fetching` 가능, 완료 후 `success/idle`

6. `invalidateQueries` 클릭  
   - 기대: stale 마킹 + active인 경우 백그라운드 refetch

7. 즉시 홈(`/`)으로 이동  
   - 기대: `activity = INACTIVE`  
   - stale였던 경우 홈에서도 stale 유지(역전 방지)

8. `removeQueries` 클릭  
   - 기대: `DELETED/MISSING` 및 freshness `없음`

9. 필요 시 `refetchQueries`/`resetQueries`/`setQueryData` 버튼으로 상태 전이를 추가 확인

핵심 체크:

- `fresh -> stale -> 없음` 흐름이 가능해야 함
- `없음`은 stale 때문이 아니라 **inactive + gcTime 경과** 또는 제거 메서드로 발생

---

# 3. 실행 방법

```bash
npm install
npm run dev
```

추가 명령:

- `npm run build`: 타입체크 + 프로덕션 빌드
- `npm run lint`: ESLint 점검
- `npm run preview`: 빌드 결과 프리뷰

---

# 4. 현재 기술 스택

- React 19
- TypeScript 5
- Vite 7
- TanStack Query v5 (`@tanstack/react-query`)
- React Router DOM 7
- React Query Devtools
