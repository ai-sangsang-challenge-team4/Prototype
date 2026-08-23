import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SVGProps,
} from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { SearchIcon, StarIcon } from '../components/layout/icons';
import {
  Accordion,
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
type DetailTab = 'conversation' | 'risk' | 'activity';
type FilterValue = 'all' | 'active' | 'complete';
type RiskGuideAction = 'original' | 'procedure';
type RiskFactorIconKind =
  | 'burden'
  | 'default'
  | 'official'
  | 'repeat'
  | 'safety';
type EmergencyProcedureIconKind = 'document' | 'history' | 'manual';

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

type RiskReviewSubmission = {
  level: SystemRiskLevel;
  reason: string;
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
    moderatedSummary: '친구와의 갈등 이후 학생 정서 확인과 후속 안내를 요청함.',
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

const systemRiskTone: Record<SystemRiskLevel, RiskLevel> = {
  low: 'normal',
  medium: 'attention',
  high: 'danger',
  emergency: 'urgent',
};

const systemRiskLabel: Record<SystemRiskLevel, string> = {
  low: '일반',
  medium: '주의',
  high: '위험',
  emergency: '긴급',
};

const systemRiskReviewLevels: SystemRiskLevel[] = [
  'low',
  'medium',
  'high',
  'emergency',
];

const threadRiskToSystemRisk: Record<RiskLevel, SystemRiskLevel> = {
  normal: 'low',
  attention: 'medium',
  danger: 'high',
  urgent: 'emergency',
};

const shouldShowBufferedSummary: Record<RiskLevel, boolean> = {
  normal: false,
  attention: true,
  danger: true,
  urgent: true,
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

const detailTabLabel: Record<DetailTab, string> = {
  conversation: '대화',
  risk: '위험 요소',
  activity: '처리 기록',
};

const detailTabs: DetailTab[] = ['conversation', 'risk', 'activity'];

function isReplyLocked(thread: BoardThread) {
  return thread.risk === 'urgent' && thread.riskReviewRequired;
}

const riskStageGuides: Record<
  SystemRiskLevel,
  {
    action?: RiskGuideAction;
    actionLabel?: string;
    description: string;
    headline: string;
    lockDescription: string;
    lockTitle: string;
    note?: string;
    procedureItems?: string[];
    procedureTitle?: string;
  }
> = {
  low: {
    headline: '‘일반’ 단계에서는 답변 초안을 사용할 수 있습니다.',
    description:
      '대화 화면에 표시된 핵심 요약과 원문을 바탕으로 학교 규정에 맞게 답변을 작성해 주세요.',
    note: 'AI 초안은 답변 작성 페이지에서 참고용으로만 제공되며, 최종 전송은 교사가 직접 결정합니다.',
    lockTitle: '답변 작성이 가능한 일반 대화입니다.',
    lockDescription: '필요한 확인을 마친 뒤 답변을 작성할 수 있습니다.',
  },
  medium: {
    headline: '‘주의’ 단계에서는 확인 후 답변을 진행합니다.',
    description:
      '위험 표현과 판단 이유를 먼저 확인하고 오해 가능성을 낮춘 문장으로 답변해 주세요.',
    note: '필요하면 원문을 열람하고 답변 초안을 직접 수정할 수 있습니다.',
    lockTitle: '확인 후 답변이 권장되는 대화입니다.',
    lockDescription: '위험 표현과 판단 근거를 확인한 뒤 답변을 작성해 주세요.',
  },
  high: {
    action: 'procedure',
    actionLabel: '대응 절차 보기',
    headline: '‘위험’ 단계에서는 자유 답변 생성이 제한됩니다.',
    description:
      '위험 근거와 원문을 확인하고, 승인된 공식 템플릿 중심으로 대응해 주세요.',
    note: '증빙 보존과 관리자 공유 여부는 교사가 직접 선택합니다.',
    procedureTitle: '위험 단계 대응 순서',
    procedureItems: [
      '위험 표현과 판단 근거 확인',
      '필요 시 원문 열람 및 열람 기록 저장',
      '증빙 패키지 생성 여부 확인',
      '승인된 공식 템플릿으로 접수 확인 또는 절차 안내',
    ],
    lockTitle: '위험도가 높은 대화입니다.',
    lockDescription:
      '공식 템플릿과 증빙 보존 절차를 확인한 뒤 답변을 진행해 주세요.',
  },
  emergency: {
    action: 'procedure',
    actionLabel: '대응 절차 보기',
    headline: '‘긴급’ 단계에서는 답변 작성이 제한됩니다.',
    description:
      '메시지와 위험 요소를 확인하고, 지정 담당자의 검토 후 공식 대응 절차에 따라 답변을 진행해 주세요.',
    note: '필요 시 위험도를 조정할 수 있으며, 원문 열람 기록은 자동으로 저장됩니다.',
    procedureTitle: '긴급 단계 대응 순서',
    procedureItems: [
      '긴급 근거와 학생 안전 신호 확인',
      '필요 시 원문 열람 및 열람 기록 저장',
      '증빙 패키지 보존',
      '지정 담당자 검토 후 공식 대응 절차 진행',
    ],
    lockTitle: '‘긴급’ 단계에서는 답변 작성이 제한됩니다.',
    lockDescription:
      '위험도 검토가 끝난 뒤 공식 절차에 맞춰 답변을 진행할 수 있습니다.',
  },
};

const emergencyProcedureSteps: {
  description: string;
  icon: EmergencyProcedureIconKind;
  title: string;
}[] = [
  {
    title: '증빙 즉시 보존',
    icon: 'document',
    description:
      '해당 메시지와 관련 자료를 즉시 증빙 보관합니다. 삭제, 수정 없이 원본 그대로 보존해야 합니다.',
  },
  {
    title: '원문 및 이력 확인',
    icon: 'history',
    description:
      '메시지의 전체 내용과 발신자 정보, 이전 이력 등을 확인하여 상황을 정확히 파악합니다.',
  },
  {
    title: '학교 공식 대응 절차 확인',
    icon: 'manual',
    description:
      '학교 및 교육청의 공식 매뉴얼에 따라 대응 절차와 보고 체계를 확인하고 따릅니다.',
  },
  {
    title: '담당 관리자/부서 연락 검토',
    icon: 'document',
    description:
      '필요 시 즉시 담당 관리자 또는 관련 부서에 상황을 공유하고 후속 조치를 협의합니다.',
  },
];

function formatNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    day: '2-digit',
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((formattedParts, part) => {
      formattedParts[part.type] = part.value;
      return formattedParts;
    }, {});

  return `${parts.year}.${parts.month}.${parts.day} ${parts.dayPeriod} ${parts.hour}:${parts.minute}`;
}

type OriginalHighlightSegment = {
  end: number;
  factor: RiskFactor;
  start: number;
};

function getVisibleRiskFactors(thread: BoardThread) {
  return (
    thread.analysis?.riskFactors.filter(
      (factor) => factor.status !== 'unknown',
    ) ?? []
  );
}

function getBufferedSummaryText(thread: BoardThread) {
  if (!shouldShowBufferedSummary[thread.risk]) {
    return undefined;
  }

  const analysisSummary =
    thread.analysis?.summary.status === 'ready'
      ? thread.analysis.summary.text
      : undefined;

  return thread.moderatedSummary ?? analysisSummary;
}

function getOriginalHighlightSegments(
  message: string,
  riskFactors: RiskFactor[],
) {
  const segments: OriginalHighlightSegment[] = [];

  riskFactors.forEach((factor) => {
    const evidence = factor.evidence.trim();

    if (!evidence) {
      return;
    }

    let searchStart = 0;
    let evidenceIndex = message.indexOf(evidence, searchStart);

    while (evidenceIndex >= 0) {
      const end = evidenceIndex + evidence.length;
      const isOverlapping = segments.some(
        (segment) => evidenceIndex < segment.end && end > segment.start,
      );

      if (!isOverlapping) {
        segments.push({
          end,
          factor,
          start: evidenceIndex,
        });
      }

      searchStart = end;
      evidenceIndex = message.indexOf(evidence, searchStart);
    }
  });

  return segments.sort((a, b) => a.start - b.start);
}

function renderHighlightedOriginalMessage({
  activeFactorId,
  message,
  onSelectRiskFactor,
  riskFactors,
}: {
  activeFactorId?: string;
  message: string;
  onSelectRiskFactor: (factorId: string) => void;
  riskFactors: RiskFactor[];
}): ReactNode {
  if (!message) {
    return '확인 가능한 원문이 없습니다.';
  }

  const segments = getOriginalHighlightSegments(message, riskFactors);

  if (segments.length === 0) {
    return message;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;

  segments.forEach((segment, index) => {
    if (cursor < segment.start) {
      nodes.push(message.slice(cursor, segment.start));
    }

    nodes.push(
      <button
        aria-label={`${segment.factor.name} 위험 표현 선택`}
        aria-pressed={activeFactorId === segment.factor.id}
        className={`board-original-highlight${
          activeFactorId === segment.factor.id ? ' is-active' : ''
        }`}
        key={`${segment.factor.id}-${segment.start}-${index}`}
        onClick={() => onSelectRiskFactor(segment.factor.id)}
        type="button"
      >
        {message.slice(segment.start, segment.end)}
      </button>,
    );

    cursor = segment.end;
  });

  if (cursor < message.length) {
    nodes.push(message.slice(cursor));
  }

  return nodes;
}

function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 13 13"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M1.44444 13C1.04722 13 0.707176 12.8586 0.424306 12.5757C0.141435 12.2928 0 11.9528 0 11.5556V1.44444C0 1.04722 0.141435 0.707176 0.424306 0.424306C0.707176 0.141435 1.04722 0 1.44444 0H6.5V1.44444H1.44444V11.5556H11.5556V6.5H13V11.5556C13 11.9528 12.8586 12.2928 12.5757 12.5757C12.2928 12.8586 11.9528 13 11.5556 13H1.44444ZM4.83889 9.17222L3.82778 8.16111L10.5444 1.44444H7.94444V0H13V5.05556H11.5556V2.45556L4.83889 9.17222Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FileSearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.5 18A1.5 1.5 0 0 1 3 16.5v-13A1.5 1.5 0 0 1 4.5 2h6.35L17 8.15V16.5a1.5 1.5 0 0 1-1.5 1.5h-11Zm5.6-9.1V3.5H4.5v13h11V8.9h-5.4Zm2.36 5.92-1.5-1.5a2.64 2.64 0 0 1-1.32.35A2.68 2.68 0 0 1 6.95 11a2.68 2.68 0 0 1 2.69-2.67A2.68 2.68 0 0 1 12.32 11c0 .48-.13.92-.35 1.3l1.5 1.5-1.01 1.02Zm-2.82-2.55A1.27 1.27 0 1 0 9.64 9.73a1.27 1.27 0 0 0 0 2.54Z"
        fill="currentColor"
      />
    </svg>
  );
}

function OriginalViewerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 22 15"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14.1875 10.6875C15.0625 9.8125 15.5 8.75 15.5 7.5C15.5 6.25 15.0625 5.1875 14.1875 4.3125C13.3125 3.4375 12.25 3 11 3C9.75 3 8.6875 3.4375 7.8125 4.3125C6.9375 5.1875 6.5 6.25 6.5 7.5C6.5 8.75 6.9375 9.8125 7.8125 10.6875C8.6875 11.5625 9.75 12 11 12C12.25 12 13.3125 11.5625 14.1875 10.6875ZM9.0875 9.4125C8.5625 8.8875 8.3 8.25 8.3 7.5C8.3 6.75 8.5625 6.1125 9.0875 5.5875C9.6125 5.0625 10.25 4.8 11 4.8C11.75 4.8 12.3875 5.0625 12.9125 5.5875C13.4375 6.1125 13.7 6.75 13.7 7.5C13.7 8.25 13.4375 8.8875 12.9125 9.4125C12.3875 9.9375 11.75 10.2 11 10.2C10.25 10.2 9.6125 9.9375 9.0875 9.4125ZM4.35 12.9625C2.35 11.6042 0.9 9.78333 0 7.5C0.9 5.21667 2.35 3.39583 4.35 2.0375C6.35 0.679167 8.56667 0 11 0C13.4333 0 15.65 0.679167 17.65 2.0375C19.65 3.39583 21.1 5.21667 22 7.5C21.1 9.78333 19.65 11.6042 17.65 12.9625C15.65 14.3208 13.4333 15 11 15C8.56667 15 6.35 14.3208 4.35 12.9625ZM16.1875 11.5125C17.7625 10.5208 18.9667 9.18333 19.8 7.5C18.9667 5.81667 17.7625 4.47917 16.1875 3.4875C14.6125 2.49583 12.8833 2 11 2C9.11667 2 7.3875 2.49583 5.8125 3.4875C4.2375 4.47917 3.03333 5.81667 2.2 7.5C3.03333 9.18333 4.2375 10.5208 5.8125 11.5125C7.3875 12.5042 9.11667 13 11 13C12.8833 13 14.6125 12.5042 16.1875 11.5125Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RiskGuideIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 25"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.5 13.5C14.0403 13.5 14.5379 13.6632 14.9795 13.9814C15.3724 14.2647 15.6584 14.6359 15.834 15.082L15.9033 15.2783L15.9043 15.2812L17.7715 21.5H19.5V24.5H4.5V21.5H6.22852L8.0957 15.2812L8.09668 15.2783C8.26113 14.7439 8.57137 14.3052 9.02051 13.9814C9.46209 13.6632 9.95974 13.5 10.5 13.5H13.5ZM6.5 16.5V19.5H0.5V16.5H6.5ZM23.5 16.5V19.5H17.5V16.5H23.5ZM5.27734 9.16992L8.82715 12.6953L9.18359 13.0488L8.82812 13.4033L7.40332 14.8281L7.04883 15.1836L6.69531 14.8271L3.16992 11.2773L2.81934 10.9238L4.92383 8.81934L5.27734 9.16992ZM21.1807 10.9238L20.8301 11.2773L17.3047 14.8271L16.9512 15.1836L16.5967 14.8281L15.1719 13.4033L14.8164 13.0488L15.1729 12.6953L18.7227 9.16992L19.0762 8.81934L21.1807 10.9238ZM13.5 6.5V12.5H10.5V6.5H13.5Z"
        fill="currentColor"
        stroke="white"
      />
    </svg>
  );
}

function RiskSectionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 25 22"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M10.9507 1.22803C11.5333 0.257113 12.9403 0.257112 13.5229 1.22803L23.7573 18.2847C24.3568 19.2844 23.636 20.5562 22.4702 20.5562H2.00342C0.837628 20.5562 0.116861 19.2844 0.716309 18.2847L10.9507 1.22803ZM12.2368 15.2935C12.0482 15.2935 11.9166 15.35 11.8071 15.4556C11.6987 15.5602 11.6461 15.6788 11.646 15.8452C11.646 16.0118 11.6986 16.1311 11.8071 16.2358C11.9166 16.3414 12.0483 16.3979 12.2368 16.3979C12.4254 16.3979 12.557 16.3414 12.6665 16.2358C12.7751 16.1311 12.8276 16.0118 12.8276 15.8452C12.8276 15.6788 12.775 15.5602 12.6665 15.4556C12.557 15.35 12.4254 15.2935 12.2368 15.2935ZM12.146 8.97705C11.8699 8.97705 11.6461 9.20098 11.646 9.47705V12.7407C11.6462 13.0167 11.87 13.2407 12.146 13.2407H12.3276C12.6037 13.2407 12.8274 13.0167 12.8276 12.7407V9.47705C12.8276 9.20098 12.6037 8.97705 12.3276 8.97705H12.146Z"
        fill="currentColor"
        stroke="white"
      />
    </svg>
  );
}

function getRiskFactorIconKind(factor: RiskFactor): RiskFactorIconKind {
  const text = `${factor.id} ${factor.name} ${factor.description}`;

  if (/법적|공식|교육청|신고|고소|민원/.test(text)) {
    return 'official';
  }

  if (/반복|다시|즉시|응답|압박|기한/.test(text)) {
    return 'repeat';
  }

  if (/요구|조치|설명|상담/.test(text)) {
    return 'burden';
  }

  if (/안전|정서|갈등|가정|생활/.test(text)) {
    return 'safety';
  }

  return 'default';
}

