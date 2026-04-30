import { api } from '../api/client.js'
import { buildModal } from '../components/modal.js'

let selectedId = null
let allProtocols = []

const newModal = buildModal({
  id: 'proto-create-modal',
  title: 'Create Protocol',
  fields: [
    { key: 'name',        label: 'Name',        placeholder: 'Protocol name' },
    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What does this protocol cover?' },
  ],
  onConfirm: async ({ name, description }) => {
    if (!name) throw new Error('Name is required')
    await api.createProtocol({ name, description })
    await refresh()
  }
})

export async function renderProtocols(el) {
  el.innerHTML = `
    <div class="row between mb-16">
      <h2 style="margin-bottom:0">Protocols</h2>
      <button class="btn btn-primary btn-sm" id="btn-new-proto">+ New Protocol</button>
    </div>

    <div class="card mb-16 table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Steps</th><th></th></tr></thead>
        <tbody id="proto-tbody"></tbody>
      </table>
    </div>

    <div id="proto-detail" class="card" style="display:none">
      <h3 id="proto-detail-heading"></h3>

      <div class="table-wrap mt-8">
        <table>
          <thead><tr><th>Step</th><th>Sub-Protocol</th><th>Depends On</th></tr></thead>
          <tbody id="proto-steps-tbody"></tbody>
        </table>
      </div>

      <div class="mt-16">
        <h3>Add Step</h3>
        <div class="form-group mt-8">
          <label>Step Name</label>
          <input id="step-name" placeholder="e.g., Inspect Site" />
        </div>
        <div class="form-group">
          <label>Depends On (comma-separated step names)</label>
          <input id="step-deps" placeholder="e.g., Gather Materials, Design" />
        </div>
        <button class="btn btn-primary btn-sm" id="btn-add-step">Add Step</button>
      </div>
    </div>`

  document.getElementById('btn-new-proto').onclick = () => newModal.open()
  document.getElementById('btn-add-step').onclick  = addStep

  await refresh()
}

async function refresh() {
  const result   = await api.getProtocols()
  allProtocols   = Array.isArray(result) ? result : []
  const tbody    = document.getElementById('proto-tbody')
  if (!tbody) return

  tbody.innerHTML = allProtocols.length === 0
    ? `<tr><td colspan="5" class="empty">No protocols yet.</td></tr>`
    : allProtocols.map(p => `
        <tr>
          <td>${p.id}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.description ?? '—'}</td>
          <td>${(p.steps ?? []).length}</td>
          <td>
            <button class="btn btn-info btn-sm" data-proto-id="${p.id}">View Steps</button>
          </td>
        </tr>`).join('')

  tbody.querySelectorAll('[data-proto-id]').forEach(btn => {
    btn.onclick = () => showDetail(parseInt(btn.dataset.protoId))
  })

  if (selectedId) showDetail(selectedId)
}

function showDetail(id) {
  selectedId = id
  const proto  = allProtocols.find(p => p.id === id)
  if (!proto) return

  document.getElementById('proto-detail').style.display = 'block'
  document.getElementById('proto-detail-heading').textContent = `Steps — ${proto.name}`

  const tbody  = document.getElementById('proto-steps-tbody')
  const steps  = proto.steps ?? []
  tbody.innerHTML = steps.length === 0
    ? `<tr><td colspan="3" class="empty">No steps yet.</td></tr>`
    : steps.map(s => `
        <tr>
          <td>${s.name}</td>
          <td>${s.subProtocol?.name ?? '—'}</td>
          <td>${(s.dependsOn ?? []).join(', ') || '—'}</td>
        </tr>`).join('')
}

async function addStep() {
  if (!selectedId) return
  const name    = document.getElementById('step-name').value.trim()
  const depsRaw = document.getElementById('step-deps').value.trim()
  if (!name) { alert('Step name is required'); return }
  const dependsOn = depsRaw ? depsRaw.split(',').map(s => s.trim()).filter(Boolean) : []
  await api.addStep(selectedId, { name, dependsOn })
  document.getElementById('step-name').value = ''
  document.getElementById('step-deps').value = ''
  await refresh()
}
