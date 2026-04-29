import { api } from '../api/client.js'
import { badge, entryBadge } from '../components/badge.js'
import { buildModal } from '../components/modal.js'
import { renderTree, bindTreeClicks } from '../components/tree.js'
import { initTabs } from '../components/tabs.js'

// ── State ────────────────────────────────────────────────────────────────────
let selectedPlanId   = null
let selectedActionId = null

// ── Modals ───────────────────────────────────────────────────────────────────
const planModal = buildModal({
  id: 'plan-create-modal',
  title: 'Create Plan',
  fields: [
    { key: 'name',            label: 'Plan Name',         placeholder: 'e.g., Bridge Construction' },
    { key: 'targetStartDate', label: 'Target Start Date', type: 'date' },
    { key: 'protocolId',      label: 'From Protocol (optional)', type: 'select', options: [] },
  ],
  onConfirm: async ({ name, targetStartDate, protocolId }) => {
    if (!name) throw new Error('Name is required')
    const body = { name, targetStartDate: targetStartDate || null }
    if (protocolId) body.protocolId = parseInt(protocolId)
    await api.createPlan(body)
    await refreshPlanList()
  }
})

const suspendModal = buildModal({
  id: 'suspend-modal',
  title: 'Suspend Action',
  confirmLabel: 'Suspend',
  confirmClass: 'btn-warn',
  fields: [{ key: 'reason', label: 'Reason', type: 'textarea', placeholder: 'Why is this being suspended?' }],
  onConfirm: async ({ reason }) => {
    await api.suspend(selectedActionId, reason)
    await refreshAction()
    await refreshPlan()
  }
})

// ── Render ───────────────────────────────────────────────────────────────────
export async function renderPlans(el) {
  el.innerHTML = `
    <div class="row between mb-16">
      <h2 style="margin-bottom:0">Plans</h2>
      <button class="btn btn-primary btn-sm" id="btn-new-plan">+ New Plan</button>
    </div>

    <div class="grid col-2">
      <!-- Left: plan list -->
      <div class="card">
        <h3>All Plans</h3>
        <div id="plan-list" class="mt-8"></div>
      </div>

      <!-- Right: plan detail -->
      <div id="plan-detail-card" class="card" style="display:none">
        <div class="row mb-16">
          <strong id="plan-detail-name"></strong>
          <div id="plan-detail-status" class="ml-auto"></div>
        </div>

        <div class="tabs" id="plan-tabs">
          <button class="tab-btn active" data-tab="tree">Tree</button>
          <button class="tab-btn"        data-tab="report">Report</button>
          <button class="tab-btn"        data-tab="add">+ Action</button>
        </div>

        <div class="tab-panel active" data-panel="tree">
          <div id="plan-tree"></div>
        </div>

        <div class="tab-panel" data-panel="report">
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>Status</th></tr></thead>
              <tbody id="plan-report-tbody"></tbody>
            </table>
          </div>
        </div>

        <div class="tab-panel" data-panel="add">
          <div class="form-group mt-8">
            <label>Action Name</label>
            <input id="new-action-name" placeholder="e.g., Pour concrete" />
          </div>
          <div class="form-group">
            <label>Party (responsible person/team)</label>
            <input id="new-action-party" placeholder="e.g., Site Team A" />
          </div>
          <div class="form-group">
            <label>Location</label>
            <input id="new-action-location" placeholder="e.g., North wing" />
          </div>
          <button class="btn btn-primary btn-sm" id="btn-create-action">Create Action</button>
        </div>
      </div>
    </div>

    <!-- Action detail -->
    <div id="action-detail-card" class="card mt-16" style="display:none">
      <div class="row mb-16">
        <div>
          <div style="font-size:.8rem;color:var(--muted);margin-bottom:4px">ACTION</div>
          <strong id="action-detail-name" style="font-size:1.05rem"></strong>
        </div>
        <div id="action-detail-status" class="ml-auto"></div>
      </div>

      <!-- Transition buttons -->
      <div class="action-btns mb-16" id="action-btns"></div>

      <div class="tabs" id="action-tabs">
        <button class="tab-btn active" data-tab="info">Info</button>
        <button class="tab-btn"        data-tab="alloc">Allocations</button>
        <button class="tab-btn"        data-tab="diff">Plan vs Reality</button>
      </div>

      <!-- Info -->
      <div class="tab-panel active" data-panel="info">
        <div class="table-wrap">
          <table><tbody id="action-info-tbody"></tbody></table>
        </div>
      </div>

      <!-- Allocations -->
      <div class="tab-panel" data-panel="alloc">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Resource</th><th>Qty</th><th>Kind</th><th>Asset ID</th></tr></thead>
            <tbody id="action-alloc-tbody"></tbody>
          </table>
        </div>
        <div class="mt-16">
          <h3>Add Allocation</h3>
          <div class="form-group mt-8">
            <label>Resource Type</label>
            <select id="alloc-rt-select"></select>
          </div>
          <div class="grid col-2">
            <div class="form-group">
              <label>Quantity</label>
              <input id="alloc-qty" type="number" min="0.01" step="0.01" />
            </div>
            <div class="form-group">
              <label>Kind</label>
              <select id="alloc-kind">
                <option>GENERAL</option><option>SPECIFIC</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Asset ID (SPECIFIC only)</label>
            <input id="alloc-asset-id" placeholder="e.g., CRANE-001" />
          </div>
          <button class="btn btn-primary btn-sm" id="btn-add-alloc">Add Allocation</button>
        </div>
      </div>

      <!-- Plan vs Reality -->
      <div class="tab-panel" data-panel="diff">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th style="color:var(--warn)">Planned</th>
                <th style="color:var(--success)">Actual</th>
              </tr>
            </thead>
            <tbody id="action-diff-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>`

  // Wire up buttons
  document.getElementById('btn-new-plan').onclick = async () => {
    await populateProtocolOptions()
    planModal.open()
  }
  document.getElementById('btn-create-action').onclick = createAction
  document.getElementById('btn-add-alloc').onclick     = addAllocation

  // Tabs
  initTabs('#plan-tabs',   (tab) => { if (tab === 'report') loadPlanReport() })
  initTabs('#action-tabs')

  await refreshPlanList()
  await populateRTSelect()
}

