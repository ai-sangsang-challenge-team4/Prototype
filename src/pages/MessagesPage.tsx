import { useMemo, useState } from 'react';
import { AlertIcon, SearchIcon, StarIcon } from '../components/layout/icons';
import {
  Dropdown,
  EmptyState,
  StatusChip,
  Tabs,
  TextField,
  type StatusChipStatus,
} from '../components/ui';

type MessageStatus = 'pending' | 'attention' | 'complete';

type MessageItem = {
  className: string;
  date: string;
  description: string;
  parentName: string;
  starred: boolean;
  status: MessageStatus;
  title: string;
};

const tabs = ['전체 메시지', '별표 메시지', '임시저장 답변'];
type MessageTab = 'all' | 'starred' | 'drafts';
type FilterValue = 'all' | MessageStatus;

const messages: MessageItem[] = [
  {
    parentName: '김민서 학부모',
    className: '3학년 2반',
    title: '현장체험학습 관련 문의',
    description: '현장체험학습 일정과 준비물 관련 확인을 요청한 메시지입니다.',
    status: 'pending',
    date: '오늘',
    starred: false,
  },
  {
    parentName: '박서준 학부모',
    className: '4학년 1반',
    title: '학부모 상담 일정 조율',
    description: '학부모 상담 가능 일정을 확인하고 조율을 요청한 메시지입니다.',
    status: 'attention',
    date: '어제',
    starred: true,
  },
  {
    parentName: '정하준 학부모',
    className: '3학년 2반',
    title: '수업 중 상황 문의',
    description: '자녀의 수업 중 상황에 대한 문의입니다.',
    status: 'complete',
    date: '8월 3일',
    starred: false,
  },
];

const statusLabel: Record<MessageStatus, string> = {
  pending: '답변 전',
  attention: '주의 필요',
  complete: '상담 완료',
};

const statusChipStatus: Record<MessageStatus, StatusChipStatus> = {
  pending: 'pending',
  attention: 'danger',
  complete: 'complete',
};

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: '전체 상담', value: 'all' },
  { label: '답변 전', value: 'pending' },
  { label: '주의 필요', value: 'attention' },
  { label: '상담 완료', value: 'complete' },
];

function MessageRow({ message }: { message: MessageItem }) {
  return (
    <article className="message-row">
      <div className="message-profile">
        <StarIcon
          className={`message-star${message.starred ? ' is-filled' : ''}`}
        />
        <span className="message-avatar" aria-hidden="true">
          {message.parentName.slice(0, 1)}
        </span>
        <span className="message-sender">
          <strong>{message.parentName}</strong>
          <span>{message.className}</span>
        </span>
      </div>

      <div className="message-divider" />

      <div className="message-copy">
        <div className="message-title-row">
          {message.status === 'attention' ? (
            <AlertIcon className="message-alert-icon" />
          ) : null}
          <h2>{message.title}</h2>
        </div>
        <p>{message.description}</p>
      </div>

      <div className="message-meta">
        <StatusChip
          label={statusLabel[message.status]}
          status={statusChipStatus[message.status]}
        />
        <time>{message.date}</time>
      </div>
    </article>
  );
}

type MessageResultsProps = {
  emptyDescription: string;
  emptyTitle: string;
  messages: MessageItem[];
};

function MessageResults({
  emptyDescription,
  emptyTitle,
  messages,
}: MessageResultsProps) {
  if (messages.length === 0) {
    return (
      <EmptyState
        className="message-list-empty"
        description={emptyDescription}
        title={emptyTitle}
      />
    );
  }

  return (
    <section className="message-list" aria-label="받은 메시지 목록">
      {messages.map((message) => (
        <MessageRow
          key={`${message.parentName}-${message.title}`}
          message={message}
        />
      ))}
    </section>
  );
}

type MessageWorkspaceProps = {
  activeFilter: FilterValue;
  emptyDescription: string;
  emptyTitle: string;
  messages: MessageItem[];
  onFilterChange: (value: FilterValue) => void;
  onQueryChange: (value: string) => void;
  query: string;
};

function MessageWorkspace({
  activeFilter,
  emptyDescription,
  emptyTitle,
  messages,
  onFilterChange,
  onQueryChange,
  query,
}: MessageWorkspaceProps) {
  return (
    <>
      <div className="message-toolbar">
        <Dropdown
          ariaLabel="상담 상태 필터"
          className="message-filter-select"
          menuLabel="상담 상태"
          onValueChange={(nextValue) => onFilterChange(nextValue as FilterValue)}
          options={filterOptions}
          value={activeFilter}
        />

        <TextField
          aria-label="메시지 검색"
          containerClassName="message-search-field"
          leadingIcon={<SearchIcon />}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder="이름 또는 메시지 내용으로 검색"
          type="search"
          value={query}
        />
      </div>

      <MessageResults
        emptyDescription={emptyDescription}
        emptyTitle={emptyTitle}
        messages={messages}
      />
    </>
  );
}

export function MessagesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [activeTab, setActiveTab] = useState<MessageTab>('all');
  const [query, setQuery] = useState('');

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return messages.filter((message) => {
      const matchesFilter =
        activeFilter === 'all' || message.status === activeFilter;
      const searchableText = [
        message.parentName,
        message.className,
        message.title,
        message.description,
      ]
        .join(' ')
        .toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        searchableText.includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const starredMessages = filteredMessages.filter((message) => message.starred);
  const tabItems = [
    {
      value: 'all',
      label: tabs[0],
      content: (
        <MessageWorkspace
          activeFilter={activeFilter}
          emptyDescription="검색어 또는 필터 조건을 바꾸면 다른 메시지를 볼 수 있습니다."
          emptyTitle="조건에 맞는 메시지가 없습니다"
          messages={filteredMessages}
          onFilterChange={setActiveFilter}
          onQueryChange={setQuery}
          query={query}
        />
      ),
    },
    {
      value: 'starred',
      label: tabs[1],
      content: (
        <MessageWorkspace
          activeFilter={activeFilter}
          emptyDescription="중요한 상담 메시지에 별표를 표시하면 이곳에 모입니다."
          emptyTitle="별표 메시지가 없습니다"
          messages={starredMessages}
          onFilterChange={setActiveFilter}
          onQueryChange={setQuery}
          query={query}
        />
      ),
    },
    {
      value: 'drafts',
      label: tabs[2],
      content: (
        <EmptyState
          className="message-list-empty"
          description="작성 중 저장한 답변 초안이 생기면 이곳에서 이어서 작성할 수 있습니다."
          title="임시저장 답변이 없습니다"
        />
      ),
    },
  ];

  return (
    <div className="messages-page">
      <Tabs
        ariaLabel="메시지 분류"
        items={tabItems}
        onValueChange={(nextValue) => setActiveTab(nextValue as MessageTab)}
        value={activeTab}
      />
    </div>
  );
}
