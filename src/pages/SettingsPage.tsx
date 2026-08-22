const settings = [
  {
    title: '프로필',
    description: '조예인 선생님 · 숙명초등학교',
  },
  {
    title: '알림',
    description: '읽지 않은 메시지와 관리자 공유 요청을 표시합니다.',
  },
  {
    title: '도움말',
    description: '상담 대응 기록과 메시지 작성 기준을 확인합니다.',
  },
];

export function SettingsPage() {
  return (
    <section className="page-section" aria-label="설정 항목">
      <div className="overview-grid">
        {settings.map((item) => (
          <article className="info-panel" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
