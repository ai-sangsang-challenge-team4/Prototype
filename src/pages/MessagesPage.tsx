import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { SearchIcon, StarIcon } from '../components/layout/icons';
import {
  Badge,
  Dropdown,
  EmptyState,
  Modal,
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
type SystemRiskLevel = 'low' | 'medium' | 'high' | 'emergency';
type StudentSafetySignal = 'NONE' | 'POSSIBLE' | 'URGENT_REVIEW';
type RiskFactorStatus = 'detected' | 'boundary' | 'unknown';
type SummaryStatus = 'ready' | 'failed';
type ThreadTab = 'all' | 'starred' | 'drafts';
type FilterValue = 'all' | 'active' | 'complete';

type BufferedSummary = {
  status: SummaryStatus;
  text: string;
};

type RiskFactor = {
  description: string;
  evidence: string;
  id: string;
  name: string;
  rationale: string;
  status: RiskFactorStatus;
};

type ActivityLog = {
  action: string;
  actor: string;
  detail: string;
  id: string;
  time: string;
};

type ThreadAnalysis = {
  activityLogs: ActivityLog[];
  canReviewRisk: boolean;
  canViewActivityLog: boolean;
  canViewOriginal: boolean;
  originalMessageAvailable: boolean;
  packageAvailable: boolean;
  riskFactors: RiskFactor[];
  safetyLock: boolean;
  studentSafetySignal: StudentSafetySignal;
  summary: BufferedSummary;
  systemRiskLevel: SystemRiskLevel;
  teacherReviewReason?: string;
  teacherReviewedRiskLevel?: SystemRiskLevel;
};

type BoardReply = {
  authorName: string;
  authorRole: 'parent' | 'teacher';
  content: string;
  id: string;
  label: string;
  readByParent?: boolean;
  time: string;
};

type BoardThread = {
  analysis?: ThreadAnalysis;
  className: string;
  draftText: string;
  id: string;
  isPinned: boolean;
  latestAt: string;
  latestAtLabel: string;
  latestMessage: string;
  messageDateLabel?: string;
  moderatedSummary?: string;
  originalMessage?: string;
  officialTemplates?: string[];
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
    latestMessage: '학부모 상담 가능 일정을 확인하고 조율을 요청',
    latestAt: '2026-08-03T10:24:00+09:00',
    latestAtLabel: '2026.08.03 오전 10:24',
    risk: 'urgent',
    status: 'before',
    riskReviewRequired: true,
    draftText: '',
    isPinned: false,
    messageDateLabel: '2026년 8월 10일 월요일',
    moderatedSummary: '상담 일정을 요구하며 불만과 압박을 표현하고 있음.',
    originalMessage:
      '오늘 중으로 꼭 연락 주세요. 아이가 학교에 가기 싫다고 하고 집에서도 계속 울어서 저도 너무 불안합니다. 그냥 상담 일정만 잡는 말로 끝내지 말고, 학교에서 지금까지 무엇을 확인했고 어떤 조치를 했는지 분명히 알려 주세요. 답이 늦으면 더 이상 기다리기 어렵습니다.',
    officialTemplates: [
      '학급 생활 관찰 기록 양식',
      '상담 일정 조율 안내문',
      '학생 안전 확인 체크리스트',
    ],
    analysis: {
      systemRiskLevel: 'emergency',
      teacherReviewedRiskLevel: undefined,
      safetyLock: true,
      studentSafetySignal: 'POSSIBLE',
      canViewOriginal: true,
      originalMessageAvailable: true,
      canReviewRisk: true,
      canViewActivityLog: true,
      packageAvailable: true,
      summary: {
        status: 'ready',
        text: '상담 일정을 요구하며 불만과 압박을 표현하고 있음.',
      },
      riskFactors: [
        {
          id: 'factor-pressure',
          name: '즉시 응답 압박',
          description: '오늘 중 연락과 조치 설명을 강하게 요청하고 있습니다.',
          status: 'detected',
          rationale:
            '답변 기한을 특정하고 후속 행동을 예고해 교사가 즉시 대응해야 하는 압박으로 해석될 수 있습니다.',
          evidence: '오늘 중으로 꼭 연락 주세요',
        },
        {
          id: 'factor-student-safety',
          name: '학생 안전 신호',
          description:
            '학생이 등교를 거부하고 울었다는 표현이 있어 별도 확인이 필요합니다.',
          status: 'boundary',
          rationale:
            '직접적인 위해 표현은 아니지만 학생의 정서 상태를 확인해야 하는 경계 신호입니다.',
          evidence: '학교에 가기 싫다고 하고 집에서도 계속 울어서',
        },
        {
          id: 'factor-accountability',
          name: '조치 설명 요구',
          description:
            '상담 일정뿐 아니라 학교의 확인 내용과 대응 조치를 요구합니다.',
          status: 'detected',
          rationale:
            '교사가 답변 전 사실 확인과 내부 기록 점검을 함께 해야 하는 요청입니다.',
          evidence: '무엇을 확인했고 어떤 조치를 했는지',
        },
      ],
      activityLogs: [
        {
          id: 'log-001',
          time: '2026.08.23 오전 10:24',
          actor: 'AI 분석',
          action: '위험도 산정',
          detail: '시스템 위험도를 긴급으로 분류했습니다.',
        },
        {
          id: 'log-002',
          time: '2026.08.23 오전 10:25',
          actor: '조예인 선생님',
          action: '상세 화면 진입',
          detail: '완충 요약과 위험 요소를 확인했습니다.',
        },
      ],
    },
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
      {
        id: 'reply-001-2',
        authorName: '조예인 선생님',
        authorRole: 'teacher',
        label: '선생님 답변',
        readByParent: true,
        time: '오전 11:12',
        content:
          '네, 학부모님. 말씀해 주신 부분까지 확인해서 상담 때 함께 안내드리겠습니다. 현재 확인되지 않은 내용을 미리 단정해서 말씀드리기보다는 관련 상황을 먼저 확인한 뒤 정확하게 설명드리는 것이 좋을 것 같습니다. 오늘 오후 4시 또는 내일 오전 10시 중 상담 가능하신 시간이 있으실까요?',
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
    messageDateLabel: '2026년 8월 23일 일요일',
    originalMessage:
      '어제 쉬는 시간에 있었던 일 때문에 아이가 계속 속상해합니다. 상대 학생과 어떤 대화가 있었는지 확인 부탁드립니다.',
    analysis: {
      systemRiskLevel: 'medium',
      safetyLock: false,
      studentSafetySignal: 'NONE',
      canViewOriginal: true,
      originalMessageAvailable: true,
      canReviewRisk: true,
      canViewActivityLog: true,
      packageAvailable: false,
      summary: {
        status: 'ready',
        text: '친구와의 갈등 이후 학생 정서 확인과 후속 안내를 요청함.',
      },
      riskFactors: [
        {
          id: 'factor-peer-conflict',
          name: '또래 갈등',
          description: '쉬는 시간 갈등과 학생의 속상함이 언급되었습니다.',
          status: 'detected',
          rationale: '상대 학생과의 대화 확인이 필요한 생활지도 맥락입니다.',
          evidence: '상대 학생과 어떤 대화가 있었는지',
        },
      ],
      activityLogs: [
        {
          id: 'log-002-1',
          time: '2026.08.23 오전 9:08',
          actor: '조예인 선생님',
          action: '답변 초안 저장',
          detail: '학부모 안내 초안을 임시저장했습니다.',
        },
      ],
    },
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
        readByParent: false,
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
    messageDateLabel: '2026년 8월 22일 토요일',
    originalMessage: '',
    analysis: {
      systemRiskLevel: 'low',
      safetyLock: false,
      studentSafetySignal: 'NONE',
      canViewOriginal: false,
      originalMessageAvailable: false,
      canReviewRisk: false,
      canViewActivityLog: true,
      packageAvailable: false,
      summary: {
        status: 'failed',
        text: '요약을 불러오지 못했습니다.',
      },
      riskFactors: [
        {
          id: 'factor-general-inquiry',
          name: '일반 문의',
          description: '준비물과 일정에 관한 확인 요청입니다.',
          status: 'unknown',
          rationale:
            '원문 권한이 없어 AI 근거를 표시하지 못하지만 목록 위험도는 일반으로 유지됩니다.',
          evidence: '원문 확인 권한 없음',
        },
      ],
      activityLogs: [
        {
          id: 'log-003-1',
          time: '2026.08.22 오후 5:20',
          actor: '시스템',
          action: '메시지 수신',
          detail: '일반 문의로 분류되었습니다.',
        },
      ],
    },
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
    messageDateLabel: '2026년 8월 22일 토요일',
    moderatedSummary: '학생 정서 변화 가능성이 있어 생활 관찰과 기록이 필요함.',
    originalMessage:
      '최근 가정 상황이 바뀌어 아이가 예민할 수 있습니다. 학교에서 달라진 모습이 있는지 확인해 주시면 감사하겠습니다.',
    officialTemplates: ['생활 관찰 기록', '상담 연계 안내', '가정-학교 협력 메모'],
    analysis: {
      systemRiskLevel: 'high',
      safetyLock: false,
      studentSafetySignal: 'POSSIBLE',
      canViewOriginal: true,
      originalMessageAvailable: true,
      canReviewRisk: true,
      canViewActivityLog: true,
      packageAvailable: true,
      summary: {
        status: 'ready',
        text: '학생 정서 변화 가능성이 있어 생활 관찰과 기록이 필요함.',
      },
      riskFactors: [
        {
          id: 'factor-home-change',
          name: '가정 내 변화',
          description: '가정 상황 변화가 학생 생활에 영향을 줄 수 있습니다.',
          status: 'boundary',
          rationale:
            '직접 위험 단정은 어렵지만 학교 생활 관찰과 기록을 남기는 것이 적절합니다.',
          evidence: '최근 가정 상황이 바뀌어',
        },
      ],
      activityLogs: [
        {
          id: 'log-004-1',
          time: '2026.08.22 오후 2:06',
          actor: 'AI 분석',
          action: '위험 요소 요약',
          detail: '가정 변화와 학생 정서 관찰 필요성을 표시했습니다.',
        },
      ],
    },
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
        readByParent: true,
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
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="board-draft-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
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
  const showBufferedSummaryOnly =
    Boolean(thread.moderatedSummary) &&
    (thread.risk === 'urgent' || thread.risk === 'danger');

  return (
    <section className="board-detail" aria-labelledby="board-detail-title">
      <header className="board-detail-page-header">
        <div className="board-detail-title-group">
          <button
            aria-label="목록으로 돌아가기"
            className="board-back-button"
            onClick={onBack}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              viewBox="0 0 16 15"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.825 8.24079 9.425 13.3684 8 14.6503 0 7.32515 8 0l1.425 1.2819-5.6 5.1276H16v1.83129H3.825Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <h1 id="board-detail-title">메시지 상세</h1>
        </div>

        <nav aria-label="현재 위치" className="board-page-nav">
          <span>홈</span>
          <svg
            aria-hidden="true"
            fill="none"
            viewBox="0 0 7 13"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.0552 13 0 11.8462 4.8896 6.5 0 1.15375 1.0552 0 7 6.5 1.0552 13Z"
              fill="currentColor"
            />
          </svg>
          <span>메시지</span>
          <svg
            aria-hidden="true"
            fill="none"
            viewBox="0 0 7 13"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.0552 13 0 11.8462 4.8896 6.5 0 1.15375 1.0552 0 7 6.5 1.0552 13Z"
              fill="currentColor"
            />
          </svg>
          <span>메시지 상세</span>
          <svg
            aria-hidden="true"
            fill="none"
            viewBox="0 0 7 13"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.0552 13 0 11.8462 4.8896 6.5 0 1.15375 1.0552 0 7 6.5 1.0552 13Z"
              fill="currentColor"
            />
          </svg>
          <strong>대화</strong>
        </nav>
      </header>

      <nav aria-label="메시지 상세 탭" className="board-detail-tabs">
        <button aria-current="page" className="is-active" type="button">
          대화
        </button>
        <button type="button">위험 요소</button>
        <button type="button">처리 기록</button>
      </nav>

      <div className="board-parent-card">
        <div className="board-card-profile">
          <ProfileAvatar />
          <span>
            <strong>{thread.parentName}</strong>
            <small>{thread.className}</small>
          </span>
        </div>
        <div className="board-card-topic">
          <strong>{thread.title}</strong>
          <span>{thread.latestMessage}</span>
        </div>
        <div className="board-card-meta-group">
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
      </div>

      <div className="board-info-box">
        <span aria-hidden="true">i</span>
        <p>
          학부모 게시글은 완화된 내용으로 먼저 표시됩니다. 필요 시 원문 보기와
          판단 근거를 함께 확인한 뒤 답변을 남길 수 있습니다.
        </p>
      </div>

      <div
        className={`board-conversation${
          showBufferedSummaryOnly ? ' is-summary-only' : ''
        }`}
        aria-label="게시글 답글 스레드"
      >
        <div className="board-date-chip">
          <svg
            aria-hidden="true"
            fill="none"
            viewBox="0 0 18 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 20c-.55 0-1.021-.196-1.412-.588A1.926 1.926 0 0 1 0 18V4c0-.55.196-1.02.588-1.412A1.926 1.926 0 0 1 2 2h1V0h2v2h8V0h2v2h1c.55 0 1.02.196 1.412.588C17.804 2.979 18 3.45 18 4v14c0 .55-.196 1.02-.588 1.412A1.926 1.926 0 0 1 16 20H2Zm0-2h14V8H2v10Zm0-12h14V4H2v2Zm7 6a.967.967 0 0 1-.713-.288A.967.967 0 0 1 8 11c0-.283.096-.52.287-.712A.967.967 0 0 1 9 10c.283 0 .52.096.713.288.191.191.287.429.287.712 0 .283-.096.52-.287.712A.967.967 0 0 1 9 12Zm-4 0a.967.967 0 0 1-.713-.288A.967.967 0 0 1 4 11c0-.283.096-.52.287-.712A.967.967 0 0 1 5 10c.283 0 .52.096.713.288.191.191.287.429.287.712 0 .283-.096.52-.287.712A.967.967 0 0 1 5 12Zm8 0a.967.967 0 0 1-.713-.288A.967.967 0 0 1 12 11c0-.283.096-.52.287-.712A.967.967 0 0 1 13 10c.283 0 .52.096.713.288.191.191.287.429.287.712 0 .283-.096.52-.287.712A.967.967 0 0 1 13 12Zm-4 4a.967.967 0 0 1-.713-.288A.967.967 0 0 1 8 15c0-.283.096-.52.287-.712A.967.967 0 0 1 9 14c.283 0 .52.096.713.288.191.191.287.429.287.712 0 .283-.096.52-.287.712A.967.967 0 0 1 9 16Zm-4 0a.967.967 0 0 1-.713-.288A.967.967 0 0 1 4 15c0-.283.096-.52.287-.712A.967.967 0 0 1 5 14c.283 0 .52.096.713.288.191.191.287.429.287.712 0 .283-.096.52-.287.712A.967.967 0 0 1 5 16Zm8 0a.967.967 0 0 1-.713-.288A.967.967 0 0 1 12 15c0-.283.096-.52.287-.712A.967.967 0 0 1 13 14c.283 0 .52.096.713.288.191.191.287.429.287.712 0 .283-.096.52-.287.712A.967.967 0 0 1 13 16Z"
              fill="currentColor"
            />
          </svg>
          <span>{thread.messageDateLabel ?? '2026년 8월 10일 월요일'}</span>
        </div>

        {thread.moderatedSummary ? (
          <article className="board-moderation-message">
            <div className="board-reply-author">
              <ProfileAvatar className="board-mini-avatar" />
              <strong>{thread.parentName}</strong>
            </div>
            <div className="board-moderation-row">
              <div className="board-moderation-card">
                <div>
                  <strong className="board-moderation-title">
                    <svg
                      aria-hidden="true"
                      fill="none"
                      viewBox="0 0 18 23"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 13.5681c-.15742 0-.2661.0474-.35938.1406C8.54735 13.802 8.5 13.9107 8.5 14.0681c0 .1574.04735.2661.14062.3594.09328.0933.20196.1406.35938.1406s.2661-.0473.35938-.1406c.09326-.0933.14062-.202.14062-.3594 0-.1574-.04735-.2661-.14062-.3594-.09328-.0932-.20196-.1406-.35938-.1406Zm-.5-3h1v-4h-1v4Zm9-0.4004c0 2.6404-.7888 5.0478-2.3584 7.2071-1.5717 2.162-3.5807 3.5646-6.01953 4.1787L9 21.5837l-.12207-.0302c-2.43885-.6141-4.44784-2.0167-6.01953-4.1787C1.2888 15.2155.5 12.8081.5 10.1677V3.72144l.324219-.1211 8-3L9 .533936l.17578.066406 8 3 .32422.121098v6.44626Z"
                        fill="currentColor"
                        stroke="white"
                      />
                    </svg>
                    <span>위험 메시지 완충 요약</span>
                  </strong>
                  <p>{thread.moderatedSummary}</p>
                </div>
                <div className="board-moderation-actions">
                  <button type="button">원문 보기</button>
                  <button type="button">판단 근거</button>
                </div>
              </div>
              <time>{thread.replies[0]?.time ?? thread.latestAtLabel}</time>
            </div>
          </article>
        ) : null}

        {showBufferedSummaryOnly
          ? null
          : thread.replies.map((reply) => (
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
                      {reply.readByParent ? <span>1</span> : null}
                      <time>{reply.time}</time>
                    </div>
                  ) : null}
                  <div className="board-reply-bubble">
                    <span>{reply.label}</span>
                    <p>{reply.content}</p>
                  </div>
                  {reply.authorRole === 'parent' ? (
                    <time>{reply.time}</time>
                  ) : null}
                </div>
              </article>
            ))}
        <div className={`board-answer-box${isLocked ? ' is-locked' : ''}`}>
          {isLocked ? (
            <>
              <div className="board-lock-message">
                <span className="board-lock-icon" aria-hidden="true">
                  <svg
                    fill="none"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="10" cy="10" fill="#FF4B6C" r="10" />
                    <path
                      d="M7 15c-.275 0-.51042-.0933-.70625-.2798C6.09792 14.5337 6 14.3095 6 14.0476V9.28571c0-.2619.09792-.48611.29375-.67261.19583-.18651.43125-.27977.70625-.27977h.5v-.95238c0-.65873.24375-1.22024.73125-1.68452C8.71875 5.23214 9.30833 5 10 5c.6917 0 1.2812.23214 1.7688.69643.4874.46428.7312 1.02579.7312 1.68452v.95238h.5c.275 0 .5104.09326.7063.27977.1958.1865.2937.41071.2937.67261v4.76189c0 .2619-.0979.4861-.2937.6726C13.5104 14.9067 13.275 15 13 15H7Zm3.7063-2.6607c.1958-.1865.2937-.4107.2937-.6726 0-.2619-.0979-.4861-.2937-.6727-.1959-.1865-.4313-.2797-.7063-.2797-.275 0-.51042.0932-.70625.2797C9.09792 11.1806 9 11.4048 9 11.6667c0 .2619.09792.4861.29375.6726.19583.1865.43125.2797.70625.2797.275 0 .5104-.0932.7063-.2797ZM8.5 8.33333h3v-.95238c0-.39682-.1458-.73412-.4375-1.0119-.2917-.27778-.6458-.41667-1.0625-.41667-.41667 0-.77083.13889-1.0625.41667C8.64583 6.64683 8.5 6.98413 8.5 7.38095v.95238Z"
                      fill="white"
                    />
                  </svg>
                </span>
                <div>
                  <strong>위험도가 높은 대화입니다.</strong>
                  <p>
                    긴급 단계에서는 답변 작성이 제한되며, 위험도 검토 후 답변을
                    진행할 수 있습니다.
                  </p>
                </div>
              </div>
              <button
                className="board-outline-button board-risk-review-button"
                onClick={() => onReviewComplete(thread.id)}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 18 19"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 16.8889h1.425L13.2 6.57083l-1.425-1.50416L2 15.3847v1.5042ZM0 19v-4.4861L13.2.606944c.2-.193518.4208-.343055.6625-.448611C14.1042.052778 14.3583 0 14.625 0c.2667 0 .525.052778.775.158333.25.105556.4667.263889.65.475l1.375 1.477777c.2.19352.3458.42222.4375.68611.0917.26389.1375.52778.1375.79167 0 .28148-.0458.54977-.1375.80486-.0917.25509-.2375.48819-.4375.69931L4.25 19H0ZM12.475 5.83194l-.7-.76527L13.2 6.57083l-.725-.73889Z"
                    fill="currentColor"
                  />
                </svg>
                <span>위험도 검토 바로가기</span>
              </button>
            </>
          ) : (
            <>
              <label htmlFor="board-reply-input">선생님 답변</label>
              <textarea
                id="board-reply-input"
                onChange={(event) =>
                  onDraftChange(thread.id, event.target.value)
                }
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
            readByParent: false,
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
