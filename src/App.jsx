import { useState, useEffect } from "react";
import "./App.css";

const PLANS = {
  starter: {
    id: "starter",
    name: "Plan Starter",
    priceOld: 346,
    price: 173,
    savings: 201,
    discount: "50% OFF",
    features: [
      "5 comidas diarias",
      "150 comidas al mes",
      "IA de nutrición personalizada",
      "Entrega a domicilio (2 ubicaciones)",
      "Menú semanal personalizado",
      "Recogida disponible en local",
    ],
  },
  premium: {
    id: "premium",
    name: "Plan Premium",
    priceOld: 416,
    price: 208,
    savings: 241,
    discount: "50% OFF",
    features: [
      "Todo el Plan Starter incluido",
      "Guía de entrenamiento con IA gratis",
      "Entrega a 3 ubicaciones",
      "Club de beneficios exclusivos",
      "Soporte preferencial por WhatsApp",
      "Prioridad en entregas",
      "Regalo sorpresa mensual",
    ],
  },
};

const UPGRADE_PRICE = 35;

function App() {
  const userId = params.get("userId");
  const plan = params.get("plan");

  console.log(userId, plan); // ya viene bien formateado para usarlo directo en el fetch

  const [currentPlan, setCurrentPlan] = useState(
    plan === "premium" ? "premium" : "starter",
  );
  const otherPlanId = currentPlan === "starter" ? "premium" : "starter";
  const [selectedPlan, setSelectedPlan] = useState(otherPlanId);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const current = PLANS[currentPlan];
  const selected = PLANS[otherPlanId];
  const isUpgrade = otherPlanId === "premium";

  const handleConfirmChange = () => {
    irALogin();
    setCurrentPlan(otherPlanId);
    setShowConfirm(false);
    setShowDowngradeModal(false);
    setShowPayment(false);
    setSuccess(true);
  };

  const handleCTAClick = () => {
    if (isUpgrade) {
      setShowPayment(true);
    } else {
      setShowDowngradeModal(true);
    }
  };

  /*conetar el webvie*/

  const irALogin = () => {
    const message = JSON.stringify({
      type: "GO_LOGIN",
    });

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(message);
    } else {
      // por si abres la web en navegador normal
      console.log("postMessage (navegador):", message);
    }
  };

  const params = new URLSearchParams(window.location.search);

  const handleDowngradeConfirm = () => {
    handleConfirmChange();
  };

  /* PayPhone payment for upgrade */
  const initPayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch(
        "https://us-central1-rita-ede4f.cloudfunctions.net/api/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            form: {},
            cart: {
              nombre: "Plan Premium",
              precioVenta: UPGRADE_PRICE,
              cantidad: 1,
            },
          }),
        },
      );
      const data = await response.json();

      const openPayphone = () => {
        new window.PPaymentButtonBox({
          token: data.token,
          clientTransactionId: data.clientTransactionId,
          amount: data.amount,
          amountWithoutTax: 0,
          amountWithTax: data.amountWithoutTax,
          tax: data.tax,
          service: data.service,
          currency: "USD",
          reference: data.reference,
          storeId: data.storeId,
        }).render("pp-button");
      };

      if (!window.PPaymentButtonBox) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
        script.onload = openPayphone;
        document.body.appendChild(script);
      } else {
        openPayphone();
      }
    } catch (error) {
      console.error(error);
      alert("Error al iniciar el pago");
    }
    setPaymentLoading(false);
  };

  useEffect(() => {
    if (showPayment) {
      initPayment();
    }
  }, [showPayment]);

  if (success) {
    const newPlan = PLANS[currentPlan];
    const oldPlanId = currentPlan === "starter" ? "premium" : "starter";
    const oldPlan = PLANS[oldPlanId];
    return (
      <div className="page-wrapper">
        <div className="success-screen">
          {/* Confetti particles */}
          <div className="confetti-container">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`confetti c${(i % 4) + 1}`} />
            ))}
          </div>

          {/* Animated check */}
          <div className="success-check-circle">
            <svg className="success-check-svg" viewBox="0 0 52 52">
              <circle className="check-circle-bg" cx="26" cy="26" r="24" />
              <path className="check-path" d="M14 27l8 8 16-16" />
            </svg>
          </div>

          <h2>¡Cambio realizado!</h2>
          <p className="success-subtitle">
            Tu plan ha sido actualizado exitosamente
          </p>

          {/* Plan change summary card */}
          <div className="success-plan-card">
            <div className="success-plan-header">
              <div className="success-plan-icon">
                {currentPlan === "premium" ? "👑" : "⚡"}
              </div>
              <div>
                <div className="success-plan-label">Tu nuevo plan</div>
                <div className="success-plan-name">{newPlan.name}</div>
              </div>
              <div className="success-plan-price">
                <span className="success-price-amount">${newPlan.price}</span>
                <span className="success-price-period">/mes</span>
              </div>
            </div>

            <div className="success-divider" />

            {/* What happens next */}
            <div className="success-timeline">
              <div className="timeline-item done">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-title">Plan actualizado</span>
                  <span className="timeline-desc">Cambio procesado ahora</span>
                </div>
                <span className="timeline-status">✓</span>
              </div>
              <div className="timeline-item done">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-title">Beneficios activos</span>
                  <span className="timeline-desc">
                    {currentPlan === "premium"
                      ? "Todos los beneficios Premium disponibles"
                      : "Beneficios Starter listos"}
                  </span>
                </div>
                <span className="timeline-status">✓</span>
              </div>
              <div className="timeline-item pending">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="timeline-title">Próxima facturación</span>
                  <span className="timeline-desc">
                    Se cobrará ${newPlan.price}/mes en tu próximo ciclo
                  </span>
                </div>
                <span className="timeline-status">⏳</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="success-actions">
            <a
              className="btn-whatsapp-success"
              href="https://wa.me/593963200325"
              target="_blank"
              rel="noopener noreferrer"
            >
              💬 ¿Dudas? Escríbenos
            </a>
            <button
              className="btn-back"
              onClick={() => {
                setSuccess(false);
                setSelectedPlan(
                  currentPlan === "starter" ? "premium" : "starter",
                );
              }}
            >
              ← Volver a planes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="header">
        <img
          className="logo"
          src="https://res.cloudinary.com/db8e98ggo/image/upload/v1743140857/gifs_para_apps_gpxkfq.png"
          alt="Rita Fit"
        />
        <h1>
          Rita <span>Fit</span>
        </h1>
        <p className="subtitle">Gestiona tu plan de alimentación</p>
        <p className="subtitle">{`Usuario: ${userId} - Plan: ${plan}`}</p>
      </div>

      {/* Current Plan Card */}
      <div className="current-plan-section">
        <div className="current-plan-card">
          <div className="current-plan-icon">
            {currentPlan === "premium" ? "👑" : "⚡"}
          </div>
          <div className="current-plan-info">
            <div className="plan-status">
              <span className="dot" />
              Plan activo
            </div>
            <div className="plan-name-row">{current.name}</div>
          </div>
          <div className="current-plan-price">
            <div className="amount">${current.price}</div>
            <div className="period">/mes</div>
          </div>
        </div>
      </div>

      {/* Section Label */}
      <div className="section-label">
        <span>{isUpgrade ? "⬆ Upgrade disponible" : "Cambiar a"}</span>
      </div>

      {/* Other Plan Card */}
      <div className="plans-container single">
        {Object.values(PLANS)
          .filter((plan) => plan.id !== currentPlan)
          .map((plan) => {
            const isUpgradeCard = plan.id === "premium";
            return (
              <div
                key={plan.id}
                className="plan-card active"
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="plan-badge-row">
                  <span className="plan-label">🔥 PRECIO DE LANZAMIENTO</span>
                  <span className="active-tag">
                    {isUpgradeCard ? "⬆ Upgrade" : "⬇ Básico"}
                  </span>
                </div>

                <h2 className="plan-name">{plan.name}</h2>

                <div className="plan-price-row">
                  <span className="price-old">${plan.priceOld}</span>
                  <span className="price-current">${plan.price}</span>
                  <span className="price-period">/ mes</span>
                </div>
                <div className="plan-savings">
                  💰 Ahorras ${plan.savings}/mes — {plan.discount}
                </div>

                <div className="divider" />

                <ul className="plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}>
                      <span className="check">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>

      {/* Comparison Strip */}
      <div className="comparison-strip">
        <div className="comp-from">
          <span className="comp-label">Actual</span>
          <span className="comp-name">{current.name}</span>
        </div>
        <div className="comp-arrow">→</div>
        <div className="comp-to">
          <span className="comp-label">Nuevo</span>
          <span className="comp-name">{selected.name}</span>
        </div>
        <div className={`comp-diff ${isUpgrade ? "upgrade" : ""}`}>
          <div className="diff-value">
            {isUpgrade
              ? `+$${selected.price - current.price + 7}`
              : `-$${current.price - selected.price - 7}`}
          </div>
          <div className="diff-label">/mes</div>
        </div>
      </div>

      {/* CTA */}
      <button
        className={`btn-confirm ${!isUpgrade ? "downgrade" : ""}`}
        onClick={handleCTAClick}
      >
        {isUpgrade ? "🚀 Actualizar a Premium" : "Cambiar a Starter"}
      </button>
      <div className="secure-note">
        🔒 Precio de lanzamiento garantizado de por vida
      </div>

      {/* WhatsApp */}
      <div className="whatsapp-note">
        <p>
          ¿Necesitas ayuda?{" "}
          <a
            href="https://wa.me/593963200325"
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Contáctanos por WhatsApp
          </a>
        </p>
      </div>

      {/* Payment page for upgrade ($35) */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="pay-modal" onClick={(e) => e.stopPropagation()}>
            {/* Banner */}
            <div className="pay-preventa-banner">
              <span className="pay-preventa-icon">🔥</span>
              <div className="pay-preventa-text">
                <strong>¡Upgrade a Premium!</strong>
                <span>Paga solo la diferencia — Precio exclusivo</span>
              </div>
            </div>

            <div className="pay-modal-body">
              {/* Resumen */}
              <div className="pay-summary-card">
                <div className="pay-badge-row">
                  <span className="pay-badge-preventa">👑 PREMIUM</span>
                  <span className="pay-badge-off">UPGRADE</span>
                </div>
                <h2 className="pay-plan-name">Upgrade a Plan Premium</h2>
                <div className="pay-guarantee">
                  <span>🛡️</span>
                  <p>
                    Solo pagas la diferencia entre tu plan actual y Premium.
                    Precio garantizado de por vida.
                  </p>
                </div>
              </div>

              {/* Detalle de pago */}
              <div className="pay-action-card">
                <div className="pay-action-header">
                  <span className="pay-action-lock">🔒</span>
                  <h3>Completa tu upgrade</h3>
                </div>

                <div className="pay-order-line">
                  <span>Plan Premium</span>
                  <span className="pay-order-price">
                    ${PLANS.premium.price}/mes
                  </span>
                </div>
                <div className="pay-order-line">
                  <span>Plan Starter (actual)</span>
                  <span className="pay-order-price">
                    -${PLANS.starter.price}/mes
                  </span>
                </div>
                <div className="pay-order-divider" />
                <div className="pay-order-line pay-order-total">
                  <span>Total a pagar hoy</span>
                  <span>${42}</span>
                </div>

                <div id="pp-button" className="pay-pp-slot"></div>

                <div className="pay-trust-icons">
                  <span>🔐 Pago 100% seguro</span>
                  <span>⚡ Activación inmediata</span>
                  <span>✅ Garantía total</span>
                </div>

                <p className="pay-urgency">
                  🔥 ¡Aprovecha el precio de lanzamiento y sube a Premium hoy!
                </p>
              </div>

              <button
                className="btn-cancel pay-cancel-btn"
                onClick={() => setShowPayment(false)}
              >
                ← Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade modal — salir de Premium */}
      {showDowngradeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDowngradeModal(false)}
        >
          <div
            className="modal modal-downgrade"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon modal-icon-warn">⚠️</div>
            <h2>¿Salir de Premium?</h2>
            <p>
              Estás a punto de bajar a <strong>Plan Starter</strong>. Perderás
              estos beneficios:
            </p>
            <ul className="downgrade-lost-features">
              <li>❌ Guía de entrenamiento con IA</li>
              <li>❌ Entrega a 3 ubicaciones</li>
              <li>❌ Club de beneficios exclusivos</li>
              <li>❌ Soporte preferencial</li>
              <li>❌ Prioridad en entregas</li>
              <li>❌ Regalo sorpresa mensual</li>
            </ul>
            <p className="downgrade-note">
              Tu nuevo precio será <strong>${PLANS.starter.price}/mes</strong>.
              El cambio se aplica de inmediato.
            </p>
            <div className="modal-buttons">
              <button
                className="btn-modal-confirm"
                onClick={() => setShowDowngradeModal(false)}
              >
                Quedarme en Premium 👑
              </button>
              <button
                className="btn-cancel btn-downgrade-confirm"
                onClick={handleDowngradeConfirm}
              >
                Sí, bajar a Starter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
