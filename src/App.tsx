import type { CSSProperties } from 'react';

const foundations = [
  {
    title: '전역 스타일',
    description: 'CSS Reset, Pretendard, body 기본 배경과 텍스트 스타일',
  },
  {
    title: 'Design Token',
    description: '색상, 타이포그래피, 간격, radius, border, shadow 변수',
  },
  {
    title: '상태 스타일',
    description: 'Hover, active, disabled, focus-visible 기본 인터랙션',
  },
];

const colorTokens: Array<{
  name: string;
  value: string;
  swatchStyle: CSSProperties;
}> = [
  {
    name: 'Primary / Blue 100',
    value: '#3B5BDB',
    swatchStyle: { background: 'var(--color-blue-100)' },
  },
  {
    name: 'Primary / Blue 10',
    value: '#EBEFFB',
    swatchStyle: { background: 'var(--color-blue-10)' },
  },
  {
    name: 'Gray / 100',
    value: '#111111',
    swatchStyle: { background: 'var(--color-gray-100)' },
  },
  {
    name: 'Surface / Light',
    value: '#F8F8F8',
    swatchStyle: { background: 'var(--color-bg-canvas)' },
  },
  {
    name: 'Border / Default',
    value: '#A2A2A2',
    swatchStyle: { background: 'var(--color-border-default)' },
  },
  {
    name: 'Yellow / 2',
    value: '#FFE400',
    swatchStyle: { background: 'var(--color-yellow-2)' },
  },
  {
    name: 'Pink / 3',
    value: '#FF4B6C',
    swatchStyle: { background: 'var(--color-pink-3)' },
  },
  {
    name: 'Red',
    value: '#FD2D27',
    swatchStyle: { background: 'var(--color-red)' },
  },
  {
    name: 'Drop Shadow',
    value: '0 0 10px / 10%',
    swatchStyle: {
      background: 'var(--color-bg-surface)',
      boxShadow: 'var(--shadow-sm)',
    },
  },
  {
    name: 'Surface / Icon',
    value: '#333F49',
    swatchStyle: { background: 'var(--color-bg-icon)' },
  },
];

export default function App() {
  return (
    <main className="app">
      <section className="workspace" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">Design System</p>
          <h1 id="page-title">CSS 디자인 시스템 초기 설정</h1>
          <p>
            Figma export에서 확인한 blue 중심 팔레트와 기본 UI 토큰을 CSS
            변수로 정리한 시작점입니다.
          </p>
        </div>

        <div className="button-row" aria-label="버튼 상태 예시">
          <button className="button button-primary" type="button">
            Primary
          </button>
          <button className="button button-secondary" type="button">
            Secondary
          </button>
          <button className="button button-secondary" type="button" disabled>
            Disabled
          </button>
        </div>

        <div className="panel" aria-label="디자인 시스템 구성 항목">
          {foundations.map((item, index) => (
            <article className="step" key={item.title}>
              <span>{index + 1}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <section className="token-section" aria-labelledby="token-title">
          <h2 className="section-title" id="token-title">
            대표 토큰
          </h2>
          <div className="token-grid">
            {colorTokens.map((token) => (
              <article className="token-card" key={token.name}>
                <div className="token-swatch" style={token.swatchStyle} />
                <div className="token-meta">
                  <strong className="token-name">{token.name}</strong>
                  <span className="token-value">{token.value}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
