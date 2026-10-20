// A tiny, dependency-free confetti burst.
//
// `fireConfetti()` appends a full-screen canvas, animates a burst of paper
// scraps for ~2.5s, then removes the canvas so nothing is left behind. The
// canvas has pointer-events: none, so it never blocks the page underneath.

const COLORS = ["#111111", "#6b7280", "#f4c7a5", "#e8b4b8", "#d4af37"];
const GRAVITY = 1500; // px / s²
const DRAG = 1.4; // higher = particles slow down faster
const LIFETIME = 2.6; // seconds until the burst is fully faded

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const random = (min, max) => Math.random() * (max - min) + min;

// A particle starts at `origin` and flies out at `angle` plus/minus `spread`.
const createParticles = (count, origin, angle, spread) =>
  Array.from({ length: count }, () => {
    const speed = random(600, 1400);
    const direction = angle + random(-spread, spread);

    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      width: random(5, 10),
      height: random(8, 15),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: random(0, Math.PI * 2),
      spin: random(-8, 8),
      wobble: random(0, Math.PI * 2),
      wobbleSpeed: random(6, 12),
      age: 0,
    };
  });

const drawParticle = (ctx, particle) => {
  const alpha = Math.max(0, 1 - particle.age / LIFETIME);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  // Squash the scrap as it flutters so it reads as paper, not a flat square.
  ctx.scale(1, Math.cos(particle.wobble));
  ctx.fillStyle = particle.color;
  ctx.fillRect(
    -particle.width / 2,
    -particle.height / 2,
    particle.width,
    particle.height,
  );
  ctx.restore();
};

export function fireConfetti(target) {
  if (typeof document === "undefined" || prefersReducedMotion()) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "9998",
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  document.body.appendChild(canvas);

  const dpr = window.devicePixelRatio || 1;
  let width = window.innerWidth;
  let height = window.innerHeight;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const rect = target?.getBoundingClientRect?.();
  const origin = rect
    ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    : { x: width / 2, y: height / 2 };

  // One burst from the subscribe form keeps the effect focused instead of
  // filling the whole viewport from multiple corners.
  const particles = createParticles(100, origin, -Math.PI / 2, Math.PI / 4);

  let frameId;
  let lastTime = performance.now();

  const cleanup = () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pagehide", cleanup);
    canvas.remove();
  };

  const tick = (now) => {
    // Clamp dt so a background tab does not teleport every particle on return.
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    let alive = 0;
    for (const particle of particles) {
      particle.age += dt;
      if (particle.age >= LIFETIME) continue;

      const drag = Math.exp(-DRAG * dt);
      particle.vx *= drag;
      particle.vy = particle.vy * drag + GRAVITY * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.rotation += particle.spin * dt;
      particle.wobble += particle.wobbleSpeed * dt;

      drawParticle(ctx, particle);
      alive += 1;
    }

    if (alive > 0) {
      frameId = requestAnimationFrame(tick);
    } else {
      cleanup();
    }
  };

  frameId = requestAnimationFrame(tick);

  window.addEventListener("resize", resize, { passive: true });
  // Clean up if the user navigates away mid-burst.
  window.addEventListener("pagehide", cleanup, { once: true });
}
