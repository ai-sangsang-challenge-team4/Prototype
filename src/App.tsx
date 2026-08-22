const steps = ['아이디어 정리', '화면 흐름 설계', '사용자 테스트'];

export default function App() {
  return (
    <main className="app">
      <section className="workspace" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">React Prototype</p>
          <h1 id="page-title">사용자 프로토타입</h1>
          <p>
            핵심 화면과 상호작용을 빠르게 검증할 수 있도록 준비된 시작점입니다.
          </p>
        </div>

        <div className="panel" aria-label="프로토타입 진행 단계">
          {steps.map((step, index) => (
            <article className="step" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