// ── Plan list ────────────────────────────────────────────────────────────────
async function refreshPlanList() {
  const plans = await api.getPlans()
  const list  = document.getElementById('plan-list')
  if (!list) return

  list.innerHTML = plans.length === 0
    ? '<div class="empty">No plans yet.</div>'
    : plans.map(p => `
        <div class="plan-item${p.id === selectedPlanId ? ' selected' : ''}" data-plan-id="${p.id}">
          <div class="plan-item-title">${p.name} ${badge(p.status ?? 'PROPOSED')}</div>
          <div class="plan-item-meta">
            ${p.targetStartDate ? 'Start: ' + p.targetStartDate : 'No start date'}
            · ${(p.actions ?? []).length} actions
          </div>
        </div>`).join('')

  list.querySelectorAll('[data-plan-id]').forEach(el => {
    el.onclick = () => selectPlan(parseInt(el.dataset.planId))
  })
}

async function selectPlan(id) {
  selectedPlanId   = id
  selectedActionId = null
  document.getElementById('action-detail-card').style.display = 'none'
  await refreshPlan()
  await refreshPlanList()
}

async function refreshPlan() {
  const plan = await api.getPlan(selectedPlanId)
  const card = document.getElementById('plan-detail-card')
  card.style.display = 'block'

  document.getElementById('plan-detail-name').textContent = plan.name
  document.getElementById('plan-detail-status').innerHTML = badge(plan.status ?? 'PROPOSED')

  const treeEl = document.getElementById('plan-tree')
  treeEl.innerHTML = renderTree(plan, selectAction)
  bindTreeClicks(treeEl, selectAction)
}

async function loadPlanReport() {
  if (!selectedPlanId) return
  const report = await api.getPlanReport(selectedPlanId)
  const tbody  = document.getElementById('plan-report-tbody')
  if (!tbody) return
  tbody.innerHTML = report.map(r => `
    <tr>
      <td>${r.name}</td>
      <td><span class="badge">${r.type}</span></td>
      <td>${badge(r.status)}</td>
    </tr>`).join('')
}

async function createAction() {
  if (!selectedPlanId) return
  const name     = document.getElementById('new-action-name').value.trim()
  const party    = document.getElementById('new-action-party').value.trim()
  const location = document.getElementById('new-action-location').value.trim()
  if (!name) { alert('Action name is required'); return }
  try {
    await api.addActionToPlan(selectedPlanId, { name, party, location })
    document.getElementById('new-action-name').value    = ''
    document.getElementById('new-action-party').value   = ''
    document.getElementById('new-action-location').value = ''
    await refreshPlan()
  } catch (err) { alert('Error: ' + err.message) }
}

// ── Action detail ────────────────────────────────────────────────────────────
const TRANSITIONS = {
  PROPOSED:    [['implement','▶ Implement','btn-success'],['suspend','⏸ Suspend','btn-warn'],['abandon','✕ Abandon','btn-danger']],
  IN_PROGRESS: [['complete','✓ Complete','btn-success'], ['suspend','⏸ Suspend','btn-warn'],['abandon','✕ Abandon','btn-danger']],
  SUSPENDED:   [['resume','▶ Resume','btn-success'],     ['abandon','✕ Abandon','btn-danger']],
  COMPLETED:   [],
  ABANDONED:   [],
}

