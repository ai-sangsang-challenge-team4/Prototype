import { useMemo, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { SearchIcon, StarIcon } from '../components/layout/icons';
import {
  Badge,
  Dropdown,
  EmptyState,
  StatusChip,
  Tabs,
  TextField,
  type BadgeVariant,
  type StatusChipStatus,
} from '../components/ui';
import defaultProfileImage from '../assets/profile.png';
import './MessagesPage.css';

type ThreadStatus = 'before' | 'inProgress' | 'complete';
type RiskLevel = 'normal' | 'attention' | 'danger' | 'urgent';
type ThreadTab = 'all' | 'starred' | 'drafts';
type FilterValue = 'all' | 'active' | 'complete';

type BoardReply = {
  authorName: string;
  authorRole: 'parent' | 'teacher';
  content: string;
  id: string;
  label: string;
  time: string;
};

type BoardThread = {
  className: string;
  draftText: string;
  id: string;
  isPinned: boolean;
  latestAt: string;
  latestAtLabel: string;
  latestMessage: string;
  moderatedSummary?: string;
  parentName: string;
  replies: BoardReply[];
  risk: RiskLevel;
  riskReviewRequired: boolean;
  status: ThreadStatus;
  studentName: string;
  title: string;
};

const initialThreads: BoardThread[] = [
  {
    id: 'thread-001',
    parentName: '최유진 학부모',
    studentName: '최유진',
    className: '3학년 2반',
    title: '상담 일정 및 조치 내용 확인 요청',
    latestMessage:
      '오늘 중 연락 부탁드립니다. 학교에서 확인한 상황과 대응도 함께 설명해 주세요.',
    latestAt: '2026-08-23T10:24:00+09:00',
    latestAtLabel: '2026.08.23 오전 10:24',
    risk: 'urgent',
    status: 'before',
    riskReviewRequired: true,
    draftText: '',
    isPinned: false,
    moderatedSummary: '상담 일정을 요구하며 불만과 압박을 표현하고 있음.',
    replies: [
      {
        id: 'reply-001-1',
        authorName: '최유진 학부모',
        authorRole: 'parent',
        label: '게시글',
        time: '오전 10:11',
        content:
          '네, 오늘 중으로 꼭 연락 부탁드립니다. 아이가 요즘 학교에 가기 싫다고 할 정도라 저도 많이 걱정됩니다. 단순히 상담 일정만 잡는 것보다 학교에서 지금까지 어떤 상황을 확인했고 어떻게 대응하고 있는지도 같이 설명해 주셨으면 합니다.',
      },
    ],
  },
  {
    id: 'thread-002',
    parentName: '박서준 학부모',
    studentName: '박서준',
    className: '4학년 1반',
    title: '친구와의 갈등 후속 확인',
    latestMessage:
      '어제 쉬는 시간 일을 아이가 계속 이야기해서 후속 확인을 부탁드립니다.',
    latestAt: '2026-08-23T09:08:00+09:00',
    latestAtLabel: '2026.08.23 오전 9:08',
    risk: 'attention',
    status: 'inProgress',
    riskReviewRequired: false,
    draftText:
      '안녕하세요, 학부모님. 말씀해 주신 상황을 확인한 뒤 오늘 하교 전까지 안내드리겠습니다.',
    isPinned: false,
    replies: [
      {
        id: 'reply-002-1',
        authorName: '박서준 학부모',
        authorRole: 'parent',
        label: '게시글',
        time: '오전 8:42',
        content:
          '어제 쉬는 시간에 있었던 일 때문에 아이가 계속 속상해합니다. 상대 학생과 어떤 대화가 있었는지 확인 부탁드립니다.',
      },
      {
        id: 'reply-002-2',
        authorName: '조예인 선생님',
        authorRole: 'teacher',
        label: '선생님 답변',
        time: '오전 9:01',
        content:
          '말씀해 주신 내용을 확인했습니다. 아이가 느낀 부분을 먼저 살피고, 관련 학생들과 상황을 차분히 확인하겠습니다.',
      },
    ],
  },
  {
    id: 'thread-003',
    parentName: '정하준 학부모',
    studentName: '정하준',
    className: '3학년 2반',
    title: '현장체험학습 준비물 문의',
    latestMessage:
      '안내장 준비물 외에 개인 도시락을 챙겨도 되는지 궁금합니다.',
    latestAt: '2026-08-22T17:20:00+09:00',
    latestAtLabel: '2026.08.22 오후 5:20',
    risk: 'normal',
    status: 'before',
    riskReviewRequired: false,
    draftText: '',
    isPinned: false,
    replies: [
      {
        id: 'reply-003-1',
        authorName: '정하준 학부모',
        authorRole: 'parent',
        label: '게시글',
        time: '오후 5:20',
        content:
          '안내장에 적힌 준비물 외에 개인 도시락을 챙겨도 되는지 궁금합니다. 물은 어느 정도 가져가면 될까요?',
      },
    ],
  },
  {
    id: 'thread-004',
    parentName: '이수아 학부모',
    studentName: '이수아',
    className: '5학년 3반',
    title: '가정 내 변화에 따른 학교 생활 확인',
    latestMessage:
      '최근 가정 상황이 바뀌어 아이가 예민할 수 있어 생활 확인을 부탁드립니다.',
    latestAt: '2026-08-22T14:06:00+09:00',
    latestAtLabel: '2026.08.22 오후 2:06',
    risk: 'danger',
    status: 'inProgress',
    riskReviewRequired: false,
    draftText: '',
    isPinned: false,
    moderatedSummary: '학생 정서 변화 가능성이 있어 생활 관찰과 기록이 필요함.',
    replies: [
      {
        id: 'reply-004-1',
        authorName: '이수아 학부모',
        authorRole: 'parent',
        label: '게시글',
        time: '오후 2:06',
        content:
          '최근 가정 상황이 바뀌어 아이가 예민할 수 있습니다. 학교에서 달라진 모습이 있는지 확인해 주시면 감사하겠습니다.',
      },
    ],
  },
  {
    id: 'thread-005',
    parentName: '최도윤 학부모',
    studentName: '최도윤',
    className: '2학년 4반',
    title: '방과후 수업 결석 처리 확인',
    latestMessage:
      '지난 금요일 방과후 수업 결석이 출결에 어떻게 반영되는지 확인했습니다.',
    latestAt: '2026-08-21T16:48:00+09:00',
    latestAtLabel: '2026.08.21 오후 4:48',
    risk: 'normal',
    status: 'complete',
    riskReviewRequired: false,
    draftText: '',
    isPinned: false,
    replies: [
      {
        id: 'reply-005-1',
        authorName: '최도윤 학부모',
        authorRole: 'parent',
        label: '게시글',
        time: '오후 4:12',
        content:
          '지난 금요일 방과후 수업 결석이 출결에 어떻게 반영되는지 확인 부탁드립니다.',
      },
      {
        id: 'reply-005-2',
        authorName: '조예인 선생님',
        authorRole: 'teacher',
        label: '선생님 답변',
        time: '오후 4:48',
        content:
          '방과후 수업 결석은 정규 수업 출결과 별도로 기록됩니다. 자세한 내용은 방과후 담당 선생님께도 공유해 두었습니다.',
      },
    ],
  },
];

const riskLabel: Record<RiskLevel, string> = {
  normal: '일반',
  attention: '주의',
  danger: '위험',
  urgent: '긴급',
};

const riskVariant: Record<RiskLevel, BadgeVariant> = {
  normal: 'info',
  attention: 'warning',
  danger: 'danger',
  urgent: 'critical',
};

const statusLabel: Record<ThreadStatus, string> = {
  before: '상담 전',
  inProgress: '상담 중',
  complete: '상담 완료',
};

const statusChipStatus: Record<ThreadStatus, StatusChipStatus> = {
  before: 'pending',
  inProgress: 'progress',
  complete: 'complete',
};

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: '전체 상담', value: 'all' },
  { label: '진행 중 상담', value: 'active' },
  { label: '완료된 상담', value: 'complete' },
];

