import { badge } from './badge.js'

/**
 * Renders the composite PlanNode tree into an HTML string.
 * Leaf nodes are clickable; fires onLeafClick(actionId).
 */
export function renderTree(node, onLeafClick, depth = 0) {
  const status = node.statusEnum ?? node.status ?? 'PROPOSED'
  const isLeaf = node.nodeType === 'LEAF' || (!node.actions?.length && !node.subPlans?.length)
  const icon   = isLeaf ? '🔹' : depth === 0 ? '📋' : '📁'

  const labelClass = `tree-label${isLeaf ? ' leaf' : ''}`
  const dataAttr   = isLeaf ? `data-action-id="${node.id}"` : ''

  let html = `<div class="tree-node">
    <span class="${labelClass}" ${dataAttr}>
      ${icon} <span>${node.name}</span> ${badge(status)}
    </span>`

  const children = [...(node.subPlans ?? []), ...(node.actions ?? [])]
  if (children.length) {
    html += `<div class="tree-children">${
      children.map(c => renderTree(
        { ...c, status: c.statusEnum ?? c.status },
        onLeafClick,
        depth + 1
      )).join('')
    }</div>`
  }

  html += `</div>`
  return html
}

/** Attach click listeners to all leaf nodes inside a container element. */
export function bindTreeClicks(containerEl, onLeafClick) {
  containerEl.querySelectorAll('.tree-label.leaf').forEach(el => {
    el.addEventListener('click', () => {
      containerEl.querySelectorAll('.tree-label').forEach(l => l.classList.remove('selected'))
      el.classList.add('selected')
      onLeafClick(parseInt(el.dataset.actionId))
    })
  })
}
