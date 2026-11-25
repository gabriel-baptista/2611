/**
 * Script principal — Página romântica inspirada em Van Gogh
 * Responsabilidades:
 *  1. Gerar o céu estrelado com efeito sutil de brilho/cintilação.
 *  2. Controlar a transição do cartão inicial para o conteúdo principal
 *     e iniciar o vídeo com som dentro do gesto do usuário.
 *  3. Disparar partículas leves de estrelas douradas e pétalas/girassóis
 *     ao clicar em "Te amo ❤️" e revelar a mensagem oculta.
 */

(() => {
  "use strict";

  // Referências principais do DOM
  const starfieldEl = document.getElementById("starfield");
  const introScreen = document.getElementById("intro-screen");
  const openSurpriseBtn = document.getElementById("open-surprise-btn");
  const mainContent = document.getElementById("main-content");
  const surpriseVideo = document.getElementById("surprise-video");
  const loveBtn = document.getElementById("love-btn");
  const hiddenMessage = document.getElementById("hidden-message");
  const canvas = document.getElementById("celebration-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ========================================================================
     1. CÉU ESTRELADO DE FUNDO
     ======================================================================== */

  function createStarfield() {
    if (!starfieldEl) return;

    const isSmallScreen = window.innerWidth < 500;
    const starCount = isSmallScreen ? 52 : 78;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("span");
      star.className = "star";

      // Algumas estrelas recebem tom dourado ou halo suave (estilo Noite Estrelada)
      const variantRoll = Math.random();
      if (variantRoll > 0.88) {
        star.classList.add("star--halo");
      } else if (variantRoll > 0.65) {
        star.classList.add("star--gold");
      }

      const size = variantRoll > 0.88
        ? (Math.random() * 2.2 + 2.6).toFixed(1)
        : (Math.random() * 2 + 1.1).toFixed(1);

      const left = (Math.random() * 98 + 1).toFixed(2);
      const top = (Math.random() * 98 + 1).toFixed(2);
      const duration = (Math.random() * 3.8 + 2.6).toFixed(2);
      const delay = (Math.random() * 4.5).toFixed(2);
      const minOpacity = (Math.random() * 0.25 + 0.12).toFixed(2);
      const maxOpacity = (Math.random() * 0.3 + 0.7).toFixed(2);

      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.style.setProperty("--star-duration", `${duration}s`);
      star.style.setProperty("--star-delay", `${delay}s`);
      star.style.setProperty("--star-min", minOpacity);
      star.style.setProperty("--star-max", maxOpacity);

      fragment.appendChild(star);
    }

    starfieldEl.appendChild(fragment);
  }

  /* ========================================================================
     2. MOTOR LEVE DE PARTÍCULAS (ESTRELAS DOURADAS E PÉTALAS / GIRASSÓIS)
     ======================================================================== */

  let particles = [];
  let animationFrameId = null;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /**
   * Cria uma rajada de partículas (estrelas de 4 pontas, pétalas douradas e mini girassóis).
   * @param {number} originX - Posição horizontal inicial (px)
   * @param {number} originY - Posição vertical inicial (px)
   * @param {number} count   - Quantidade de partículas
   */
  function spawnCelebrationParticles(originX, originY, count = 36) {
    if (!canvas || !ctx || prefersReducedMotion) return;

    resizeCanvas();

    const colors = ["#ffd166", "#f4a261", "#fdfcdc", "#ffbe55"];

    for (let i = 0; i < count; i++) {
      const roll = Math.random();
      const type = roll < 0.48 ? "star" : roll < 0.85 ? "petal" : "sunflower";
      const spreadX = (Math.random() - 0.5) * Math.min(window.innerWidth * 0.75, 320);

      particles.push({
        type,
        x: originX + spreadX * 0.45,
        y: originY + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 1.9,
        vy: -(Math.random() * 2.4 + 1.3),
        swayAmplitude: Math.random() * 0.65 + 0.25,
        swaySpeed: Math.random() * 0.045 + 0.02,
        phase: Math.random() * Math.PI * 2,
        size: type === "sunflower"
          ? Math.random() * 4 + 7.5
          : type === "petal"
            ? Math.random() * 4 + 6
            : Math.random() * 3.5 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.07,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.0055 + 0.006,
      });
    }

    if (!animationFrameId) {
      animationFrameId = window.requestAnimationFrame(renderParticles);
    }
  }

  function drawFourPointStar(x, y, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(255, 209, 102, 0.75)";
    ctx.shadowBlur = 8;

    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const outerX = Math.cos(angle) * size;
      const outerY = Math.sin(angle) * size;
      const midAngle = angle + Math.PI / 4;
      const innerX = Math.cos(midAngle) * (size * 0.28);
      const innerY = Math.sin(midAngle) * (size * 0.28);

      if (i === 0) {
        ctx.moveTo(outerX, outerY);
      } else {
        ctx.lineTo(outerX, outerY);
      }
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSunflowerPetal(x, y, size, rotation, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.42, size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMiniSunflower(x, y, size, rotation, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    // Pétalas
    ctx.fillStyle = "#ffd166";
    const petals = 8;
    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / petals);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.65, size * 0.22, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Miolo
    ctx.fillStyle = "#5a3214";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function renderParticles() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.phase += p.swaySpeed;
      p.x += p.vx + Math.sin(p.phase) * p.swayAmplitude;
      p.y += p.vy;
      p.vy *= 0.992; // Desaceleração suave no ar
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y < -40) {
        particles.splice(i, 1);
        continue;
      }

      if (p.type === "star") {
        drawFourPointStar(p.x, p.y, p.size, p.rotation, p.color, p.alpha);
      } else if (p.type === "petal") {
        drawSunflowerPetal(p.x, p.y, p.size, p.rotation, p.color, p.alpha);
      } else {
        drawMiniSunflower(p.x, p.y, p.size, p.rotation, p.alpha);
      }
    }

    if (particles.length > 0) {
      animationFrameId = window.requestAnimationFrame(renderParticles);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      animationFrameId = null;
    }
  }

  /* ========================================================================
     3. FLUXO DE ABERTURA DA SURPRESA
     ======================================================================== */

  function handleOpenSurprise() {
    if (!introScreen || !mainContent) return;

    // Evita cliques duplicados durante a transição
    openSurpriseBtn.disabled = true;

    // Pequeno brilho dourado de boas-vindas ao abrir o cartão
    const btnRect = openSurpriseBtn.getBoundingClientRect();
    spawnCelebrationParticles(
      btnRect.left + btnRect.width / 2,
      btnRect.top + btnRect.height / 2,
      18
    );

    // Inicia o fade-out do cartão inicial e exibe o conteúdo principal
    // imediatamente no fluxo para que o vídeo já esteja visível ao chamar play()
    // (garante compatibilidade de reprodução com som no Safari iOS e Chrome mobile).
    introScreen.classList.add("is-leaving");
    mainContent.hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });

    // Tenta iniciar o vídeo com som dentro do gesto de clique do usuário
    if (surpriseVideo) {
      surpriseVideo.muted = false;
      const playPromise = surpriseVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Caso o arquivo ainda não exista ou o navegador exija toque direto no player,
          // os controles nativos continuam disponíveis normalmente.
          console.info(
            "Dica: coloque o arquivo de vídeo em ./assets/shrek-girassol.mp4 para reprodução automática com som."
          );
        });
      }
    }

    // Dispara a animação suave de fade-in do conteúdo principal
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        mainContent.classList.add("is-visible");
      });
    });

    const transitionDelay = prefersReducedMotion ? 0 : 650;
    window.setTimeout(() => {
      introScreen.hidden = true;
    }, transitionDelay);
  }

  /* ========================================================================
     4. INTERAÇÃO DO BOTÃO "TE AMO ❤️"
     ======================================================================== */

  function handleLoveClick() {
    if (!loveBtn || !hiddenMessage) return;

    // Vibração tátil suave em dispositivos móveis compatíveis
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }

    const rect = loveBtn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // Dispara estrelas douradas, pétalas e pequenos girassóis flutuando
    spawnCelebrationParticles(originX, originY, 44);

    // Revela a mensagem carinhosa oculta na primeira interação
    if (hiddenMessage.hidden) {
      hiddenMessage.hidden = false;
      loveBtn.classList.add("is-active");
      loveBtn.setAttribute("aria-expanded", "true");

      window.requestAnimationFrame(() => {
        hiddenMessage.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "nearest",
        });
      });
    }
  }

  /* ========================================================================
     INICIALIZAÇÃO
     ======================================================================== */

  createStarfield();
  resizeCanvas();

  window.addEventListener("resize", resizeCanvas, { passive: true });

  if (openSurpriseBtn) {
    openSurpriseBtn.addEventListener("click", handleOpenSurprise);
  }

  if (loveBtn) {
    loveBtn.addEventListener("click", handleLoveClick);
  }
})();