function formatNow() {
  return '방금 전';
}

function ProfileAvatar({
  className = 'board-avatar',
}: {
  className?: string;
}) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={className}
      src={defaultProfileImage}
    />
  );
}

type ThreadRowProps = {
  isSelected: boolean;
  onSelect: (threadId: string) => void;
  onToggleStar: (threadId: string) => void;
  thread: BoardThread;
};

function ThreadRow({
  isSelected,
  onSelect,
  onToggleStar,
  thread,
}: ThreadRowProps) {
  return (
    <article className="board-thread-row">
      <button
        aria-label={
          thread.isPinned
            ? `${thread.parentName} 별표 해제`
            : `${thread.parentName} 별표 표시`
        }
        aria-pressed={thread.isPinned}
        className="board-thread-star-button"
        onClick={() => onToggleStar(thread.id)}
        type="button"
      >
        <StarIcon
          className={`board-thread-star${thread.isPinned ? ' is-filled' : ''}`}
        />
      </button>

      <button
        aria-current={isSelected ? 'true' : undefined}
        aria-label={`${thread.parentName} 메시지 상세 보기`}
        className={`board-thread-button${isSelected ? ' is-selected' : ''}`}
        onClick={() => onSelect(thread.id)}
        type="button"
      >
        <div className="board-thread-parent">
          <ProfileAvatar />
          <span className="board-parent-copy">
            <strong>{thread.parentName}</strong>
            <span>{thread.className}</span>
          </span>
        </div>

        <div className="board-thread-copy">
          <strong>{thread.title}</strong>
          <span>{thread.latestMessage}</span>
        </div>

        <div className="board-thread-status">
          <StatusChip
            className="board-status-chip"
            label={statusLabel[thread.status]}
            size="md"
            status={statusChipStatus[thread.status]}
          />
        </div>

        <time className="board-thread-time" dateTime={thread.latestAt}>
          {thread.latestAtLabel}
        </time>
      </button>
    </article>
  );
}

