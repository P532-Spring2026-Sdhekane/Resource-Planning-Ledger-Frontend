/**
 * Wire up a tab group.
 * @param {string} containerSel - CSS selector for the parent element
 * @param {Function} [onSwitch]  - optional callback(tabName) when tab changes
 */
export function initTabs(containerSel, onSwitch) {
  const container = document.querySelector(containerSel)
  if (!container) return

  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab
      // Buttons
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === target))
      // Panels
      container.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target))
      onSwitch?.(target)
    })
  })
}
