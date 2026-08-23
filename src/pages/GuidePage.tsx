import { Badge, type BadgeVariant } from '../components/ui';

const guideItems = [
  {
    title: '위험 메시지 대응',
    badge: '긴급',
    description: '감정 표현을 낮추고 사실 확인, 관리자 공유, 후속 기록 순서로 처리합니다.',
  },
  {
    title: '상담 일정 조율',
    badge: '일반',
    description: '가능 시간대를 2개 이상 제안하고 확정 일정을 메시지에 남깁니다.',
  },
  {
    title: '민감 표현 점검',
    badge: '검토',
    description: '학생 개인정보와 단정적인 표현을 제외하고 객관 문장으로 답변합니다.',
  },
];

const guideBadgeVariant: Record<string, BadgeVariant> = {
  긴급: 'critical',
  일반: 'brand',
  검토: 'warning',
};

export function GuidePage() {
  return (
    <section className="page-section" aria-label="대응 가이드 목록">
      <div className="overview-grid">
        {guideItems.map((item) => (
          <article className="info-panel" key={item.title}>
            <Badge
              size="sm"
              variant={guideBadgeVariant[item.badge] ?? 'neutral'}
            >
              {item.badge}
            </Badge>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