type ThreadListProps = {
  emptyDescription: string;
  emptyTitle: string;
  onSelect: (threadId: string) => void;
  onToggleStar: (threadId: string) => void;
  selectedThreadId?: string;
  threads: BoardThread[];
};

function ThreadList({
  emptyDescription,
  emptyTitle,
  onSelect,
  onToggleStar,
  selectedThreadId,
  threads,
}: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <EmptyState
        className="board-empty-state"
        description={emptyDescription}
        title={emptyTitle}
      />
    );
  }

  return (
    <section className="board-thread-list" aria-label="받은 메시지 목록">
      {threads.map((thread) => (
        <ThreadRow
          isSelected={thread.id === selectedThreadId}
          key={thread.id}
          onSelect={onSelect}
          onToggleStar={onToggleStar}
          thread={thread}
        />
      ))}
    </section>
  );
}

type BoardWorkspaceProps = {
  activeFilter: FilterValue;
  emptyDescription: string;
  emptyTitle: string;
  onFilterChange: (value: FilterValue) => void;
  onQueryChange: (value: string) => void;
  onSelect: (threadId: string) => void;
  onToggleStar: (threadId: string) => void;
  query: string;
  selectedThreadId?: string;
  threads: BoardThread[];
};

function BoardWorkspace({
  activeFilter,
  emptyDescription,
  emptyTitle,
  onFilterChange,
  onQueryChange,
  onSelect,
  onToggleStar,
  query,
  selectedThreadId,
  threads,
}: BoardWorkspaceProps) {
  return (
    <>
      <div className="board-toolbar">
        <Dropdown
          ariaLabel="메시지 처리 상태 필터"
          className="board-filter-select"
          menuLabel="메시지 처리 상태"
          onValueChange={(nextValue) => onFilterChange(nextValue as FilterValue)}
          options={filterOptions}
          value={activeFilter}
        />

        <TextField
          aria-label="메시지 검색"
          containerClassName="board-search-field"
          leadingIcon={<SearchIcon />}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder="이름 또는 메시지 내용으로 검색"
          type="search"
          value={query}
        />
      </div>

      <ThreadList
        emptyDescription={emptyDescription}
        emptyTitle={emptyTitle}
        onSelect={onSelect}
        onToggleStar={onToggleStar}
        selectedThreadId={selectedThreadId}
        threads={threads}
      />
    </>
  );
}