async function selectAction(id) {
  selectedActionId = id
  document.getElementById('action-detail-card').style.display = 'block'
  document.getElementById('action-detail-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  await refreshAction()
}

async function refreshAction() {
  const action = await api.getAction(selectedActionId)
  const status = action.statusEnum ?? 'PROPOSED'

  document.getElementById('action-detail-name').textContent = action.name
  document.getElementById('action-detail-status').innerHTML = badge(status)

  // Transition buttons
  const btnsEl = document.getElementById('action-btns')
  btnsEl.innerHTML = (TRANSITIONS[status] ?? []).map(([ev, label, cls]) =>
    `<button class="btn ${cls} btn-sm" data-ev="${ev}">${label}</button>`
  ).join('')
  btnsEl.querySelectorAll('[data-ev]').forEach(btn => {
    btn.onclick = () => trigger(btn.dataset.ev)
  })

  // Info tab
  document.getElementById('action-info-tbody').innerHTML = `
    <tr><td style="color:var(--muted);width:120px">Party</td><td>${action.party ?? '—'}</td></tr>
    <tr><td style="color:var(--muted)">Location</td><td>${action.location ?? '—'}</td></tr>
    <tr><td style="color:var(--muted)">Time Ref</td><td>${action.timeRef ?? '—'}</td></tr>
    <tr><td style="color:var(--muted)">Depends On</td><td>${(action.dependsOnNames ?? []).join(', ') || '—'}</td></tr>`

  // Allocations tab
  const allocs = action.allocations ?? []
  document.getElementById('action-alloc-tbody').innerHTML = allocs.length === 0
    ? `<tr><td colspan="4" class="empty">No allocations yet.</td></tr>`
    : allocs.map(a => `<tr>
        <td>${a.resourceType?.name ?? '—'}</td>
        <td>${a.quantity}</td>
        <td><span class="badge badge-${a.kind}">${a.kind}</span></td>
        <td>${a.assetId ?? '—'}</td>
      </tr>`).join('')

  // Plan vs Reality diff tab
  const ia = action.implementedAction
  document.getElementById('action-diff-tbody').innerHTML = !ia
    ? `<tr><td colspan="3" class="empty">Not yet implemented — no actual data.</td></tr>`
    : `<tr>
        <td style="color:var(--muted)">Party</td>
        <td class="diff-planned">${action.party ?? '—'}</td>
        <td class="diff-actual">${ia.actualParty ?? '—'}</td>
      </tr>
      <tr>
        <td style="color:var(--muted)">Location</td>
        <td class="diff-planned">${action.location ?? '—'}</td>
        <td class="diff-actual">${ia.actualLocation ?? '—'}</td>
      </tr>
      <tr>
        <td style="color:var(--muted)">Start</td>
        <td class="diff-planned">${action.timeRef ?? '—'}</td>
        <td class="diff-actual">${ia.actualStart?.replace('T',' ').slice(0,19) ?? '—'}</td>
      </tr>`
}

async function trigger(event) {
  try {
    if (event === 'suspend') { suspendModal.open(); return }
    await api[event](selectedActionId)
    await refreshAction()
    await refreshPlan()
  } catch (err) { alert('Error: ' + err.message) }
}

// ── Allocations ──────────────────────────────────────────────────────────────
async function populateRTSelect() {
  try {
    const rts = await api.getResourceTypes()
    const sel = document.getElementById('alloc-rt-select')
    if (!sel) return
    sel.innerHTML = rts.length === 0
      ? '<option value="">No resource types yet</option>'
      : rts.map(r => `<option value="${r.id}">${r.name} (${r.kind})</option>`).join('')
  } catch (_) {}
}

async function addAllocation() {
  if (!selectedActionId) return
  const resourceTypeId = document.getElementById('alloc-rt-select').value
  const quantity       = document.getElementById('alloc-qty').value
  const kind           = document.getElementById('alloc-kind').value
  const assetId        = document.getElementById('alloc-asset-id').value.trim() || null
  if (!resourceTypeId || !quantity) { alert('Resource type and quantity are required'); return }
  try {
    await api.addAllocation(selectedActionId, {
      resourceTypeId: parseInt(resourceTypeId),
      quantity:       parseFloat(quantity),
      kind, assetId,
    })
    document.getElementById('alloc-qty').value      = ''
    document.getElementById('alloc-asset-id').value = ''
    await refreshAction()
  } catch (err) { alert('Error: ' + err.message) }
}

async function populateProtocolOptions() {
  try {
    const protos = await api.getProtocols ? api.getProtocols() : Promise.resolve([])
    const list = await protos
    planModal.setOptions('protocolId', [
      { value: '', label: '— from scratch —' },
      ...list.map(p => ({ value: p.id, label: p.name }))
    ])
  } catch (_) {}
}