function RiskFactorIcon({ factor }: { factor: RiskFactor }) {
  const kind = getRiskFactorIconKind(factor);

  if (kind === 'repeat') {
    return (
      <svg
        aria-hidden="true"
        className="board-risk-factor-icon"
        fill="none"
        viewBox="0 0 25 25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="25" height="25" rx="8" fill="#F8F8F8" />
        <path
          d="M9.11111 20.5L6 17.3L9.11111 14.1L10.2 15.26L8.99444 16.5H16.8889V13.3H18.4444V18.1H8.99444L10.2 19.34L9.11111 20.5ZM7.55556 11.7V6.9H17.0056L15.8 5.66L16.8889 4.5L20 7.7L16.8889 10.9L15.8 9.74L17.0056 8.5H9.11111V11.7H7.55556Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (kind === 'burden') {
    return (
      <svg
        aria-hidden="true"
        className="board-risk-factor-icon"
        fill="none"
        viewBox="0 0 25 25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="25" height="25" rx="8" fill="#F8F8F8" />
        <path
          d="M16.6727 13.25L15.5909 12.2L17.1943 10.625L15.5909 9.06875L16.6727 8L18.2955 9.575L19.8989 8L21 9.06875L19.3773 10.625L21 12.2L19.8989 13.25L18.2955 11.6938L16.6727 13.25ZM7.99886 11.6188C7.39356 11.0312 7.09091 10.325 7.09091 9.5C7.09091 8.675 7.39356 7.96875 7.99886 7.38125C8.60417 6.79375 9.33182 6.5 10.1818 6.5C11.0318 6.5 11.7595 6.79375 12.3648 7.38125C12.9701 7.96875 13.2727 8.675 13.2727 9.5C13.2727 10.325 12.9701 11.0312 12.3648 11.6188C11.7595 12.2063 11.0318 12.5 10.1818 12.5C9.33182 12.5 8.60417 12.2063 7.99886 11.6188ZM4 18.5V16.4C4 15.975 4.11269 15.5844 4.33807 15.2281C4.56345 14.8719 4.86288 14.6 5.23636 14.4125C6.03485 14.025 6.84621 13.7344 7.67045 13.5406C8.4947 13.3469 9.33182 13.25 10.1818 13.25C11.0318 13.25 11.8689 13.3469 12.6932 13.5406C13.5174 13.7344 14.3288 14.025 15.1273 14.4125C15.5008 14.6 15.8002 14.8719 16.0256 15.2281C16.2509 15.5844 16.3636 15.975 16.3636 16.4V18.5H4Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (kind === 'official') {
    return (
      <svg
        aria-hidden="true"
        className="board-risk-factor-icon"
        fill="none"
        viewBox="0 0 25 25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="25" height="25" rx="8" fill="#F8F8F8" />
        <path
          d="M5 21.5V19.7105H15.6667V21.5H5ZM10.0222 17.1605L5 12.1053L6.86667 10.1816L11.9333 15.2368L10.0222 17.1605ZM15.6667 11.4789L10.6444 6.37895L12.5556 4.5L17.5778 9.55526L15.6667 11.4789ZM19.7556 20.6053L8.15556 8.92895L9.4 7.67632L21 19.3526L19.7556 20.6053Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="board-risk-factor-icon"
      fill="none"
      viewBox="0 0 25 25"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="25" height="25" rx="8" fill="#F8F8F8" />
      <path
        d="M12.5 4.5L4.75 18.5H20.25L12.5 4.5ZM11.75 9.75H13.25V14H11.75V9.75ZM11.75 15.25H13.25V16.75H11.75V15.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

function EmergencyProcedureStepIcon({
  kind,
}: {
  kind: EmergencyProcedureIconKind;
}) {
  if (kind === 'history') {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 50C18.6111 50 13.044 47.8819 8.29861 43.6458C3.55324 39.4097 0.833333 34.1204 0.138889 27.7778H5.83333C6.48148 32.5926 8.62269 36.5741 12.2569 39.7222C15.8912 42.8704 20.1389 44.4444 25 44.4444C30.4167 44.4444 35.0116 42.5579 38.7847 38.7847C42.5579 35.0116 44.4444 30.4167 44.4444 25C44.4444 19.5833 42.5579 14.9884 38.7847 11.2153C35.0116 7.44213 30.4167 5.55556 25 5.55556C21.8056 5.55556 18.8194 6.2963 16.0417 7.77778C13.2639 9.25926 10.9259 11.2963 9.02778 13.8889H16.6667V19.4444H0V2.77778H5.55556V9.30556C7.91667 6.34259 10.7986 4.05093 14.2014 2.43056C17.6042 0.810185 21.2037 0 25 0C28.4722 0 31.7245 0.659722 34.7569 1.97917C37.7894 3.29861 40.4282 5.08102 42.6736 7.32639C44.919 9.57176 46.7014 12.2106 48.0208 15.2431C49.3403 18.2755 50 21.5278 50 25C50 28.4722 49.3403 31.7245 48.0208 34.7569C46.7014 37.7894 44.919 40.4282 42.6736 42.6736C40.4282 44.919 37.7894 46.7014 34.7569 48.0208C31.7245 49.3403 28.4722 50 25 50ZM32.7778 36.6667L22.2222 26.1111V11.1111H27.7778V23.8889L36.6667 32.7778L32.7778 36.6667Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (kind === 'manual') {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        viewBox="0 0 53 53"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M26.5 53L9.63636 41.8111V24.1444L0 17.6667L26.5 0L53 17.6667V41.2222H48.1818V20.9056L43.3636 24.1444V41.8111L26.5 53ZM26.5 28.5611L43.0023 17.6667L26.5 6.77222L9.99773 17.6667L26.5 28.5611ZM26.5 46.3014L38.5455 38.3514V27.2361L26.5 35.3333L14.4545 27.2361V38.3514L26.5 46.3014Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 43 59"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.14286 59C4.45357 59 3.00744 58.4223 1.80446 57.2669C0.601488 56.1115 0 54.7225 0 53.1V5.9C0 4.2775 0.601488 2.88854 1.80446 1.73312C3.00744 0.577708 4.45357 0 6.14286 0H25.1089C25.928 0 26.7086 0.1475 27.4509 0.4425C28.1932 0.7375 28.8458 1.15542 29.4089 1.69625L41.2339 13.0537C41.797 13.5946 42.2321 14.2215 42.5393 14.9344C42.8464 15.6473 43 16.3971 43 17.1838V53.1C43 54.7225 42.3985 56.1115 41.1955 57.2669C39.9926 58.4223 38.5464 59 36.8571 59H6.14286ZM18.4286 5.9H6.14286V53.1H36.8571V23.6H27.6429C25.0833 23.6 22.9077 22.7396 21.1161 21.0187C19.3244 19.2979 18.4286 17.2083 18.4286 14.75V5.9ZM24.5714 5.9V14.75C24.5714 15.5858 24.8658 16.2865 25.4545 16.8519C26.0432 17.4173 26.7726 17.7 27.6429 17.7H36.8571V17.1838L25.1089 5.9H24.5714ZM15.3571 50.15C14.4869 50.15 13.7574 49.8673 13.1687 49.3019C12.5801 48.7365 12.2857 48.0358 12.2857 47.2C12.2857 46.3642 12.5801 45.6635 13.1687 45.0981C13.7574 44.5327 14.4869 44.25 15.3571 44.25H21.5C22.3702 44.25 23.0997 44.5327 23.6884 45.0981C24.2771 45.6635 24.5714 46.3642 24.5714 47.2C24.5714 48.0358 24.2771 48.7365 23.6884 49.3019C23.0997 49.8673 22.3702 50.15 21.5 50.15H15.3571ZM15.3571 38.35C14.4869 38.35 13.7574 38.0673 13.1687 37.5019C12.5801 36.9365 12.2857 36.2358 12.2857 35.4C12.2857 34.5642 12.5801 33.8635 13.1687 33.2981C13.7574 32.7327 14.4869 32.45 15.3571 32.45H27.6429C28.5131 32.45 29.2426 32.7327 29.8312 33.2981C30.4199 33.8635 30.7143 34.5642 30.7143 35.4C30.7143 36.2358 30.4199 36.9365 29.8312 37.5019C29.2426 38.0673 28.5131 38.35 27.6429 38.35H15.3571Z"
        fill="currentColor"
      />
    </svg>
  );
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

type OriginalMessageRequest = {
  evidence?: string;
};

type OriginalMessageConfirmDialogProps = {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
};

function OriginalMessageConfirmDialog({
  onCancel,
  onConfirm,
  open,
}: OriginalMessageConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="board-original-confirm-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
      role="presentation"
    >
      <section
        aria-describedby="board-original-confirm-description"
        aria-labelledby="board-original-confirm-title"
        aria-modal="true"
        className="board-original-confirm-modal"
        role="dialog"
      >
        <h2 className="sr-only" id="board-original-confirm-title">
          원문 열람 안내
        </h2>
        <button
          aria-label="닫기"
          className="board-original-confirm-close"
          onClick={onCancel}
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
        <p
          className="board-original-confirm-copy"
          id="board-original-confirm-description"
        >
          원문에는 정서적으로 부담이 될 수 있는 표현이 포함되어 있습니다.
          <br />
          원문을 확인하시겠습니까?
          <br />
          <br />
          원문을 열람하면 열람 기록이 저장됩니다.
        </p>
        <div className="board-original-confirm-actions">
          <button
            className="board-original-confirm-action"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
          <button
            className="board-original-confirm-action board-original-confirm-action--primary"
            onClick={onConfirm}
            type="button"
          >
            원문 확인
          </button>
        </div>
      </section>
    </div>
  );
}

type OriginalMessageViewerProps = {
  onClose: () => void;
  selectedEvidence?: string;
  thread: BoardThread;
};

function OriginalMessageViewer({
  onClose,
  selectedEvidence,
  thread,
}: OriginalMessageViewerProps) {
  const [isRiskListOpen, setIsRiskListOpen] = useState(true);
  const riskFactors = useMemo(() => getVisibleRiskFactors(thread), [thread]);
  const highlightedRiskFactors = useMemo(
    () =>
      riskFactors.filter(
        (factor) =>
          Boolean(factor.evidence.trim()) &&
          Boolean(thread.originalMessage?.includes(factor.evidence)),
      ),
    [riskFactors, thread.originalMessage],
  );
  const initialActiveFactorId =
    highlightedRiskFactors.find((factor) => factor.evidence === selectedEvidence)
      ?.id ??
    highlightedRiskFactors[0]?.id ??
    riskFactors[0]?.id;
  const [activeFactorId, setActiveFactorId] = useState<string | undefined>(
    initialActiveFactorId,
  );
  const [expandedFactorIds, setExpandedFactorIds] = useState<string[]>(
    initialActiveFactorId ? [initialActiveFactorId] : [],
  );
  const activeFactor = riskFactors.find(
    (factor) => factor.id === activeFactorId,
  );
  const detectedCount = highlightedRiskFactors.length || riskFactors.length;

  useEffect(() => {
    setActiveFactorId(initialActiveFactorId);
    setExpandedFactorIds(initialActiveFactorId ? [initialActiveFactorId] : []);
  }, [initialActiveFactorId, thread.id]);
  const expandAndSelectRiskFactor = (factorId: string) => {
    setActiveFactorId(factorId);
    setExpandedFactorIds((currentFactorIds) =>
      currentFactorIds.includes(factorId)
        ? currentFactorIds
        : [...currentFactorIds, factorId],
    );
  };
  const toggleRiskFactor = (factorId: string) => {
    setActiveFactorId(factorId);
    setExpandedFactorIds((currentFactorIds) =>
      currentFactorIds.includes(factorId)
        ? currentFactorIds.filter((currentFactorId) => currentFactorId !== factorId)
        : [...currentFactorIds, factorId],
    );
  };

  return (
    <div className="board-original-viewer">
      <div className="board-info-box board-original-viewer-info">
        <span aria-hidden="true">i</span>
        <p>
          원문은 학부모가 최종 전송한 내용입니다.
          <br />
          하이라이트된 표현을 선택해 탐지된 위험 요소와 판단 이유를 확인해
          주세요.
        </p>
        <button
          className="board-outline-button board-original-viewer-close"
          onClick={onClose}
          type="button"
        >
          대화로 돌아가기
        </button>
      </div>

      <section
        aria-labelledby="board-original-message-title"
        className="board-original-viewer-panel board-original-message-panel"
      >
        <div className="board-original-viewer-header">
          <div>
            <OriginalViewerIcon className="board-original-viewer-title-icon" />
            <h2 id="board-original-message-title">원문 확인</h2>
          </div>
        </div>
        <p className="board-original-viewer-message">
          {renderHighlightedOriginalMessage({
            activeFactorId,
            message: thread.originalMessage ?? '',
            onSelectRiskFactor: expandAndSelectRiskFactor,
            riskFactors,
          })}
        </p>
      </section>

      <section
        aria-labelledby="board-original-risk-title"
        className="board-original-viewer-panel board-original-risk-panel"
      >
        <div className="board-original-viewer-header">
          <div>
            <RiskGuideIcon className="board-original-risk-title-icon" />
            <h2 id="board-original-risk-title">
              탐지된 위험 표현 목록 ({detectedCount})
            </h2>
          </div>
          <button
            aria-expanded={isRiskListOpen}
            className="board-outline-button board-original-risk-toggle"
            onClick={() => setIsRiskListOpen((isOpen) => !isOpen)}
            type="button"
          >
            <span>{isRiskListOpen ? '접기' : '펼치기'}</span>
            <svg
              aria-hidden="true"
              className={isRiskListOpen ? 'is-open' : ''}
              fill="none"
              viewBox="0 0 12 8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 7.4 0 1.4 1.4 0 6 4.575 10.6 0 12 1.4 6 7.4Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {isRiskListOpen ? (
          riskFactors.length > 0 ? (
            <div className="board-original-risk-list">
              {riskFactors.map((factor) => {
                const isExpanded = expandedFactorIds.includes(factor.id);

                return (
                  <article
                    className={`board-original-risk-card${
                      isExpanded ? ' is-expanded' : ''
                    }`}
                    key={factor.id}
                  >
                    <button
                      aria-expanded={isExpanded}
                      className="board-original-risk-card-trigger"
                      onClick={() => toggleRiskFactor(factor.id)}
                      type="button"
                    >
                      <span className="board-original-risk-card-title">
                        <RiskFactorIcon factor={factor} />
                        <strong>{factor.name}</strong>
                      </span>
                      <svg
                        aria-hidden="true"
                        className={isExpanded ? 'is-open' : ''}
                        fill="none"
                        viewBox="0 0 12 8"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 7.4 0 1.4 1.4 0 6 4.575 10.6 0 12 1.4 6 7.4Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                    {factor.evidence ? (
                      <button
                        className="board-original-risk-evidence"
                        onClick={() => expandAndSelectRiskFactor(factor.id)}
                        type="button"
                      >
                        <span
                          aria-hidden="true"
                          className="board-original-risk-evidence-marker"
                        />
                        <span className="board-original-highlight">
                          “{factor.evidence}”
                        </span>
                      </button>
                    ) : null}
                    {isExpanded ? (
                      <div className="board-original-risk-detail">
                        <div>
                          <strong>설명</strong>
                          <p>{factor.description}</p>
                        </div>
                        <div>
                          <strong>판단 근거</strong>
                          <p>{factor.rationale}</p>
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              className="board-risk-empty board-risk-factor-empty"
              description="이 메시지에서는 별도 위험 요소가 감지되지 않았습니다."
              title="없음"
            />
          )
        ) : activeFactor ? (
          <p className="board-original-risk-collapsed">
            선택된 표현: “{activeFactor.evidence || activeFactor.name}”
          </p>
        ) : null}
      </section>
    </div>
  );
}

type RiskFactorTitleProps = {
  factor: RiskFactor;
};

function RiskFactorTitle({ factor }: RiskFactorTitleProps) {
  return (
    <span
      className={`board-risk-factor-title board-risk-factor-title--${factor.status}`}
    >
      <RiskFactorIcon factor={factor} />
      <span className="board-risk-factor-copy">
        <strong>{factor.name}</strong>
        <span>{factor.description}</span>
      </span>
    </span>
  );
}

type RiskFactorDetailProps = {
  factor: RiskFactor;
};

function RiskFactorDetail({ factor }: RiskFactorDetailProps) {
  return (
    <div className="board-risk-factor-detail">
      <p>{factor.rationale}</p>
    </div>
  );
}

type EmergencyProcedureModalProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function EmergencyProcedureModal({
  onOpenChange,
  open,
}: EmergencyProcedureModalProps) {
  return (
    <Modal
      className="board-emergency-procedure-modal"
      onOpenChange={onOpenChange}
      open={open}
      size="lg"
      title={<span className="sr-only">긴급 대응 절차</span>}
    >
      <div className="board-emergency-procedure">
        <div className="board-emergency-procedure-header">
          <div>
            <RiskSectionIcon />
            <h2>긴급 대응 절차 (반드시 순서대로 진행)</h2>
          </div>
          <span className="board-emergency-manual-control">
            <button
              aria-describedby="board-emergency-manual-unavailable"
              className="board-outline-button"
              disabled
              type="button"
            >
              <span>공식 대응 매뉴얼</span>
              <ExternalLinkIcon />
            </button>
            <span
              className="board-emergency-manual-note"
              id="board-emergency-manual-unavailable"
            >
              매뉴얼 URL이 아직 등록되지 않았습니다.
            </span>
          </span>
        </div>

        <div className="board-emergency-step-list" role="list">
          {emergencyProcedureSteps.map((step, index) => (
            <div className="board-emergency-step-group" key={step.title}>
              <article className="board-emergency-step-card" role="listitem">
                <div className="board-emergency-step-card-header">
                  <span className="board-emergency-step-chip">
                    STEP {index + 1}
                  </span>
                  <span className="board-emergency-step-icon">
                    <EmergencyProcedureStepIcon kind={step.icon} />
                  </span>
                </div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </article>
              {index < emergencyProcedureSteps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="board-emergency-step-arrow"
                >
                  <svg
                    fill="none"
                    viewBox="0 0 15 23"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.26115 23L0 20.9587L10.4777 11.5L0 2.04125L2.26115 0L15 11.5L2.26115 23Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

type RiskReviewPanelProps = {
  canReview: boolean;
  level: SystemRiskLevel;
  onLevelChange: (level: SystemRiskLevel) => void;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  reason: string;
  referenceLevel: SystemRiskLevel;
  threadId: string;
};

function RiskReviewPanel({
  canReview,
  level,
  onLevelChange,
  onReasonChange,
  onSubmit,
  reason,
  referenceLevel,
  threadId,
}: RiskReviewPanelProps) {
  const trimmedReason = reason.trim();
  const reasonInputId = `board-risk-review-reason-${threadId}`;
  const reasonRequirementId = `${reasonInputId}-requirement`;
  const selectedLevelIndex = Math.max(
    0,
    systemRiskReviewLevels.indexOf(level),
  );
  const referenceLevelIndex = Math.max(
    0,
    systemRiskReviewLevels.indexOf(referenceLevel),
  );
  const isDownwardReview = selectedLevelIndex < referenceLevelIndex;
  const isUpwardReview = selectedLevelIndex > referenceLevelIndex;
  const isEmergencyDowngrade =
    referenceLevel === 'emergency' && isDownwardReview;
  const isReasonRequired = isDownwardReview;
  const isSubmitDisabledByReason =
    isReasonRequired && trimmedReason.length === 0;
  const reviewInfoText = isEmergencyDowngrade
    ? '긴급 단계 하향은 관리자 또는 별도 책임자의 확인 후 반영됩니다.'
    : isDownwardReview
      ? '하향 수정 사유는 오탐 원인 분석과 임계값 재조정에 활용됩니다.'
      : isUpwardReview
        ? '상향 수정은 즉시 반영되며 수정 전후 기록이 저장됩니다.'
        : '수정 전·후 위험도, 수정자, 수정 시각은 처리 기록에 저장됩니다.';
  const submitLabel = isEmergencyDowngrade
    ? '확인 요청'
    : isDownwardReview
      ? '하향 반영'
      : isUpwardReview
        ? '상향 반영'
        : '검토 완료';
  const handleSliderChange = (value: string) => {
    onLevelChange(systemRiskReviewLevels[Number(value)]);
  };

  return (
    <section
      aria-labelledby="board-risk-review-title"
      className="board-risk-review-panel"
    >
      <div className="board-risk-review-overview">
        <div className="board-risk-review-copy">
          <h2 className="board-risk-section-title" id="board-risk-review-title">
            위험도 검토
          </h2>
          <p>이 메시지의 위험도를 어떻게 판단하시나요?</p>
        </div>

        <div
          className={`board-risk-review-slider board-risk-review-slider--${level} board-risk-review-slider-current--${referenceLevel}`}
        >
          <div className="board-risk-current-marker" aria-hidden="true">
            <span>
              <svg
                className="board-risk-current-marker-union"
                fill="none"
                viewBox="0 0 65 27"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M59 0C62.3137 0 65 2.68629 65 6V16C65 19.3137 62.3137 22 59 22H36.2109L33.4551 26.0391C33.0581 26.6209 32.1997 26.6209 31.8027 26.0391L29.0469 22H6C2.68629 22 9.66416e-08 19.3137 0 16V6C0 2.68629 2.68629 6.84522e-08 6 0H59Z"
                  fill="currentColor"
                />
              </svg>
              <strong>현재 단계</strong>
            </span>
          </div>
          <div className="board-risk-review-control">
            <span aria-hidden="true" className="board-risk-review-line" />
            <input
              aria-label="위험도 단계"
              aria-valuetext={systemRiskLabel[level]}
              className="board-risk-review-range"
              disabled={!canReview}
              max={systemRiskReviewLevels.length - 1}
              min={0}
              onChange={(event) => handleSliderChange(event.target.value)}
              step={1}
              type="range"
              value={selectedLevelIndex}
            />
            <span className="board-risk-review-thumb" />
          </div>
          <div
            aria-label="위험도 단계 선택"
            className="board-risk-review-levels"
            role="group"
          >
            {systemRiskReviewLevels.map((currentLevel) => (
              <button
                aria-pressed={level === currentLevel}
                className={
                  level === currentLevel
                    ? 'board-risk-review-level is-active'
                    : 'board-risk-review-level'
                }
                disabled={!canReview}
                key={currentLevel}
                onClick={() => onLevelChange(currentLevel)}
                type="button"
              >
                {systemRiskLabel[currentLevel]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="board-risk-review-reason">
        <label htmlFor={reasonInputId}>
          <span>검토 사유 </span>
          {isReasonRequired ? (
            <strong>
              <span aria-hidden="true">*</span>
              <span className="sr-only">필수</span>
            </strong>
          ) : null}
        </label>
        <div className="board-risk-review-textarea-shell">
          <textarea
            aria-describedby={
              isReasonRequired ? reasonRequirementId : undefined
            }
            aria-required={isReasonRequired ? true : undefined}
            disabled={!canReview}
            id={reasonInputId}
            maxLength={300}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder={
              isReasonRequired
                ? '하향 수정 사유를 입력해주세요.'
                : '검토 사유를 입력해주세요.'
            }
            value={reason}
          />
          <span>{reason.length} / 300</span>
        </div>
        {isReasonRequired ? (
          <p
            className="board-risk-review-required-note"
            id={reasonRequirementId}
          >
            하향 검토 시 검토 사유를 입력해야 하향 반영할 수 있습니다.
          </p>
        ) : null}
      </div>

      <div className="board-risk-review-footer">
        <div className="board-risk-review-info">
          <svg
            aria-hidden="true"
            fill="none"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 15H11V9H9V15ZM10.7125 6.7125C10.9042 6.52083 11 6.28333 11 6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6C9 6.28333 9.09583 6.52083 9.2875 6.7125C9.47917 6.90417 9.71667 7 10 7C10.2833 7 10.5208 6.90417 10.7125 6.7125ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z"
              fill="currentColor"
            />
          </svg>
          <span>{reviewInfoText}</span>
        </div>
        <button
          aria-describedby={
            isSubmitDisabledByReason ? reasonRequirementId : undefined
          }
          className="board-primary-button board-risk-review-submit"
          disabled={!canReview || isSubmitDisabledByReason}
          onClick={onSubmit}
          type="button"
        >
          {submitLabel}
        </button>
      </div>
    </section>
  );
}

type RiskAnalysisPanelProps = {
  onReviewComplete: (threadId: string, review: RiskReviewSubmission) => void;
  onOriginalOpen: (evidence?: string) => void;
  onReviewRequest: (threadId: string) => void;
  thread: BoardThread;
};

function RiskAnalysisPanel({
  onReviewComplete,
  onOriginalOpen,
  onReviewRequest,
  thread,
}: RiskAnalysisPanelProps) {
  const [isProcedureOpen, setIsProcedureOpen] = useState(false);
  const [isEmergencyProcedureModalOpen, setIsEmergencyProcedureModalOpen] =
    useState(false);
  const analysis = thread.analysis;
  const initialReviewLevel =
    analysis?.teacherReviewedRiskLevel ?? analysis?.systemRiskLevel ?? 'low';
  const [reviewLevel, setReviewLevel] =
    useState<SystemRiskLevel>(initialReviewLevel);
  const [reviewReason, setReviewReason] = useState(
    analysis?.teacherReviewReason ?? '',
  );

  useEffect(() => {
    setReviewLevel(initialReviewLevel);
    setReviewReason(analysis?.teacherReviewReason ?? '');
  }, [analysis?.teacherReviewReason, initialReviewLevel, thread.id]);

  if (!analysis) {
    return (
      <EmptyState
        className="board-risk-empty"
        description="AI 분석 결과가 연결되면 위험 요소와 판단 근거를 확인할 수 있습니다."
        title="표시할 위험 요소가 없습니다"
      />
    );
  }

  const canInspectOriginal = Boolean(
    analysis.canViewOriginal &&
      analysis.originalMessageAvailable &&
      thread.originalMessage,
  );
  const effectiveRiskLevel =
    analysis.teacherReviewedRiskLevel ?? analysis.systemRiskLevel;
  const currentTone = systemRiskTone[effectiveRiskLevel];
  const currentGuide = riskStageGuides[effectiveRiskLevel];
  const visibleRiskFactors = analysis.riskFactors.filter(
    (factor) => factor.status !== 'unknown',
  );
  const studentSafetyFactor = visibleRiskFactors.find((factor) =>
    /안전|정서|학생/.test(
      `${factor.id} ${factor.name} ${factor.description}`,
    ),
  );
  const riskFactorItems = visibleRiskFactors.map((factor) => ({
    id: factor.id,
    title: <RiskFactorTitle factor={factor} />,
    content: <RiskFactorDetail factor={factor} />,
  }));
  const hasGuideAction = Boolean(currentGuide.action && currentGuide.actionLabel);
  const isProcedureGuide = currentGuide.action === 'procedure';
  const isEmergencyGuide = effectiveRiskLevel === 'emergency';
  const canUseGuideAction =
    hasGuideAction && (isProcedureGuide || canInspectOriginal);
  const canShowEvidenceOriginalButton =
    effectiveRiskLevel !== 'low' && canInspectOriginal;
  const canShowReviewPanel =
    analysis.canReviewRisk ||
    Boolean(analysis.teacherReviewedRiskLevel) ||
    analysis.safetyLock ||
    thread.riskReviewRequired;
  const canShowStudentSafetyCard = analysis.studentSafetySignal !== 'NONE';
  const handleGuideAction = () => {
    if (isEmergencyGuide) {
      setIsEmergencyProcedureModalOpen(true);
      return;
    }

    if (isProcedureGuide) {
      setIsProcedureOpen((isOpen) => !isOpen);
      return;
    }

    if (currentGuide.action === 'original') {
      onOriginalOpen();
    }
  };
  const handleReviewSubmit = () => {
    const reason = reviewReason.trim();
    const selectedLevelIndex = systemRiskReviewLevels.indexOf(reviewLevel);
    const referenceLevelIndex = systemRiskReviewLevels.indexOf(initialReviewLevel);

    if (
      !analysis.canReviewRisk ||
      (selectedLevelIndex < referenceLevelIndex && !reason)
    ) {
      return;
    }

    onReviewComplete(thread.id, {
      level: reviewLevel,
      reason,
    });
  };

  return (
    <div className="board-risk-tab">
      <section
        className={`board-risk-guide board-risk-guide--${currentTone}${
          isProcedureOpen ? ' is-expanded' : ''
        }`}
      >
        <div className="board-risk-guide-copy">
          <RiskGuideIcon className="board-risk-guide-icon" />
          <strong>{currentGuide.headline}</strong>
          {hasGuideAction ? (
            <button
              className="board-outline-button board-risk-action-button board-risk-guide-button"
              disabled={!canUseGuideAction}
              onClick={handleGuideAction}
              aria-expanded={
                isProcedureGuide && !isEmergencyGuide
                  ? isProcedureOpen
                  : undefined
              }
              aria-haspopup={isEmergencyGuide ? 'dialog' : undefined}
              type="button"
            >
              <span>{currentGuide.actionLabel}</span>
              <ExternalLinkIcon />
            </button>
          ) : null}
          <span className="board-risk-guide-description">
            {currentGuide.description}
            {currentGuide.note ? (
              <>
                <br />
                {currentGuide.note}
              </>
            ) : null}
          </span>
          {isProcedureGuide && isProcedureOpen ? (
            <div className="board-risk-guide-procedure">
              <strong>{currentGuide.procedureTitle}</strong>
              <ol>
                {currentGuide.procedureItems?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
              {thread.officialTemplates?.length ? (
                <p>
                  사용 가능 템플릿: {thread.officialTemplates.join(', ')}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="board-risk-evidence-panel">
        <div className="board-risk-section-header">
          <div>
            <RiskSectionIcon />
            <h2 className="board-risk-section-title">
              확인된 위험 요소와 판단 근거
            </h2>
          </div>
          {canShowEvidenceOriginalButton ? (
            <button
              className="board-outline-button board-risk-action-button"
              onClick={() => onOriginalOpen()}
              type="button"
            >
              <span>원문 보기</span>
              <ExternalLinkIcon />
            </button>
          ) : null}
        </div>

        {riskFactorItems.length > 0 ? (
          <Accordion
            allowMultiple
            className="board-risk-factor-accordion"
            items={riskFactorItems}
          />
        ) : (
          <EmptyState
            className="board-risk-empty board-risk-factor-empty"
            description="이 메시지에서는 별도 위험 요소가 감지되지 않았습니다."
            title="없음"
          />
        )}
      </section>

      {canShowReviewPanel ? (
        <RiskReviewPanel
          canReview={analysis.canReviewRisk}
          level={reviewLevel}
          onLevelChange={setReviewLevel}
          onReasonChange={setReviewReason}
          onSubmit={handleReviewSubmit}
          reason={reviewReason}
          referenceLevel={initialReviewLevel}
          threadId={thread.id}
        />
      ) : null}

      {analysis.safetyLock || thread.riskReviewRequired ? (
        <section className="board-risk-lock-review">
          <div className="board-risk-lock-content">
            <div className="board-risk-lock-notice">
              <div className="board-risk-lock-heading">
                <span className="board-lock-icon" aria-hidden="true">
                  <svg
                    fill="none"
                    viewBox="0 0 25 25"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12.5" cy="12.5" fill="#FF4B6C" r="12.5" />
                    <path
                      d="M8.375 19C7.99688 19 7.67318 18.8788 7.40391 18.6363C7.13464 18.3938 7 18.1024 7 17.7619V11.5714C7 11.231 7.13464 10.9395 7.40391 10.697C7.67318 10.4546 7.99688 10.3333 8.375 10.3333H9.0625V9.09524C9.0625 8.23889 9.39766 7.50893 10.068 6.90536C10.7383 6.30179 11.549 6 12.5 6C13.451 6 14.2617 6.30179 14.932 6.90536C15.6023 7.50893 15.9375 8.23889 15.9375 9.09524V10.3333H16.625C17.0031 10.3333 17.3268 10.4546 17.5961 10.697C17.8654 10.9395 18 11.231 18 11.5714V17.7619C18 18.1024 17.8654 18.3938 17.5961 18.6363C17.3268 18.8788 17.0031 19 16.625 19H8.375ZM13.4711 15.5411C13.7404 15.2986 13.875 15.0071 13.875 14.6667C13.875 14.3262 13.7404 14.0347 13.4711 13.7923C13.2018 13.5498 12.8781 13.4286 12.5 13.4286C12.1219 13.4286 11.7982 13.5498 11.5289 13.7923C11.2596 14.0347 11.125 14.3262 11.125 14.6667C11.125 15.0071 11.2596 15.2986 11.5289 15.5411C11.7982 15.7835 12.1219 15.9048 12.5 15.9048C12.8781 15.9048 13.2018 15.7835 13.4711 15.5411ZM10.4375 10.3333H14.5625V9.09524C14.5625 8.57937 14.362 8.14087 13.9609 7.77976C13.5599 7.41865 13.0729 7.2381 12.5 7.2381C11.9271 7.2381 11.4401 7.41865 11.0391 7.77976C10.638 8.14087 10.4375 8.57937 10.4375 9.09524V10.3333Z"
                      fill="white"
                    />
                  </svg>
                </span>
                <strong>현재 답변 작성이 제한되어 있습니다.</strong>
              </div>
              <p>담당자가 위험도를 검토한 후 답변을 작성할 수 있습니다.</p>
            </div>
          </div>
          <div className="board-risk-lock-actions">
            <button
              className="board-outline-button board-risk-recheck-button"
              disabled={!analysis.canReviewRisk}
              onClick={() => onReviewRequest(thread.id)}
              type="button"
            >
              재검토 요청
            </button>
          </div>
        </section>
      ) : null}

      {canShowStudentSafetyCard ? (
        <section className="board-student-safety-card">
          <div className="board-student-safety-content">
            <div className="board-student-safety-copy">
              <h2>학생 안전 관련 확인</h2>
              <div className="board-student-safety-row">
                <p>
                  <span>
                    학생 안전과 관련해 추가 확인이 필요할 수 있습니다.
                  </span>
                  <span>
                    자동 신고는 진행되지 않으며, 필요한 경우 내용을 직접
                    확인해주세요.
                  </span>
                </p>
                <button
                  className="board-outline-button board-risk-action-button"
                  disabled={!canInspectOriginal}
                  onClick={() => onOriginalOpen(studentSafetyFactor?.evidence)}
                  type="button"
                >
                  <span>관련 내용 확인</span>
                  <ExternalLinkIcon />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <EmergencyProcedureModal
        onOpenChange={setIsEmergencyProcedureModalOpen}
        open={isEmergencyProcedureModalOpen}
      />
    </div>
  );
}

type ActivityLogPanelProps = {
  thread: BoardThread;
};

function ActivityLogPanel({ thread }: ActivityLogPanelProps) {
  const logs = thread.analysis?.activityLogs ?? [];

  if (logs.length === 0) {
    return (
      <EmptyState
        className="board-risk-empty"
        description="위험 요소 확인, 원문 열람, 재검토 요청 기록이 이곳에 쌓입니다."
        title="처리 기록이 없습니다"
      />
    );
  }

  return (
    <section className="board-activity-panel" aria-label="처리 기록">
      <div className="board-risk-section-header">
        <div>
          <FileSearchIcon aria-hidden="true" />
          <h2 className="board-risk-section-title">처리 기록</h2>
        </div>
      </div>
      <ol className="board-activity-list">
        {logs.map((log) => (
          <li key={log.id}>
            <time>{log.time}</time>
            <div>
              <strong>{log.action}</strong>
              <span>{log.actor}</span>
              <p>{log.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

type DetailProps = {
  initialTab?: DetailTab;
  onBack: () => void;
  onOpenReplyComposer: (threadId: string) => void;
  onOriginalViewed: (threadId: string, evidence?: string) => void;
  onReviewComplete: (threadId: string, review: RiskReviewSubmission) => void;
  onReviewRequest: (threadId: string) => void;
  thread: BoardThread;
};

function ThreadDetail({
  initialTab,
  onBack,
  onOpenReplyComposer,
  onOriginalViewed,
  onReviewComplete,
  onReviewRequest,
  thread,
}: DetailProps) {
  const [activeDetailTab, setActiveDetailTab] =
    useState<DetailTab>(initialTab ?? 'conversation');
  const [originalRequest, setOriginalRequest] =
    useState<OriginalMessageRequest | null>(null);
  const [originalViewer, setOriginalViewer] =
    useState<OriginalMessageRequest | null>(null);
  const isLocked = isReplyLocked(thread);
  const hasDraft = thread.draftText.trim().length > 0;
  const lockedGuide =
    riskStageGuides[
      thread.analysis?.systemRiskLevel ?? threadRiskToSystemRisk[thread.risk]
    ];
  const bufferedSummaryText = getBufferedSummaryText(thread);
  const visibleConversationReplies = bufferedSummaryText
    ? thread.replies.filter((reply) => reply.authorRole !== 'parent')
    : thread.replies;
  const showBufferedSummaryOnly =
    Boolean(bufferedSummaryText) && visibleConversationReplies.length === 0;
  const canInspectOriginal = Boolean(
    thread.analysis?.canViewOriginal &&
      thread.analysis.originalMessageAvailable &&
      thread.originalMessage,
  );

  useEffect(() => {
    setActiveDetailTab(initialTab ?? 'conversation');
    setOriginalRequest(null);
    setOriginalViewer(null);
  }, [initialTab, thread.id]);

  const openOriginalViewer = (evidence?: string) => {
    if (!canInspectOriginal) {
      return;
    }

    setOriginalRequest({ evidence });
  };

  const confirmOriginalViewer = () => {
    if (!originalRequest) {
      return;
    }

    setOriginalViewer(originalRequest);
    setOriginalRequest(null);
    onOriginalViewed(thread.id, originalRequest.evidence);
  };

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
          {originalViewer ? (
            <>
              <span>{detailTabLabel[activeDetailTab]}</span>
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
              <strong>원문 열람</strong>
            </>
          ) : (
            <strong>{detailTabLabel[activeDetailTab]}</strong>
          )}
        </nav>
      </header>

      <nav aria-label="메시지 상세 탭" className="board-detail-tabs">
        {detailTabs.map((tab) => (
          <button
            aria-current={activeDetailTab === tab ? 'page' : undefined}
            className={activeDetailTab === tab ? 'is-active' : ''}
            key={tab}
            onClick={() => {
              setActiveDetailTab(tab);
              setOriginalRequest(null);
              setOriginalViewer(null);
            }}
            type="button"
          >
            {detailTabLabel[tab]}
          </button>
        ))}
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

      {originalViewer ? (
        <OriginalMessageViewer
          onClose={() => setOriginalViewer(null)}
          selectedEvidence={originalViewer.evidence}
          thread={thread}
        />
      ) : null}

      {!originalViewer && activeDetailTab === 'conversation' ? (
        <>
          <div className="board-info-box">
            <span aria-hidden="true">i</span>
            <p>
              학부모 게시글은 완화된 내용으로 먼저 표시됩니다. 필요 시 원문
              보기와 판단 근거를 함께 확인한 뒤 답변을 남길 수 있습니다.
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

        {bufferedSummaryText ? (
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
                  <p>{bufferedSummaryText}</p>
                </div>
                <div className="board-moderation-actions">
                  <button
                    disabled={!canInspectOriginal}
                    onClick={() => openOriginalViewer()}
                    type="button"
                  >
                    원문 보기
                  </button>
                  <button
                    onClick={() => setActiveDetailTab('risk')}
                    type="button"
                  >
                    판단 근거
                  </button>
                </div>
              </div>
              <time>{thread.replies[0]?.time ?? thread.latestAtLabel}</time>
            </div>
          </article>
        ) : null}

        {visibleConversationReplies.map((reply) => (
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
              {reply.authorRole === 'parent' ? <time>{reply.time}</time> : null}
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
                  <strong>{lockedGuide.lockTitle}</strong>
                  <p>{lockedGuide.lockDescription}</p>
                </div>
              </div>
              <button
                className="board-outline-button board-risk-review-button"
                onClick={() => setActiveDetailTab('risk')}
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
              <div className="board-answer-cta-copy">
                <strong>답변 작성이 필요합니다.</strong>
                <p>
                  학부모 메시지와 위험 요소를 확인한 뒤 답변 작성 도우미에서
                  초안을 다듬을 수 있습니다.
                </p>
              </div>
              <div className="board-answer-actions board-answer-actions--cta">
                {hasDraft ? <span>작성 중인 답변이 있습니다</span> : null}
                <button
                  className="board-primary-button board-reply-compose-button"
                  onClick={() => onOpenReplyComposer(thread.id)}
                  type="button"
                >
                  {hasDraft ? '답변 이어서 작성하기' : '답변 작성하러 가기'}
                </button>
              </div>
            </>
          )}
          </div>
          </div>
        </>
      ) : null}

      {!originalViewer && activeDetailTab === 'risk' ? (
        <RiskAnalysisPanel
          onReviewComplete={onReviewComplete}
          onOriginalOpen={openOriginalViewer}
          onReviewRequest={onReviewRequest}
          thread={thread}
        />
      ) : null}

      {!originalViewer && activeDetailTab === 'activity' ? (
        <ActivityLogPanel thread={thread} />
      ) : null}

      <OriginalMessageConfirmDialog
        onCancel={() => setOriginalRequest(null)}
        onConfirm={confirmOriginalViewer}
        open={originalRequest !== null}
      />
    </section>
  );
}

type ReplyComposerPageProps = {
  onBack: () => void;
  onDraftChange: (threadId: string, value: string) => void;
  onSubmitReply: (threadId: string) => void;
  thread: BoardThread;
};

function ReplyComposerPage({
  onBack,
  onDraftChange,
  onSubmitReply,
  thread,
}: ReplyComposerPageProps) {
  const hasDraft = thread.draftText.trim().length > 0;
  const bufferedSummaryText = getBufferedSummaryText(thread);
  const isLocked = isReplyLocked(thread);
  const lockNoticeId = `board-reply-lock-notice-${thread.id}`;
  const helperItems = [
    '사실 확인이 필요한 내용은 단정하지 않고 확인 예정으로 표현합니다.',
    '학생 안전이나 정서 관련 내용은 관찰 및 상담 계획과 함께 안내합니다.',
    '최종 전송 전 학교 규정과 공유 범위를 다시 확인합니다.',
  ];

  return (
    <section className="board-detail" aria-labelledby="board-composer-title">
      <header className="board-detail-page-header">
        <div className="board-detail-title-group">
          <button
            aria-label="메시지 상세로 돌아가기"
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
          <h1 id="board-composer-title">답변 작성</h1>
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
          <strong>답변 작성</strong>
        </nav>
      </header>

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

      <div className="board-reply-composer">
        <section className="board-reply-context-panel">
          <h2>메시지 확인</h2>
          <p>{bufferedSummaryText ?? thread.latestMessage}</p>
        </section>

        <section className="board-reply-helper-panel">
          <h2>작성 도움말</h2>
          <ul>
            {helperItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="board-reply-compose-panel">
          <label htmlFor="board-reply-composer-input">선생님 답변</label>
          {isLocked ? (
            <p className="board-reply-lock-notice" id={lockNoticeId}>
              긴급 위험도 검토가 필요한 메시지는 위험 요소 탭에서 검토를
              완료한 뒤 답변을 전송할 수 있습니다.
            </p>
          ) : null}
          <textarea
            aria-describedby={isLocked ? lockNoticeId : undefined}
            disabled={isLocked}
            id="board-reply-composer-input"
            onChange={(event) => onDraftChange(thread.id, event.target.value)}
            placeholder="학부모에게 전달할 답변을 작성하세요."
            rows={8}
            value={thread.draftText}
          />
          <div className="board-reply-compose-actions">
            <span>
              {isLocked
                ? '위험도 검토 필요'
                : hasDraft
                  ? '임시저장됨'
                  : '작성 중인 답변 없음'}
            </span>
            <div>
              <button
                className="board-outline-button"
                onClick={onBack}
                type="button"
              >
                상세로 돌아가기
              </button>
              <button
                aria-describedby={isLocked ? lockNoticeId : undefined}
                className="board-primary-button board-reply-send-button"
                disabled={isLocked || !hasDraft}
                onClick={() => {
                  if (!isLocked) {
                    onSubmitReply(thread.id);
                  }
                }}
                type="button"
              >
                전송
              </button>
            </div>
          </div>
        </section>
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
  const [initialDetailTabRequest, setInitialDetailTabRequest] = useState<{
    tab: DetailTab;
    threadId: string;
  } | null>(null);
  const [query, setQuery] = useState('');
  const [replyComposerThreadId, setReplyComposerThreadId] = useState<
    string | null
  >(null);
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
  const replyComposerThread =
    threads.find((thread) => thread.id === replyComposerThreadId) ?? null;
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
    setInitialDetailTabRequest(null);
    setReplyComposerThreadId(null);

    if (thread?.draftText.trim()) {
      setDraftPromptThreadId(threadId);
      return;
    }

    setSelectedThreadId(threadId);
  };

  const handleContinueDraft = () => {
    const thread = threads.find(
      (currentThread) => currentThread.id === draftPromptThreadId,
    );

    if (thread) {
      setSelectedThreadId(thread.id);

      if (isReplyLocked(thread)) {
        setInitialDetailTabRequest({ tab: 'risk', threadId: thread.id });
        setReplyComposerThreadId(null);
      } else {
        setInitialDetailTabRequest(null);
        setReplyComposerThreadId(thread.id);
      }
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

  const handleOpenReplyComposer = (threadId: string) => {
    const thread = threads.find((currentThread) => currentThread.id === threadId);

    setSelectedThreadId(threadId);
    if (thread && isReplyLocked(thread)) {
      setInitialDetailTabRequest({ tab: 'risk', threadId });
      setReplyComposerThreadId(null);
      return;
    }

    setInitialDetailTabRequest(null);
    setReplyComposerThreadId(threadId);
  };

  const handleReviewComplete = (
    threadId: string,
    review: RiskReviewSubmission,
  ) => {
    updateThread(threadId, (thread) => {
      if (!thread.analysis) {
        return thread;
      }

      const modifiedAt = formatNow();
      const beforeLevel =
        thread.analysis.teacherReviewedRiskLevel ??
        thread.analysis.systemRiskLevel;
      const beforeLevelIndex = systemRiskReviewLevels.indexOf(beforeLevel);
      const afterLevelIndex = systemRiskReviewLevels.indexOf(review.level);
      const isDownwardReview = afterLevelIndex < beforeLevelIndex;
      const isUpwardReview = afterLevelIndex > beforeLevelIndex;
      const isEmergencyDowngrade =
        beforeLevel === 'emergency' && isDownwardReview;
      const reviewReason = review.reason.trim();

      if (isDownwardReview && !reviewReason) {
        return thread;
      }

      if (isEmergencyDowngrade) {
        return {
          ...thread,
          analysis: {
            ...thread.analysis,
            activityLogs: [
              ...thread.analysis.activityLogs,
              {
                id: `${thread.id}-emergency-downgrade-${
                  thread.analysis.activityLogs.length + 1
                }`,
                time: modifiedAt,
                actor: '조예인 선생님',
                action: '긴급 위험도 하향 확인 요청',
                detail: `수정 전 위험도: ${systemRiskLabel[beforeLevel]}, 요청 위험도: ${systemRiskLabel[review.level]}, 수정 사유: "${reviewReason}", 수정자: 조예인 선생님, 수정 시각: ${modifiedAt}. 관리자 또는 별도 책임자의 확인 후 반영됩니다.`,
              },
            ],
            teacherReviewReason: reviewReason,
          },
        };
      }

      const action = isDownwardReview
        ? '위험도 하향 수정'
        : isUpwardReview
          ? '위험도 상향 수정'
          : '위험도 검토 완료';
      const reasonDetail = reviewReason
        ? `수정 사유: "${reviewReason}"`
        : '수정 사유: 해당 없음';

      return {
        ...thread,
        analysis: {
          ...thread.analysis,
          activityLogs: [
            ...thread.analysis.activityLogs,
            {
              id: `${thread.id}-review-${thread.analysis.activityLogs.length + 1}`,
              time: modifiedAt,
              actor: '조예인 선생님',
              action,
              detail: `수정 전 위험도: ${systemRiskLabel[beforeLevel]}, 수정 후 위험도: ${systemRiskLabel[review.level]}, ${reasonDetail}, 수정자: 조예인 선생님, 수정 시각: ${modifiedAt}.`,
            },
          ],
          safetyLock: false,
          teacherReviewReason: reviewReason || undefined,
          teacherReviewedRiskLevel: review.level,
        },
        risk: systemRiskTone[review.level],
        riskReviewRequired: false,
        status: 'inProgress',
      };
    });
  };

  const handleReviewRequest = (threadId: string) => {
    updateThread(threadId, (thread) => {
      if (!thread.analysis) {
        return thread;
      }

      return {
        ...thread,
        analysis: {
          ...thread.analysis,
          activityLogs: [
            ...thread.analysis.activityLogs,
            {
              id: `${thread.id}-review-request-${
                thread.analysis.activityLogs.length + 1
              }`,
              time: formatNow(),
              actor: '조예인 선생님',
              action: '위험도 재검토 요청',
              detail: '담당자에게 위험도 재검토를 요청했습니다.',
            },
          ],
        },
      };
    });
  };

  const handleOriginalViewed = (threadId: string, evidence?: string) => {
    updateThread(threadId, (thread) => {
      if (!thread.analysis) {
        return thread;
      }

      return {
        ...thread,
        analysis: {
          ...thread.analysis,
          activityLogs: [
            ...thread.analysis.activityLogs,
            {
              id: `${thread.id}-original-${thread.analysis.activityLogs.length + 1}`,
              time: formatNow(),
              actor: '조예인 선생님',
              action: '원문 확인',
              detail: evidence
                ? `판단 근거 "${evidence}" 위치를 원문에서 확인했습니다.`
                : '학부모 원문 전체를 확인했습니다.',
            },
          ],
        },
      };
    });
  };

  const handleSubmitReply = (threadId: string) => {
    const thread = threads.find((currentThread) => currentThread.id === threadId);

    if (thread && isReplyLocked(thread)) {
      setSelectedThreadId(threadId);
      setInitialDetailTabRequest({ tab: 'risk', threadId });
      setReplyComposerThreadId(null);
      return;
    }

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
    setInitialDetailTabRequest(null);
    setReplyComposerThreadId(null);
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

  if (replyComposerThread) {
    return (
      <section className={pageClassName} aria-labelledby="board-composer-title">
        <Sidebar
          activeItem="messages"
          defaultCollapsed={isSidebarCollapsed}
          messageCount={2}
          onCollapsedChange={setIsSidebarCollapsed}
        />
        <main className="board-detail-page">
          <ReplyComposerPage
            onBack={() => setReplyComposerThreadId(null)}
            onDraftChange={handleDraftChange}
            onSubmitReply={handleSubmitReply}
            thread={replyComposerThread}
          />
        </main>
      </section>
    );
  }

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
            initialTab={
              initialDetailTabRequest?.threadId === selectedThread.id
                ? initialDetailTabRequest.tab
                : undefined
            }
            onBack={() => {
              setInitialDetailTabRequest(null);
              setSelectedThreadId(null);
            }}
            onOpenReplyComposer={handleOpenReplyComposer}
            onOriginalViewed={handleOriginalViewed}
            onReviewComplete={handleReviewComplete}
            onReviewRequest={handleReviewRequest}
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
