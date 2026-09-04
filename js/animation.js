/**
 * Lightweight SVG/CSS motion for the teaching simulation.
 */

export function mountDataFlow(container) {
  if (!container) return () => {};
  container.innerHTML = `
    <svg class="flow-svg" viewBox="0 0 900 200" role="img" aria-label="เส้นทางข้อมูลเข้าสู่โมเดล" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="flow-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="55%" stop-color="#22d3ee"/>
          <stop offset="100%" stop-color="#10b981"/>
        </linearGradient>
      </defs>
      <path id="flow-path" d="M80 110 C 220 40, 340 180, 450 110 S 680 40, 820 110" fill="none" stroke="url(#flow-stroke)" stroke-width="3" stroke-linecap="round"/>
      <g class="flow-node" transform="translate(80 110)">
        <circle r="28" class="flow-ring"/>
        <text y="5" text-anchor="middle">เข้า</text>
      </g>
      <g class="flow-node" transform="translate(450 110)">
        <circle r="28" class="flow-ring"/>
        <text y="5" text-anchor="middle">หั่น</text>
      </g>
      <g class="flow-node" transform="translate(820 110)">
        <circle r="28" class="flow-ring emerald"/>
        <text y="5" text-anchor="middle">โมเดล</text>
      </g>
      <circle r="6" class="flow-dot" fill="#a5b4fc">
        <animateMotion dur="5.2s" repeatCount="indefinite">
          <mpath href="#flow-path" xlink:href="#flow-path"/>
        </animateMotion>
      </circle>
      <circle r="5" class="flow-dot" fill="#6ee7b7">
        <animateMotion dur="5.2s" begin="1.6s" repeatCount="indefinite">
          <mpath href="#flow-path" xlink:href="#flow-path"/>
        </animateMotion>
      </circle>
      <circle r="4" class="flow-dot" fill="#fda4af">
        <animateMotion dur="5.2s" begin="3.2s" repeatCount="indefinite">
          <mpath href="#flow-path" xlink:href="#flow-path"/>
        </animateMotion>
      </circle>
    </svg>
    <div class="flow-labels">
      <span>ข้อความเข้า</span>
      <span>จัดลำดับ + เครื่องหมายพิเศษ</span>
      <span>โมเดล</span>
    </div>
  `;
  return () => {
    container.innerHTML = "";
  };
}

export function mountThinkFlow(container) {
  if (!container) return () => {};
  container.innerHTML = `
    <svg class="flow-svg think-svg" viewBox="0 0 900 160" role="img" aria-label="จำลอง Attention และ Generation">
      <path d="M70 80 H 830" fill="none" stroke="rgba(99,102,241,0.35)" stroke-width="2"/>
      ${[0, 1, 2, 3, 4, 5, 6]
        .map((i) => {
          const x = 90 + i * 110;
          return `<g class="think-node" style="animation-delay:${i * 0.18}s" transform="translate(${x} 80)">
            <circle r="16"/>
            <circle r="16" class="think-pulse"/>
          </g>`;
        })
        .join("")}
    </svg>
  `;
  return () => {
    container.innerHTML = "";
  };
}

export function typeText(el, text, msPerChar = 16) {
  if (!el) return () => {};
  const value = text || "";
  let index = 0;
  el.textContent = "";
  const timer = setInterval(() => {
    index += 1;
    el.textContent = value.slice(0, index);
    if (index >= value.length) clearInterval(timer);
  }, msPerChar);
  return () => clearInterval(timer);
}

export function countUp(el, target, format, duration = 700) {
  if (!el) return;
  const start = performance.now();
  const from = 0;
  const to = Number(target) || 0;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - t) * (1 - t);
    el.textContent = format(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
