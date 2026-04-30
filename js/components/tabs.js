/**
 * Wire up a tab group.
 * @param {string} containerSel - CSS selector for the .tabs element (buttons bar)
 * @param {Function} [onSwitch]  - optional callback(tabName) when tab changes
 */
export function initTabs(containerSel, onSwitch) {
  const container = document.querySelector(containerSel);
  if (!container) return;

  // Panels are siblings of the tab bar — search in the parent card
  const scope = container.parentElement;

  container.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      // Toggle active on buttons
      container
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.toggle("active", b.dataset.tab === target));
      // Toggle active on panels (siblings of the tab bar)
      scope
        .querySelectorAll(".tab-panel")
        .forEach((p) =>
          p.classList.toggle("active", p.dataset.panel === target),
        );
      onSwitch?.(target);
    });
  });
}
