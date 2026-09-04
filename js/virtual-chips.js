/**
 * Windowed chip grid so large token lists stay usable.
 */

const CHIP_W = 100;
const CHIP_H = 30;
const GAP = 6;
const BUFFER_ROWS = 4;

export function mountVirtualChips(container, pieces, options = {}) {
  const limit = options.limit ?? Infinity;
  const format = options.format ?? ((text) => text);
  const escapeHtml = options.escapeHtml ?? ((value) => String(value));

  container.classList.add("chip-virtual");
  container.innerHTML = '<div class="chip-virtual-inner"><div class="chip-virtual-window"></div></div>';
  const inner = container.querySelector(".chip-virtual-inner");
  const windowEl = container.querySelector(".chip-virtual-window");

  function render() {
    const width = Math.max(1, inner.clientWidth || container.clientWidth);
    const cols = Math.max(1, Math.floor((width + GAP) / (CHIP_W + GAP)));
    const rowH = CHIP_H + GAP;
    const rows = Math.max(1, Math.ceil(pieces.length / cols));
    inner.style.height = `${rows * rowH}px`;

    const startRow = Math.max(0, Math.floor(container.scrollTop / rowH) - BUFFER_ROWS);
    const visibleRows = Math.ceil(container.clientHeight / rowH) + BUFFER_ROWS * 2;
    const endRow = Math.min(rows, startRow + visibleRows);
    const start = startRow * cols;
    const end = Math.min(pieces.length, endRow * cols);

    windowEl.style.top = `${startRow * rowH}px`;
    windowEl.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;

    let html = "";
    for (let i = start; i < end; i += 1) {
      const piece = pieces[i];
      const overflow = i >= limit;
      const preview = escapeHtml(format(piece.text));
      html += `<span class="token-chip ${piece.kind || ""} ${overflow ? "overflow" : ""}" title="#${i + 1}">${preview}</span>`;
    }
    windowEl.innerHTML = html;
  }

  const onScroll = () => render();
  container.addEventListener("scroll", onScroll, { passive: true });
  const observer = new ResizeObserver(() => render());
  observer.observe(container);
  render();

  return () => {
    container.removeEventListener("scroll", onScroll);
    observer.disconnect();
  };
}
