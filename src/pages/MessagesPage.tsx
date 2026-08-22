import {
  AlertIcon,
  ChevronDownIcon,
  SearchIcon,
  StarIcon,
} from '../components/layout/icons';

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
        <span className={`message-status status-${message.status}`}>
          {statusLabel[message.status]}
        </span>
        <time>{message.date}</time>
      </div>
    </article>
  );
}

export function MessagesPage() {
  return (
    <div className="messages-page">
      <div className="tab-list" role="tablist" aria-label="메시지 분류">
        {tabs.map((tab, index) => (
          <button
            aria-selected={index === 0}
            className={`tab-button${index === 0 ? ' is-active' : ''}`}
            key={tab}
            role="tab"
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="message-toolbar">
        <button className="filter-button" type="button">
          <span>전체 상담</span>
          <ChevronDownIcon />
        </button>

        <label className="search-field">
          <span className="sr-only">메시지 검색</span>
          <input placeholder="이름 또는 메시지 내용으로 검색" type="search" />
          <SearchIcon />
        </label>
      </div>

      <section className="message-list" aria-label="받은 메시지 목록">
        {messages.map((message) => (
          <MessageRow
            key={`${message.parentName}-${message.title}`}
            message={message}
          />
        ))}
      </section>
    </div>
  );
}
