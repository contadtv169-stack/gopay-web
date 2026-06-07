export default function Landing({ onEnter, token }) {
  return (
    <div className="landing">
      <header className="l-header">
        <div className="l-logo">Go<span>Pay</span></div>
        <nav className="l-nav">
          <a href="#features">Recursos</a>
          <a href="#como-funciona">Como funciona</a>
          {token ? (
            <button className="btn" onClick={onEnter}>Painel</button>
          ) : (
            <button className="btn" onClick={onEnter}>Acessar</button>
          )}
        </nav>
      </header>

      <section className="l-hero">
        <div className="l-hero-content">
          <h1>Receba pagamentos<br />via <span>PIX</span></h1>
          <p>Crie links de pagamento inteligentes, compartilhe com seus clientes e receba em segundos. Sem taxa de adesão.</p>
          <div className="l-hero-actions">
            <button className="btn btn-lg" onClick={onEnter}>
              {token ? 'Ir para o Painel' : 'Começar Agora'}
            </button>
            <span className="l-hero-note">⚡ Gratuito para começar</span>
          </div>
        </div>
        <div className="l-hero-visual">
          <div className="l-card-demo">
            <div className="l-demo-qr">
              <svg viewBox="0 0 100 100" width="140" height="140">
                <rect x="10" y="10" width="30" height="30" fill="#0066FF" rx="4"/>
                <rect x="50" y="10" width="30" height="30" fill="#0066FF" rx="4" opacity=".6"/>
                <rect x="10" y="50" width="30" height="30" fill="#0066FF" rx="4" opacity=".8"/>
                <rect x="50" y="50" width="30" height="30" fill="#0066FF" rx="4"/>
                <rect x="30" y="30" width="10" height="10" fill="#FFF"/>
                <rect x="70" y="30" width="10" height="10" fill="#FFF"/>
                <rect x="30" y="70" width="10" height="10" fill="#FFF"/>
              </svg>
            </div>
            <div className="l-demo-info">
              <strong>R$ 149,90</strong>
              <span>Curso Completo</span>
            </div>
          </div>
        </div>
      </section>

      <section className="l-section" id="features">
        <h2 className="l-section-title">Por que GoPay?</h2>
        <div className="l-features">
          <div className="l-feature">
            <div className="l-feature-icon">🔗</div>
            <h3>Links Inteligentes</h3>
            <p>Crie links de pagamento em segundos e compartilhe onde quiser</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">📱</div>
            <h3>Multi-plataforma</h3>
            <p>Funciona no celular, PC e qualquer dispositivo com internet</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">⚡</div>
            <h3>PIX em segundos</h3>
            <p>Receba pagamentos via PIX em tempo real com confirmação automática</p>
          </div>
          <div className="l-feature">
            <div className="l-feature-icon">🛡️</div>
            <h3>Segurança</h3>
            <p>Pagamentos processados pelos melhores gateways do mercado</p>
          </div>
        </div>
      </section>

      <section className="l-section l-how" id="como-funciona">
        <h2 className="l-section-title">Como funciona</h2>
        <div className="l-steps">
          <div className="l-step">
            <div className="l-step-num">1</div>
            <h3>Crie sua conta</h3>
            <p>Cadastre-se gratuitamente em segundos</p>
          </div>
          <div className="l-step-arrow">→</div>
          <div className="l-step">
            <div className="l-step-num">2</div>
            <h3>Gere seu link</h3>
            <p>Defina valor, descrição e escolha o gateway</p>
          </div>
          <div className="l-step-arrow">→</div>
          <div className="l-step">
            <div className="l-step-num">3</div>
            <h3>Compartilhe</h3>
            <p>Envie o link para seu cliente por qualquer canal</p>
          </div>
          <div className="l-step-arrow">→</div>
          <div className="l-step">
            <div className="l-step-num">4</div>
            <h3>Receba</h3>
            <p>Confirmação automática assim que o PIX for pago</p>
          </div>
        </div>
      </section>

      <section className="l-cta">
        <h2>Pronto para começar?</h2>
        <p>Crie sua primeira conta gratuita e comece a receber pagamentos hoje mesmo.</p>
        <button className="btn btn-lg" onClick={onEnter}>Criar Conta Gratuita</button>
      </section>

      <footer className="l-footer">
        <p>GoPay &copy; 2026 &mdash; Pagamentos via PIX</p>
        <p className="l-footer-small">contadtv169-stack.github.io/agentswill</p>
      </footer>
    </div>
  )
}
