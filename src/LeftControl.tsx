import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { fetchPosts } from "@/fetchPosts";

const createPost = async (newPost: Omit<Post, "id">): Promise<Post> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
        id: Date.now(),
        ...newPost,
    };
};

interface ControlAction {
    title: string;
    method: string;
    buttonClassName: string;
    onClick: () => void;
    disabled?: boolean;
}

function ControlActionRow({
    title,
    method,
    buttonClassName,
    onClick,
    disabled,
}: ControlAction) {
    return (
        <div className="button-row">
            <button
                type="button"
                className={`button-control ${buttonClassName}`}
                onClick={onClick}
                disabled={disabled}
                aria-label={`${title} (${method})`}
            >
                <span className="button-control__label">{title}</span>
                <span className="button-control__method">{method}</span>
            </button>
        </div>
    );
}

function SectionLearningPoint({
    title,
    points,
    sections,
}: {
    title: string;
    points: ReactNode[];
    footnote?: ReactNode;
    sections?: Array<{ heading: string; points: ReactNode[] }>;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className="section-learning-trigger"
                onClick={() => setIsOpen(true)}
                type="button"
                aria-label={title}
                title={title}
            >
                i
            </button>
            {isOpen
                ? createPortal(
                      <div
                          className="section-learning-modal-overlay"
                          role="dialog"
                          aria-modal="true"
                          aria-label={title}
                          onClick={() => setIsOpen(false)}
                      >
                          <div
                              className="card stack-sm section-learning-modal"
                              onClick={(e) => e.stopPropagation()}
                          >
                              <div className="section-learning-modal-header">
                                  <h4>{title}</h4>
                                  <button
                                      type="button"
                                      className="section-learning-close"
                                      onClick={() => setIsOpen(false)}
                                      aria-label="학습 포인트 닫기"
                                  >
                                      ×
                                  </button>
                              </div>
                              {sections && sections.length > 0 ? (
                                  <div className="stack-sm">
                                      {sections.map((section) => (
                                          <div
                                              key={`${title}-${section.heading}`}
                                              className="stack-sm"
                                          >
                                              <h5>{section.heading}</h5>
                                              <ul>
                                                  {section.points.map(
                                                      (point, index) => (
                                                          <li
                                                              key={`${title}-${section.heading}-${index}`}
                                                          >
                                                              {point}
                                                          </li>
                                                      ),
                                                  )}
                                              </ul>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <ul>
                                      {points.map((point, index) => (
                                          <li key={`${title}-${index}`}>
                                              {point}
                                          </li>
                                      ))}
                                  </ul>
                              )}
                          </div>
                      </div>,
                      document.body,
                  )
                : null}
        </>
    );
}

export default function LeftControl() {
    const queryClient = useQueryClient();

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: (newPost) => {
            queryClient.setQueryData(
                ["posts"],
                (oldPosts: Post[] | undefined) => {
                    return oldPosts ? [newPost, ...oldPosts] : [newPost];
                },
            );
        },
    });

    const handleCreatePost = () => {
        const newPost = {
            title: `새 게시물 ${Date.now()}`,
            body: "이것은 useMutation onSuccess 훅을 사용하여 Update 테스트용 게시물입니다.",
            userId: 1,
        };
        createPostMutation.mutate(newPost);
    };

    const postScopedActions: ControlAction[] = [
        {
            title: "지금 서버에서 다시 가져오기",
            method: "refetchQueries",
            buttonClassName: "button-control--refetch",
            onClick: () =>
                queryClient.refetchQueries({
                    queryKey: ["posts"],
                }),
        },
        {
            title: "데이터를 stale로 표시하고 갱신 유도",
            method: "invalidateQueries",
            buttonClassName: "button-control--invalidate",
            onClick: () =>
                queryClient.invalidateQueries({ queryKey: ["posts"] }),
        },
        {
            title: "화면 전 전에 posts 미리 채우기",
            method: "prefetchQuery",
            buttonClassName: "button-control--prefetch",
            onClick: () =>
                queryClient.prefetchQuery({
                    queryKey: ["posts"],
                    queryFn: fetchPosts,
                }),
        },
        {
            title: "초기 상태로 되돌린 뒤 다시 요청",
            method: "resetQueries",
            buttonClassName: "button-control--reset",
            onClick: () => queryClient.resetQueries({ queryKey: ["posts"] }),
        },
        {
            title: "posts 캐시 항목만 삭제",
            method: "removeQueries",
            buttonClassName: "button-control--remove",
            onClick: () => queryClient.removeQueries({ queryKey: ["posts"] }),
        },
        {
            title: "쿼리·뮤테이션 캐시 전부 비우기",
            method: "clear",
            buttonClassName: "button-control--clear",
            onClick: () => queryClient.clear(),
        },
        {
            title: createPostMutation.isPending
                ? "새 글 추가 중…"
                : "새 글 하나 넣고 캐시만 갱신",
            method: "setQueryData",
            buttonClassName: "button-control--primary",
            onClick: handleCreatePost,
            disabled: createPostMutation.isPending,
        },
    ];

    return (
        <aside className="left-rail stack-md" aria-label="좌측 제어 패널">
            <section className="page stack-md">
                <div className="section-heading-row">
                    <h2 className="section-title">
                        주요 캐시 제어 메서드(Posts)
                    </h2>
                    <SectionLearningPoint
                        title="주요 메서드 동작 방식"
                        points={[]}
                        sections={[
                            {
                                heading: "refetchQueries",
                                points: [
                                    <>
                                        <strong>핵심 동작:</strong> 기본값
                                        `type: "all"` 기준으로 캐시에 있는 매칭
                                        쿼리를 active/inactive 구분 없이{" "}
                                        <strong>즉시 refetch</strong>합니다.
                                    </>,
                                    <>
                                        <strong>작동하지 않는 경우:</strong>{" "}
                                        매칭된 쿼리 캐시가 아예 없으면 refetch
                                        대상이 없어 요청이 발생하지 않습니다.
                                    </>,
                                    <>
                                        <strong>차이점:</strong> invalidate처럼
                                        stale 마킹 후 대기가 아니라,{" "}
                                        <strong>지금 바로 동기화</strong>가
                                        목적입니다.
                                    </>,
                                ],
                            },
                            {
                                heading: "invalidateQueries",
                                points: [
                                    <>
                                        <strong>핵심 동작:</strong> 매칭되는
                                        쿼리를 <strong>stale</strong>로
                                        표시하고, active 쿼리는 즉시
                                        refetch합니다.
                                    </>,
                                    <>
                                        <strong>중요 포인트:</strong> 기본
                                        동작은 inactive 쿼리를 즉시 refetch하지
                                        않고 stale 상태로만 남겨둡니다.
                                    </>,
                                    <>
                                        <strong>요청 처리:</strong> 관련 쿼리가
                                        fetching 중이면 기존 요청을 취소하고
                                        최신 요청 흐름으로 맞춥니다.
                                    </>,
                                ],
                            },
                            {
                                heading: "prefetchQuery",
                                points: [
                                    <>
                                        <strong>핵심 동작:</strong> 사용자 이동
                                        전에 데이터를{" "}
                                        <strong>미리 캐시에 준비</strong>
                                        하는 선요청 용도입니다.
                                    </>,
                                    <>
                                        <strong>staleTime 존중:</strong> 기존
                                        캐시가 fresh하면 네트워크 요청을 생략할
                                        수 있습니다.
                                    </>,
                                    <>
                                        <strong>반환값:</strong>{" "}
                                        `Promise&lt;void&gt;` 이므로 데이터를
                                        직접 받으려면 `fetchQuery` 가 더
                                        적합합니다.
                                    </>,
                                ],
                            },
                            {
                                heading: "resetQueries",
                                points: [
                                    <>
                                        <strong>핵심 동작:</strong> 매칭 쿼리
                                        상태를 초기 상태로 되돌리고, active
                                        쿼리는 다시 fetch를 시작합니다.
                                    </>,
                                    <>
                                        <strong>invalidate와의 차이:</strong>{" "}
                                        invalidate는 기존 데이터를 유지한 채
                                        stale 처리하지만, reset은{" "}
                                        <strong>초기 상태로 리셋</strong>합니다.
                                    </>,
                                    <>
                                        <strong>initialData 사용 시:</strong>{" "}
                                        설정된 `initialData`가 있다면 그 값
                                        기준으로 복원된 뒤 재검증 흐름이
                                        진행됩니다.
                                    </>,
                                ],
                            },
                            {
                                heading: "removeQueries",
                                points: [
                                    <>
                                        <strong>핵심 동작:</strong>{" "}
                                        `removeQueries`는 갱신 계열이 아니라{" "}
                                        <strong>
                                            queryCache에서 조용히 삭제
                                        </strong>
                                        하는 명령입니다.
                                    </>,
                                    <>
                                        <strong>침묵의 삭제:</strong> 캐시
                                        엔트리만 제거하며 Observer에 "다시
                                        그려/다시 fetch"를 강제하는 신호를
                                        보내는 방식이 아닙니다.
                                    </>,
                                    <>
                                        <strong>결과:</strong> data/error/status
                                        등 저장된 상태는 캐시에서 사라지지만,
                                        화면은 기존 스냅샷을 잠시 유지해 "안
                                        지워진 것처럼" 보일 수 있습니다.
                                    </>,
                                    <>
                                        <strong>
                                            자동 refetch가 약한 이유:
                                        </strong>{" "}
                                        invalidate처럼 stale 기반 트리거를 거는
                                        것이 아니라 "대상 자체를 삭제"하므로,
                                        삭제 직후에는 자동 refetch 흐름이 기대와
                                        다르게 보일 수 있습니다.
                                    </>,
                                    <>
                                        <strong>실무 팁:</strong> 삭제 후 UI를
                                        초기 상태로 확실히 돌리려면
                                        `resetQueries`를 조합하거나, remove 후
                                        화면 전환/리렌더 트리거를 함께 사용하는
                                        편이 안전합니다.
                                    </>,
                                ],
                            },
                            {
                                heading: "clear (queryClient.clear)",
                                points: [
                                    <>
                                        <strong>핵심 동작:</strong> 키를
                                        조준하는 `removeQueries`와 달리,
                                        `QueryClient`가 관리하는{" "}
                                        <strong>
                                            QueryCache·MutationCache 전체
                                        </strong>
                                        를 비우는 <strong>전역 초기화</strong>에
                                        가깝습니다.
                                    </>,
                                    <>
                                        <strong>remove와의 차이:</strong>{" "}
                                        `removeQueries`는 필터에 맞는 쿼리만
                                        제거하고 뮤테이션 캐시는 건드리지
                                        않지만, `clear()`는{" "}
                                        <strong>뮤테이션 기록까지 포함</strong>
                                        해 한 번에 정리합니다.
                                    </>,
                                    <>
                                        <strong>부가 정리:</strong>{" "}
                                        백그라운드에서 도는 stale/ gc 관련
                                        타이머·스케줄도 함께 끊기는 방향입니다.
                                    </>,
                                    <>
                                        <strong>진행 중 요청:</strong> 이미
                                        출발한 HTTP가 즉시 Abort 되지는 않을 수
                                        있고, 응답이 와도 저장할 캐시가 없으면{" "}
                                        <strong>
                                            결과는 반영되지 않고 버려질
                                        </strong>
                                        수 있습니다.
                                    </>,
                                    <>
                                        <strong>화면(UI):</strong> 금고(전역
                                        캐시)를 비우는 것이지, 이미 컴포넌트가
                                        들고 있는 스냅샷까지 강제로 비우는
                                        기능은 아닙니다. 구독이 끊기거나
                                        리렌더가 따라오면 로딩/초기값으로
                                        바뀌기도 하지만,
                                        <strong>
                                            {" "}
                                            removeQueries와 동일하게{" "}
                                        </strong>
                                        active 구독 중인 화면에서는 이전
                                        스냅샷이 잠시 유지되어 즉시 갱신되지
                                        않은 것처럼 보일 수 있습니다.
                                    </>,
                                    <>
                                        <strong>실무 팁:</strong> 로그아웃·계정
                                        전환처럼 세션을 완전히 끊을 때 쓰고,
                                        화면까지 즉시 비우려면
                                        `resetQueries`·라우팅 이동·쿼리
                                        키/클라이언트 교체를 함께 설계하는 편이
                                        안전합니다.
                                    </>,
                                ],
                            },
                        ]}
                    />
                </div>
                {postScopedActions.map((action) => (
                    <ControlActionRow
                        key={action.method}
                        {...action}
                    />
                ))}
            </section>
        </aside>
    );
}