function TabLabel({ count, label }: { count: number; label: string }) {
  return (
    <span className="board-tab-label">
      <span>{label}</span>
      <span>{count}</span>
    </span>
  );
}

type DraftResumeDialogProps = {
  onClose: () => void;
  onContinue: () => void;
  open: boolean;
};

function DraftResumeDialog({
  onClose,
  onContinue,
  open,
}: DraftResumeDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="board-draft-modal-overlay" role="presentation">
      <section
        aria-labelledby="board-draft-modal-title"
        aria-modal="true"
        className="board-draft-modal"
        role="dialog"
      >
        <h2 id="board-draft-modal-title">
          작성 중인 답변이 있어요.
          <br />
          이어서 작성하시겠어요?
        </h2>
        <button
          aria-label="닫기"
          className="board-draft-modal-close"
          onClick={onClose}
          type="button"
        >
          <svg
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.4 19 5 17.6 10.6 12 5 6.4 6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          className="board-draft-modal-action"
          onClick={onContinue}
          type="button"
        >
          이어서 작성
        </button>
      </section>
    </div>
  );
}

type DetailProps = {
  onBack: () => void;
  onDraftChange: (threadId: string, value: string) => void;
  onReviewComplete: (threadId: string) => void;
  onSubmitReply: (threadId: string) => void;
  thread: BoardThread;
};

function ThreadDetail({
  onBack,
  onDraftChange,
  onReviewComplete,
  onSubmitReply,
  thread,
}: DetailProps) {
  const isLocked = thread.risk === 'urgent' && thread.riskReviewRequired;
  const hasDraft = thread.draftText.trim().length > 0;

  return (
    <section className="board-detail" aria-labelledby="board-detail-title">
      <header className="board-detail-page-header">
        <button className="board-back-button" onClick={onBack} type="button">
          <span aria-hidden="true">←</span>
          <span>목록</span>
        </button>
        <div>
          <p>학부모 게시판</p>
          <h1 id="board-detail-title">메시지 상세</h1>
        </div>
      </header>

      <div className="board-detail-heading">
        <div>
          <p>게시글 상세</p>
          <h2>{thread.title}</h2>
        </div>
        <Badge
          className={`board-risk-badge board-risk-${thread.risk}`}
          variant={riskVariant[thread.risk]}
        >
          {riskLabel[thread.risk]}
        </Badge>
      </div>

      <div className="board-parent-card">
        <div className="board-card-profile">
          <ProfileAvatar />
          <span>
            <strong>{thread.parentName}</strong>
            <small>
              {thread.studentName} · {thread.className}
            </small>
          </span>
        </div>
        <div className="board-card-topic">
          <strong>{thread.title}</strong>
          <span>{thread.latestMessage}</span>
        </div>
        <div className="board-card-meta">
          <span>위험도</span>
          <Badge
            className={`board-risk-badge board-risk-${thread.risk}`}
            size="sm"
            variant={riskVariant[thread.risk]}
          >
            {riskLabel[thread.risk]}
          </Badge>
        </div>
        <div className="board-card-meta">
          <span>최근 수신</span>
          <time dateTime={thread.latestAt}>{thread.latestAtLabel}</time>
        </div>
      </div>

      <div className="board-info-box">
        <span aria-hidden="true">i</span>
        <p>
          학부모 게시글은 완화된 내용으로 먼저 표시됩니다. 필요 시 원문 보기와
          판단 근거를 함께 확인한 뒤 답변을 남길 수 있습니다.
        </p>
      </div>

      <div className="board-conversation" aria-label="게시글 답글 스레드">
        <div className="board-date-chip">2026년 8월 23일 일요일</div>

        {thread.moderatedSummary ? (
          <div className="board-moderation-card">
            <div>
              <strong>위험 메시지 완충 요약</strong>
              <p>{thread.moderatedSummary}</p>
            </div>
            <div className="board-moderation-actions">
              <button type="button">판단 근거</button>
              <button type="button">원문 보기</button>
            </div>
          </div>
        ) : null}

        {thread.replies.map((reply) => (
          <article
            className={`board-reply board-reply-${reply.authorRole}`}
            key={reply.id}
          >
            <div className="board-reply-author">
              <ProfileAvatar className="board-mini-avatar" />
              <strong>{reply.authorName}</strong>
            </div>
            <div className="board-reply-row">
              {reply.authorRole === 'teacher' ? (
                <div className="board-reply-time">
                  <span>{thread.replies.length}</span>
                  <time>{reply.time}</time>
                </div>
              ) : null}
              <div className="board-reply-bubble">
                <span>{reply.label}</span>
                <p>{reply.content}</p>
              </div>
              {reply.authorRole === 'parent' ? <time>{reply.time}</time> : null}
            </div>
          </article>
        ))}
      </div>

      <div className={`board-answer-box${isLocked ? ' is-locked' : ''}`}>
        {isLocked ? (
          <>
            <div className="board-lock-message">
              <span aria-hidden="true">!</span>
              <div>
                <strong>위험도가 높은 게시글입니다.</strong>
                <p>
                  긴급 단계에서는 답변 작성이 제한되며, 위험도 검토 후 답변을
                  진행할 수 있습니다.
                </p>
              </div>
            </div>
            <button
              className="board-outline-button"
              onClick={() => onReviewComplete(thread.id)}
              type="button"
            >
              위험도 검토 바로가기
            </button>
          </>
        ) : (
          <>
            <label htmlFor="board-reply-input">선생님 답변</label>
            <textarea
              id="board-reply-input"
              onChange={(event) => onDraftChange(thread.id, event.target.value)}
              placeholder="학부모 게시글에 남길 답변을 작성하세요."
              rows={5}
              value={thread.draftText}
            />
            <div className="board-answer-actions">
              <span>{hasDraft ? '임시저장됨' : '작성 중인 답변 없음'}</span>
              <button
                className="board-primary-button"
                disabled={!hasDraft}
                onClick={() => onSubmitReply(thread.id)}
                type="button"
              >
                전송
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function MessagesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [activeTab, setActiveTab] = useState<ThreadTab>('all');
  const [draftPromptThreadId, setDraftPromptThreadId] = useState<string | null>(
    null,
  );
  const [query, setQuery] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [threads, setThreads] = useState(initialThreads);

  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return threads.filter((thread) => {
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'active' && thread.status !== 'complete') ||
        (activeFilter === 'complete' && thread.status === 'complete');
      const searchableText = [
        thread.parentName,
        thread.studentName,
        thread.className,
        thread.title,
        thread.latestMessage,
        statusLabel[thread.status],
      ]
        .join(' ')
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchableText.includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query, threads]);

  const starredThreads = filteredThreads.filter((thread) => thread.isPinned);
  const draftThreads = filteredThreads.filter(
    (thread) => thread.draftText.trim().length > 0,
  );
  const selectedThread =
    threads.find((thread) => thread.id === selectedThreadId) ?? null;
  const draftPromptThread =
    threads.find((thread) => thread.id === draftPromptThreadId) ?? null;

  const updateThread = (
    threadId: string,
    updater: (thread: BoardThread) => BoardThread,
  ) => {
    setThreads((currentThreads) =>
      currentThreads.map((thread) =>
        thread.id === threadId ? updater(thread) : thread,
      ),
    );
  };

  const handleToggleStar = (threadId: string) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      isPinned: !thread.isPinned,
    }));
  };

  const handleSelectThread = (threadId: string) => {
    const thread = threads.find((currentThread) => currentThread.id === threadId);

    if (thread?.draftText.trim()) {
      setDraftPromptThreadId(threadId);
      return;
    }

    setSelectedThreadId(threadId);
  };

  const handleContinueDraft = () => {
    if (draftPromptThreadId) {
      setSelectedThreadId(draftPromptThreadId);
    }

    setDraftPromptThreadId(null);
  };

  const handleDraftChange = (threadId: string, value: string) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      draftText: value,
      status: thread.status === 'complete' ? 'inProgress' : thread.status,
    }));
  };

  const handleReviewComplete = (threadId: string) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      riskReviewRequired: false,
      status: 'inProgress',
    }));
  };

  const handleSubmitReply = (threadId: string) => {
    updateThread(threadId, (thread) => {
      const nextReply = thread.draftText.trim();

      if (!nextReply) {
        return thread;
      }

      return {
        ...thread,
        draftText: '',
        latestAt: new Date().toISOString(),
        latestAtLabel: formatNow(),
        latestMessage: nextReply,
        replies: [
          ...thread.replies,
          {
            id: `${thread.id}-${thread.replies.length + 1}`,
            authorName: '조예인 선생님',
            authorRole: 'teacher',
            content: nextReply,
            label: '선생님 답변',
            time: formatNow(),
          },
        ],
        status: 'complete',
      };
    });
  };

  const tabItems = [
    {
      value: 'all',
      label: <TabLabel count={filteredThreads.length} label="전체 메시지" />,
      content: (
        <BoardWorkspace
          activeFilter={activeFilter}
          emptyDescription="검색어 또는 필터 조건을 바꾸면 다른 메시지를 볼 수 있습니다."
          emptyTitle="조건에 맞는 메시지가 없습니다"
          onFilterChange={setActiveFilter}
          onQueryChange={setQuery}
          onSelect={handleSelectThread}
          onToggleStar={handleToggleStar}
          query={query}
          selectedThreadId={selectedThreadId ?? undefined}
          threads={filteredThreads}
        />
      ),
    },
    {
      value: 'starred',
      label: <TabLabel count={starredThreads.length} label="별표 메시지" />,
      content: (
        <BoardWorkspace
          activeFilter={activeFilter}
          emptyDescription="중요하게 표시한 메시지가 이곳에 모입니다."
          emptyTitle="별표 메시지가 없습니다"
          onFilterChange={setActiveFilter}
          onQueryChange={setQuery}
          onSelect={handleSelectThread}
          onToggleStar={handleToggleStar}
          query={query}
          selectedThreadId={selectedThreadId ?? undefined}
          threads={starredThreads}
        />
      ),
    },
    {
      value: 'drafts',
      label: <TabLabel count={draftThreads.length} label="임시저장 답변" />,
      content: (
        <BoardWorkspace
          activeFilter={activeFilter}
          emptyDescription="작성 중인 답변 초안이 생기면 이곳에 모입니다."
          emptyTitle="임시저장 답변이 없습니다"
          onFilterChange={setActiveFilter}
          onQueryChange={setQuery}
          onSelect={handleSelectThread}
          onToggleStar={handleToggleStar}
          query={query}
          selectedThreadId={selectedThreadId ?? undefined}
          threads={draftThreads}
        />
      ),
    },
  ];
  const pageClassName = `board-inbox-page${
    isSidebarCollapsed ? ' is-sidebar-collapsed' : ''
  }`;

  if (selectedThread) {
    return (
      <section className={pageClassName} aria-labelledby="board-detail-title">
        <Sidebar
          activeItem="messages"
          defaultCollapsed={isSidebarCollapsed}
          messageCount={2}
          onCollapsedChange={setIsSidebarCollapsed}
        />
        <main className="board-detail-page">
          <ThreadDetail
            onBack={() => setSelectedThreadId(null)}
            onDraftChange={handleDraftChange}
            onReviewComplete={handleReviewComplete}
            onSubmitReply={handleSubmitReply}
            thread={selectedThread}
          />
        </main>
      </section>
    );
  }

  return (
    <section className={pageClassName} aria-labelledby="board-page-title">
      <Sidebar
        activeItem="messages"
        defaultCollapsed={isSidebarCollapsed}
        messageCount={2}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      <main className="board-list-page">
        <h1 className="board-page-title" id="board-page-title">
          받은 메시지
        </h1>

        <section className="board-list-panel" aria-label="메시지 목록">
          <Tabs
            ariaLabel="메시지 분류"
            className="board-tabs"
            items={tabItems}
            onValueChange={(nextValue) => setActiveTab(nextValue as ThreadTab)}
            value={activeTab}
          />
        </section>
      </main>
      <DraftResumeDialog
        onClose={() => setDraftPromptThreadId(null)}
        onContinue={handleContinueDraft}
        open={draftPromptThread !== null}
      />
    </section>
  );
}
